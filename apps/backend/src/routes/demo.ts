import { Router } from "express";
import { config } from "../config/index.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { pool } from "../lib/db.js";
import { getProfileWithCompletion, getDocumentRequirements } from "../services/profile.service.js";
import { logAuditEvent } from "../services/audit.service.js";
import { demoProvider } from "../services/document-verification.service.js";
// import { recalculateAndPersistTrustScore } from "../services/trust-score.service.js"; // Assume this exists or similar

const router = Router();

router.get("/status", (req, res) => {
  res.json({ success: true, data: { demoMode: config.demoMode } });
});

router.post("/skip-documents", requireAuth, requireRole("borrower"), async (req, res) => {
  if (!config.demoMode) {
    return res.status(403).json({ success: false, error: { message: "Demo mode is disabled" } });
  }

  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const profileData = await getProfileWithCompletion(userId);
    if (!profileData) throw new Error("Profile not found");

    const doc_reqs = getDocumentRequirements(
      profileData.profile.role,
      profileData.profile.occupation
    );

    const reqResult = await client.query(
      `INSERT INTO verification_requests (
        user_id,
        verification_type,
        status,
        verification_source
      )
      VALUES ($1, 'document', 'approved', 'demo_verification')
      RETURNING request_id`,
      [userId]
    );

    const requestId = reqResult.rows[0].request_id;

    const createdRecords = [];

    for (const doc of doc_reqs) {
      const assessmentResult = await demoProvider.assess(
        doc.type,
        "demo_id"
      );

      const docResult = await client.query(
        `INSERT INTO verification_documents (
          request_id,
          document_type,
          file_url,
          document_status,
          assessment_result
        )
        VALUES ($1, $2, $3, 'demo_verified', $4)
        RETURNING *, document_id AS id`,
        [
          requestId,
          doc.type,
          `demo://${doc.type}`,
          assessmentResult,
        ]
      );

      createdRecords.push(docResult.rows[0]);
    }

    await client.query(
      `UPDATE user_profiles SET profile_completion_status = 'verified' WHERE user_id = $1`,
      [userId]
    );

    await logAuditEvent(userId, 'demo_skip_documents', 'user', userId, null, { skipped: true }, req);

    await client.query("COMMIT");

    // Note: If you need to trigger trust score recalculation, do it here.
    // await recalculateAndPersistTrustScore(userId);

    return res.json({ success: true, data: createdRecords });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Skip documents failed:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to skip documents" } });
  } finally {
    client.release();
  }
});

export default router;

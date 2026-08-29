import { Router } from "express";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";

const router = Router();

function requireAdmin(req: RequestWithAuth, res: any, next: any) {
  if (!req.auth || req.auth.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Admin access required" },
    });
  }
  return next();
}

// GET /api/v1/admin/users — list all users
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "50"), 10)));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM users`);
    const total = parseInt(countResult.rows[0].total, 10);

    const result = await pool.query(
      `SELECT
        u.user_id AS "userId",
        u.email,
        u.phone,
        u.role,
        u.account_status AS "accountStatus",
        u.email_verified AS "emailVerified",
        u.created_at AS "createdAt",
        up.full_name AS "fullName",
        up.profile_completion_status AS "profileCompletionStatus"
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.user_id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return res.status(200).json({
      success: true,
      data: { users: result.rows, total },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch users" },
    });
  }
});

// GET /api/v1/admin/partners — list funding partners
router.get("/partners", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        fp.partner_id AS "partnerId",
        fp.name,
        fp.type,
        fp.contact_email AS "contactEmail",
        fp.contact_phone AS "contactPhone",
        fp.is_active AS "isActive",
        fp.created_at AS "createdAt",
        COUNT(DISTINCT lp.product_id) AS "productCount",
        COUNT(DISTINCT la.application_id) AS "applicationCount"
       FROM funding_partners fp
       LEFT JOIN loan_products lp ON lp.partner_id = fp.partner_id
       LEFT JOIN loan_applications la ON la.partner_id = fp.partner_id
       GROUP BY fp.partner_id
       ORDER BY fp.name`,
    );

    return res.status(200).json({
      success: true,
      data: result.rows.map((row: any) => ({
        ...row,
        productCount: parseInt(row.productCount, 10),
        applicationCount: parseInt(row.applicationCount, 10),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch partners" },
    });
  }
});

// GET /api/v1/admin/stats — platform statistics
router.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS "totalUsers",
        (SELECT COUNT(*) FROM users WHERE role = 'borrower') AS "totalBorrowers",
        (SELECT COUNT(*) FROM users WHERE role = 'lender') AS "totalLenders",
        (SELECT COUNT(*) FROM loan_applications WHERE submitted_at >= CURRENT_DATE) AS "applicationsToday",
        (SELECT COUNT(*) FROM loan_applications WHERE status = 'approved') AS "approvedApplications",
        (SELECT COUNT(*) FROM loan_applications) AS "totalApplications",
        (SELECT COALESCE(SUM(principal_amount), 0) FROM loans WHERE status IN ('active', 'completed')) AS "totalDisbursed",
        (SELECT COUNT(*) FROM loans WHERE status = 'overdue') AS "overdueLoans",
        (SELECT COUNT(*) FROM loans WHERE status = 'active') AS "activeLoans",
        (SELECT COUNT(*) FROM verification_requests WHERE status = 'pending') AS "pendingVerifications"
    `);

    const stats = statsResult.rows[0] as any;
    const totalApps = parseInt(stats.totalApplications, 10);
    const approved = parseInt(stats.approvedApplications, 10);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: parseInt(stats.totalUsers, 10),
        totalBorrowers: parseInt(stats.totalBorrowers, 10),
        totalLenders: parseInt(stats.totalLenders, 10),
        applicationsToday: parseInt(stats.applicationsToday, 10),
        approvalRate: totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0,
        totalDisbursed: parseFloat(stats.totalDisbursed),
        overdueLoans: parseInt(stats.overdueLoans, 10),
        activeLoans: parseInt(stats.activeLoans, 10),
        pendingVerifications: parseInt(stats.pendingVerifications, 10),
      },
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch platform statistics" },
    });
  }
});

// PUT /api/v1/admin/applications/:id/review — approve/reject application
router.put("/applications/:id/review", requireAuth, requireAdmin, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const reviewerId = authReq.auth!.userId;

  const { decision, reason } = req.body as { decision: string; reason?: string };
  if (!decision || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({
      success: false,
      error: { message: "Decision must be 'approved' or 'rejected'" },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const appResult = await client.query(
      `SELECT application_id, user_id, partner_id, status
       FROM loan_applications
       WHERE application_id = $1
       FOR UPDATE`,
      [req.params.id],
    );

    if (appResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: { message: "Application not found" },
      });
    }

    const app = appResult.rows[0] as any;
    const oldStatus = app.status;

    // Update application status
    await client.query(
      `UPDATE loan_applications SET status = $1 WHERE application_id = $2`,
      [decision, req.params.id],
    );

    // Record partner decision if partner is associated
    if (app.partner_id) {
      await client.query(
        `INSERT INTO partner_decisions (application_id, partner_id, decision, reason, decided_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, app.partner_id, decision, reason ?? null, reviewerId],
      );
    }

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before_state, after_state)
       VALUES ($1, 'application_review', 'loan_application', $2, $3, $4)`,
      [
        reviewerId,
        req.params.id,
        JSON.stringify({ status: oldStatus }),
        JSON.stringify({ status: decision, reason }),
      ],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      data: { applicationId: req.params.id, status: decision },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to review application:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to review application" },
    });
  } finally {
    client.release();
  }
});

// PUT /api/v1/admin/verification/:id/review — approve/reject verification
router.put("/verification/:id/review", requireAuth, requireAdmin, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const reviewerId = authReq.auth!.userId;

  const { status, notes } = req.body as { status: string; notes?: string };
  if (!status || !["approved", "rejected", "needs_review"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: { message: "Status must be 'approved', 'rejected', or 'needs_review'" },
    });
  }

  try {
    const result = await pool.query(
      `UPDATE verification_requests
       SET status = $1, reviewer_id = $2, reviewer_notes = $3, reviewed_at = NOW()
       WHERE request_id = $4
       RETURNING request_id AS "requestId", user_id AS "userId", verification_type AS "verificationType", status`,
      [status, reviewerId, notes ?? null, req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Verification request not found" },
      });
    }

    // Update document statuses if approving/rejecting
    if (status === "approved") {
      await pool.query(
        `UPDATE verification_documents SET document_status = 'verified'
         WHERE request_id = $1 AND document_status IN ('uploaded', 'under_review')`,
        [req.params.id],
      );
    } else if (status === "rejected") {
      await pool.query(
        `UPDATE verification_documents SET document_status = 'rejected'
         WHERE request_id = $1 AND document_status IN ('uploaded', 'under_review')`,
        [req.params.id],
      );
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to review verification:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to review verification request" },
    });
  }
});

export default router;
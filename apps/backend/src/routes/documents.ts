import { Router } from "express";
import express from "express";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { pool } from "../lib/db.js";
import { fileStorage } from "../services/file-storage.service.js";
import path from "path";
import { auto_verify_docs } from "../services/profile.service";

const router = Router();
const documentStatus = auto_verify_docs ? "demo_verified" : "uploaded";
router.post("/upload", requireAuth, express.json({ limit: "10mb" }), async (req, res) => {
  const authReq = req as RequestWithAuth;
  let uploadedFileUrl: string | null = null;
  let databaseCommitted = false;
  try {
    const { documentType, fileName, mimeType, fileData } = req.body;
    const requestId = req.body.verificationRequestId ?? req.body.requestId;

    if (!fileData) {
      return res.status(400).json({ success: false, error: { message: "No file data provided" } });
    }

    if (!requestId) {
      return res
        .status(400)
        .json({ success: false, error: { message: "Verification request is required" } });
    }

    const requestResult = await pool.query(
      `SELECT request_id FROM verification_requests
       WHERE request_id = $1 AND user_id = $2`,
      [requestId, authReq.auth!.userId],
    );
    if (!requestResult.rows.length) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Verification request not found" } });
    }

    const buffer = Buffer.from(fileData, "base64");
    const { fileUrl } = await fileStorage.upload(buffer, fileName, mimeType);
    uploadedFileUrl = fileUrl;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO verification_documents
        (request_id, document_type, file_url, document_status)
        VALUES ($1, $2, $3, $4)
        RETURNING *, document_id AS id`,
        [requestId, documentType, fileUrl, documentStatus],
      );
      if (auto_verify_docs) {
        await client.query(
          `UPDATE verification_requests
          SET status = 'approved',
              verification_source = 'demo_verification',
              reviewed_at = NOW()
          WHERE request_id = $1`,
          [requestId],
        );
      }
      await client.query("COMMIT");
      databaseCommitted = true;
      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (uploadedFileUrl && !databaseCommitted) {
      try {
        await fileStorage.delete(uploadedFileUrl);
      } catch (cleanupError) {
        console.error("Failed to clean up an unpersisted document upload:", cleanupError);
      }
    }
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to upload document" } });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  try {
    const result = await pool.query(
      `SELECT vd.*, vd.document_id AS id FROM verification_documents vd
       JOIN verification_requests vr ON vr.request_id = vd.request_id
       WHERE vr.user_id = $1`,
      [authReq.auth!.userId],
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to list documents" } });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT vd.*, vd.document_id AS id FROM verification_documents vd
       JOIN verification_requests vr ON vr.request_id = vd.request_id
       WHERE vd.document_id = $1 AND vr.user_id = $2`,
      [id, authReq.auth!.userId],
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: { message: "Document not found" } });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to get document" } });
  }
});

router.get("/:id/file", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT vd.file_url FROM verification_documents vd
       JOIN verification_requests vr ON vr.request_id = vd.request_id
       WHERE vd.document_id = $1 AND vr.user_id = $2`,
      [id, authReq.auth!.userId],
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: { message: "Document not found" } });
    }
    const filePath = fileStorage.getFilePath(result.rows[0].file_url);
    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to send file" } });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const { id } = req.params;
  try {
    const docResult = await pool.query(
      `SELECT vd.document_id AS id, vd.file_url, vd.document_status FROM verification_documents vd
       JOIN verification_requests vr ON vr.request_id = vd.request_id
       WHERE vd.document_id = $1 AND vr.user_id = $2`,
      [id, authReq.auth!.userId],
    );
    if (!docResult.rows.length) {
      return res.status(404).json({ success: false, error: { message: "Document not found" } });
    }
    const doc = docResult.rows[0];
    if (doc.document_status !== "uploaded" && doc.document_status !== "rejected") {
      return res
        .status(403)
        .json({ success: false, error: { message: "Cannot delete document in current status" } });
    }

    await pool.query(`DELETE FROM verification_documents WHERE document_id = $1`, [id]);
    try {
      await fileStorage.delete(doc.file_url);
    } catch (cleanupError) {
      console.error("Failed to clean up a deleted document file:", cleanupError);
    }

    return res.json({ success: true, data: { success: true } });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to delete document" } });
  }
});

export default router;

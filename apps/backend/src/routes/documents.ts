import { Router } from "express";
import express from "express";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { pool } from "../lib/db.js";
import { fileStorage } from "../services/file-storage.service.js";
import path from "path";

const router = Router();

router.post("/upload", requireAuth, express.json({ limit: '10mb' }), async (req, res) => {
  const authReq = req as RequestWithAuth;
  try {
    const { documentType, fileName, mimeType, fileData, requestId } = req.body;
    
    if (!fileData) {
      return res.status(400).json({ success: false, error: { message: "No file data provided" } });
    }
    
    const buffer = Buffer.from(fileData, 'base64');
    const { fileUrl } = await fileStorage.upload(buffer, fileName, mimeType);
    
    const result = await pool.query(
      `INSERT INTO verification_documents (request_id, document_type, file_url, document_status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [requestId, documentType, fileUrl]
    );
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to upload document" } });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  try {
    const result = await pool.query(
      `SELECT vd.* FROM verification_documents vd
       JOIN verification_requests vr ON vr.id = vd.request_id
       WHERE vr.user_id = $1`,
      [authReq.auth!.userId]
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
      `SELECT vd.* FROM verification_documents vd
       JOIN verification_requests vr ON vr.id = vd.request_id
       WHERE vd.id = $1 AND vr.user_id = $2`,
      [id, authReq.auth!.userId]
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
       JOIN verification_requests vr ON vr.id = vd.request_id
       WHERE vd.id = $1 AND vr.user_id = $2`,
      [id, authReq.auth!.userId]
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
      `SELECT vd.id, vd.file_url, vd.document_status FROM verification_documents vd
       JOIN verification_requests vr ON vr.id = vd.request_id
       WHERE vd.id = $1 AND vr.user_id = $2`,
      [id, authReq.auth!.userId]
    );
    if (!docResult.rows.length) {
      return res.status(404).json({ success: false, error: { message: "Document not found" } });
    }
    const doc = docResult.rows[0];
    if (doc.document_status !== 'pending' && doc.document_status !== 'rejected') {
      return res.status(403).json({ success: false, error: { message: "Cannot delete document in current status" } });
    }
    
    await fileStorage.delete(doc.file_url);
    await pool.query(`DELETE FROM verification_documents WHERE id = $1`, [id]);
    
    return res.json({ success: true, data: { success: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to delete document" } });
  }
});

export default router;
import { Router } from "express";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { pool } from "../lib/db.js";

const router = Router();

router.post("/requests", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const { verificationType } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO verification_requests (user_id, verification_type) VALUES ($1, $2) RETURNING *`,
      [authReq.auth!.userId, verificationType]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to create request" } });
  }
});

router.get("/requests", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  try {
    const result = await pool.query(
      `SELECT vr.*, json_agg(vd.*) as documents 
       FROM verification_requests vr 
       LEFT JOIN verification_documents vd ON vd.request_id = vr.id 
       WHERE vr.user_id = $1 
       GROUP BY vr.id`,
      [authReq.auth!.userId]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to list requests" } });
  }
});

router.get("/requests/:id", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT vr.*, json_agg(vd.*) as documents 
       FROM verification_requests vr 
       LEFT JOIN verification_documents vd ON vd.request_id = vr.id 
       WHERE vr.id = $1 AND vr.user_id = $2
       GROUP BY vr.id`,
      [id, authReq.auth!.userId] // Basic ownership check via SQL
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: { message: "Request not found" } });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to get request" } });
  }
});

router.put("/requests/:id/review", requireAuth, requireRole('admin', 'partner_agent'), async (req, res) => {
  const authReq = req as RequestWithAuth;
  const { id } = req.params;
  const { status, reviewerNotes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE verification_requests 
       SET status = $1, reviewer_id = $2, reviewer_notes = $3, reviewed_at = NOW(), verification_source = 'manual'
       WHERE id = $4 RETURNING *`,
      [status, authReq.auth!.userId, reviewerNotes, id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: { message: "Request not found" } });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to review request" } });
  }
});

export default router;

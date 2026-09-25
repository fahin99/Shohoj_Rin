import { Router } from "express";
import { z } from "zod";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { pool } from "../lib/db.js";

const router = Router();

const guarantorUpsertSchema = z.object({
  fullName: z.string().trim().min(1, "Guarantor full name is required"),
  relationship: z.string().trim().min(1, "Relationship to guarantor is required"),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().or(z.literal("")).nullable(),
  nidNumber: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
});

const GUARANTOR_COLUMNS = `
  guarantor_id AS "guarantorId",
  full_name AS "fullName",
  relationship,
  phone,
  email,
  nid_number AS "nidNumber",
  address,
  is_verified AS "isVerified",
  created_at AS "createdAt"
`;

router.get("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  try {
    const result = await pool.query(
      `SELECT ${GUARANTOR_COLUMNS} FROM guarantors
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [authReq.auth!.userId],
    );
    return res.status(200).json({ success: true, data: result.rows[0] ?? null });
  } catch (error) {
    console.error("Failed to fetch guarantor:", error);
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to fetch guarantor" } });
  }
});

router.put("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const parsed = guarantorUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid guarantor data", details: parsed.error.flatten() },
    });
  }
  const { fullName, relationship, phone, email, nidNumber, address } = parsed.data;
  const userId = authReq.auth!.userId;

  try {
    const existing = await pool.query(
      `SELECT guarantor_id FROM guarantors WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );

    const values = [
      fullName,
      relationship,
      phone || null,
      email || null,
      nidNumber || null,
      address || null,
    ];

    const result =
      existing.rows.length > 0
        ? await pool.query(
            `UPDATE guarantors
             SET full_name = $1, relationship = $2, phone = $3, email = $4, nid_number = $5, address = $6
             WHERE guarantor_id = $7
             RETURNING ${GUARANTOR_COLUMNS}`,
            [...values, existing.rows[0].guarantor_id],
          )
        : await pool.query(
            `INSERT INTO guarantors (user_id, full_name, relationship, phone, email, nid_number, address)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING ${GUARANTOR_COLUMNS}`,
            [userId, ...values],
          );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Failed to save guarantor:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to save guarantor" } });
  }
});

export default router;

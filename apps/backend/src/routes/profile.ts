import { Router } from "express";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { getProfileWithCompletion, updateProfile } from "../services/profile.service.js";
import { logAuditEvent } from "../services/audit.service.js";
import { pool } from "../lib/db.js";
import { profileUpdateSchema, usernameUpdateSchema } from "@shohojrin/shared";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  try {
    const profileData = await getProfileWithCompletion(authReq.auth!.userId);
    if (!profileData) {
      return res.status(404).json({ success: false, error: { message: "Profile not found" } });
    }
    return res.json({ success: true, data: profileData });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: "Failed to get profile" } });
  }
});

router.put("/username", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const parsed = usernameUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid username", details: parsed.error.flatten() },
    });
  }

  const newUsername = parsed.data.username.trim();
  const client = await pool.connect();
  try {
    const existing = await client.query(
      `SELECT user_id FROM users WHERE LOWER(username) = LOWER($1) AND user_id != $2 LIMIT 1`,
      [newUsername, userId],
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: { message: "This username is already taken" },
      });
    }

    await client.query(
      `UPDATE users SET username = $1, updated_at = NOW() WHERE user_id = $2`,
      [newUsername, userId],
    );

    await logAuditEvent(
      userId,
      "update_username",
      "user",
      userId,
      null,
      { username: newUsername },
      req,
    );

    return res.json({ success: true, data: { username: newUsername } });
  } catch (error) {
    console.error("Failed to update username:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to update username" } });
  } finally {
    client.release();
  }
});

router.put("/", requireAuth, requireRole("borrower", "lender"), async (req, res) => {
  const authReq = req as RequestWithAuth;
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid profile data", details: parsed.error.flatten() },
    });
  }

  try {
    const updated = await updateProfile(authReq.auth!.userId, parsed.data);
    if (!updated) {
      return res.status(400).json({ success: false, error: { message: "No fields to update" } });
    }
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    if (error?.code === "USERNAME_TAKEN") {
      return res.status(409).json({
        success: false,
        error: { message: "This username is already taken" },
      });
    }
    if (error?.code === "23505") {
      return res.status(409).json({
        success: false,
        error: { message: "This National ID number or username is already registered to another account" },
      });
    }
    if (error?.code === "23503") {
      return res.status(400).json({
        success: false,
        error: { message: "Selected institution is invalid or does not exist" },
      });
    }
    if (error?.code === "22007" || error?.code === "22008") {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid date format provided" },
      });
    }
    return res.status(500).json({ success: false, error: { message: "Failed to update profile" } });
  }
});

router.get("/completion", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  try {
    const profileData = await getProfileWithCompletion(authReq.auth!.userId);
    if (!profileData) {
      return res.status(404).json({ success: false, error: { message: "Profile not found" } });
    }
    return res.json({ success: true, data: profileData.completionItems });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to get completion status" } });
  }
});

router.post("/submit-verification", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  try {
    await pool.query(
      `UPDATE user_profiles SET profile_completion_status = 'pending_verification' WHERE user_id = $1`,
      [userId],
    );
    await logAuditEvent(
      userId,
      "submit_profile_verification",
      "user_profile",
      userId,
      null,
      { status: "pending_verification" },
      req,
    );
    return res.json({ success: true, data: { status: "pending_verification" } });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to submit verification" } });
  }
});

export default router;

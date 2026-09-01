import { Router } from "express";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { getProfileWithCompletion, updateProfile } from "../services/profile.service.js";
import { logAuditEvent } from "../services/audit.service.js";
import { pool } from "../lib/db.js";
import { profileUpdateSchema } from "@shohojrin/shared";

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
  } catch (error) {
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

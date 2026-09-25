import { Router } from "express";
import { z } from "zod";
import type { PoolClient } from "pg";
import { registerSchema } from "@shohojrin/shared";
import { pool } from "../lib/db.js";
import {
  clearSessionCookie,
  comparePassword,
  generateSessionId,
  hashPassword,
  normalizeEmail,
  normalizePhone,
  setSessionCookie,
} from "../lib/auth.js";
import {
  requireAuth,
  requireUserProfile,
  type RequestWithAuth,
} from "../middleware/authenticate.js";
const router = Router();
const loginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(5).optional(),
    username: z.string().trim().min(3).optional(),
    identifier: z.string().trim().min(3).optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((value) => Boolean(value.email || value.phone || value.username || value.identifier), {
    message: "Email, phone, or username is required",
    path: ["identifier"],
  });
type AuthUserRow = {
  user_id: string;
  username: string | null;
  email: string;
  phone: string | null;
  role: string;
  account_status: string;
  email_verified: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};
function serializeUser(row: AuthUserRow) {
  return {
    userId: row.user_id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    role: row.role,
    accountStatus: row.account_status,
    emailVerified: row.email_verified,
    profileCompletionStatus: null,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : new Date(row.updated_at).toISOString(),
    profile: {
      fullName: null,
      dateOfBirth: null,
      gender: null,
      city: null,
      district: null,
      occupation: null,
      nidNumber: null,
      addressLine: null,
      postalCode: null,
      monthlyFamilyIncome: null,
      employmentType: null,
      employerName: null,
      monthlyIncome: null,
      incomeSource: null,
      studentId: null,
      enrollmentYear: null,
      institutionId: null,
      profilePhotoUrl: null,
    },
  };
}
async function createSession(db: Pick<PoolClient, "query">, userId: string, sessionId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO login_sessions (session_id, user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3, $4)`,
    [sessionId, userId, "session-auth", expiresAt],
  );
}
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid registration data", details: parsed.error.flatten() },
    });
  }
  const username = parsed.data.username.trim();
  const email = normalizeEmail(parsed.data.email);
  const phone = normalizePhone(parsed.data.phone);
  const passwordHash = await hashPassword(parsed.data.password);
  const client = await pool.connect();
  const sessionId = generateSessionId();
  try {
    await client.query("BEGIN");
    const existingUser = await client.query(
      `SELECT user_id FROM users
       WHERE (username IS NOT NULL AND LOWER(username) = LOWER($1))
          OR LOWER(email) = LOWER($2)
          OR ($3::varchar IS NOT NULL AND phone = $3)
       LIMIT 1`,
      [username, email, phone],
    );
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        error: { message: "An account with this username, email, or phone already exists" },
      });
    }
    const role = parsed.data.role || "borrower";
    const userResult = await client.query<AuthUserRow & { role: string }>(
      `INSERT INTO users (username, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, username, email, phone, role, account_status, email_verified,
         created_at, updated_at`,
      [username, email, phone, passwordHash, role],
    );
    const user = userResult.rows[0];
    await client.query(`INSERT INTO user_profiles (user_id) VALUES ($1)`, [user.user_id]);
    await createSession(client, user.user_id, sessionId);
    await client.query("COMMIT");
    setSessionCookie(res, sessionId);
    return res.status(201).json({
      success: true,
      data: { user: serializeUser(user) },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return res.status(409).json({
        success: false,
        error: { message: "An account with this username, email, or phone already exists" },
      });
    }
    console.error("Registration failed:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to create account" } });
  } finally {
    client.release();
  }
});
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid login data", details: parsed.error.flatten() },
    });
  }
  const email = parsed.data.email ? normalizeEmail(parsed.data.email) : null;
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : null;
  const username = parsed.data.username ? parsed.data.username.trim() : null;
  const identifier = parsed.data.identifier ? parsed.data.identifier.trim() : null;
  const client = await pool.connect();
  try {
    const userResult = await client.query<AuthUserRow & { password_hash: string }>(
      `SELECT u.user_id, u.username, u.email, u.phone, u.role, u.account_status,
         u.email_verified, u.created_at, u.updated_at,
        u.password_hash
       FROM users u
       WHERE LOWER(u.email) = LOWER($1)
          OR u.phone = $2
          OR (u.username IS NOT NULL AND LOWER(u.username) = LOWER($3))
          OR ($4::text IS NOT NULL AND (
               LOWER(u.email) = LOWER($4)
               OR u.phone = $4
               OR (u.username IS NOT NULL AND LOWER(u.username) = LOWER($4))
             ))
       LIMIT 1`,
      [email, phone, username, identifier],
    );
    const user = userResult.rows[0];
    if (!user)
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid username/email/phone or password" } });
    if (!(await comparePassword(parsed.data.password, user.password_hash)))
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid username/email/phone or password" } });
    if (user.account_status !== "active")
      return res.status(403).json({ success: false, error: { message: "Account is not active" } });
    const sessionId = generateSessionId();
    await createSession(client, user.user_id, sessionId);
    setSessionCookie(res, sessionId);
    return res.status(200).json({ success: true, data: { user: serializeUser(user) } });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to log in" } });
  } finally {
    client.release();
  }
});
router.post("/logout", async (req, res) => {
  const sessionId =
    typeof req.cookies?.shohojrin_session === "string" ? req.cookies.shohojrin_session : null;
  if (sessionId) {
    try {
      await pool.query(`UPDATE login_sessions SET is_revoked = TRUE WHERE session_id = $1`, [
        sessionId,
      ]);
    } catch {}
  }
  clearSessionCookie(res);
  return res.status(200).json({ success: true, data: { message: "Logged out successfully" } });
});
router.get("/me", requireAuth, requireUserProfile, (req, res) => {
  const authReq = req as RequestWithAuth;
  return res
    .status(200)
    .json({ success: true, data: { user: authReq.user, session: authReq.auth } });
});
router.get("/session", requireAuth, requireUserProfile, (req, res) => {
  const authReq = req as RequestWithAuth;
  return res.status(200).json({
    success: true,
    data: { authenticated: true, user: authReq.user, session: authReq.auth },
  });
});
export default router;

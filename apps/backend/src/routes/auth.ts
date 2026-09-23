import { Router } from "express";
import { z } from "zod";
import type { PoolClient } from "pg";
import { pool } from "../lib/db.js";
import {
  clearAuthCookies,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  generateSessionId,
  hashPassword,
  hashToken,
  normalizeEmail,
  normalizePhone,
  setAuthCookies,
  verifyRefreshToken,
} from "../lib/auth.js";
import { requireAuth, requireUserProfile, type RequestWithAuth } from "../middleware/authenticate.js";
const router = Router();
const registerSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().trim().email("A valid email address is required"),
  phone: z.string().trim().min(5).optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["borrower", "lender"]).optional().default("borrower"),
});
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
const refreshSchema = z.object({
  refreshToken: z.string().optional(),
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
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
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
async function createSession(db: Pick<PoolClient, "query">, userId: string, role: string, sessionId: string) {
  const accessToken = createAccessToken(userId, sessionId, role);
  const refreshToken = createRefreshToken(userId, sessionId);
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO login_sessions (session_id, user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3, $4)`,
    [sessionId, userId, refreshTokenHash, expiresAt],
  );
  return { accessToken, refreshToken, expiresAt };
}
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: "Invalid registration data", details: parsed.error.flatten() } });
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
      `SELECT user_id FROM users WHERE username = $1 OR email = $2 OR ($3::varchar IS NOT NULL AND phone = $3) LIMIT 1`,
      [username, email, phone],
    );
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, error: { message: "An account with this username, email, or phone already exists" } });
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
    const session = await createSession(client, user.user_id, user.role, sessionId);
    await client.query("COMMIT");
    setAuthCookies(res, session.accessToken, session.refreshToken);
    return res.status(201).json({
      success: true,
      data: { user: serializeUser(user) },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "23505") {
      return res.status(409).json({ success: false, error: { message: "An account with this username, email, or phone already exists" } });
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
    return res.status(400).json({ success: false, error: { message: "Invalid login data", details: parsed.error.flatten() } });
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
       WHERE u.email = $1 OR u.phone = $2 OR u.username = $3
          OR ($4::text IS NOT NULL AND (u.email = $4 OR u.phone = $4 OR u.username = $4))
       LIMIT 1`,
      [email, phone, username, identifier],
    );
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ success: false, error: { message: "Invalid username/email/phone or password" } });
    if (!(await comparePassword(parsed.data.password, user.password_hash))) return res.status(401).json({ success: false, error: { message: "Invalid username/email/phone or password" } });
    if (user.account_status !== "active") return res.status(403).json({ success: false, error: { message: "Account is not active" } });
    const sessionId = generateSessionId();
    const session = await createSession(client, user.user_id, user.role, sessionId);
    setAuthCookies(res, session.accessToken, session.refreshToken);
    return res.status(200).json({ success: true, data: { user: serializeUser(user) } });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to log in" } });
  } finally {
    client.release();
  }
});
router.post("/refresh", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: { message: "Invalid refresh request" } });
  const refreshToken = parsed.data.refreshToken ?? (typeof req.cookies?.shohojrin_refresh_token === "string" ? req.cookies.shohojrin_refresh_token : null);
  if (!refreshToken) return res.status(401).json({ success: false, error: { message: "Refresh token is required" } });
  try {
    const claims = verifyRefreshToken(refreshToken) as { tokenType?: string; sub?: string; jti?: string };
    if (claims.tokenType !== "refresh" || !claims.sub || !claims.jti) return res.status(401).json({ success: false, error: { message: "Invalid refresh token" } });
    const sessionResult = await pool.query<AuthUserRow & { session_id: string; refresh_token_hash: string; is_revoked: boolean; expires_at: Date | string }>(
      `SELECT s.session_id, s.user_id, s.refresh_token_hash, s.is_revoked, s.expires_at,
         u.username, u.email, u.phone, u.role, u.account_status, u.email_verified,
         u.created_at, u.updated_at
       FROM login_sessions s INNER JOIN users u ON u.user_id = s.user_id
       WHERE s.session_id = $1 AND s.user_id = $2 LIMIT 1`,
      [claims.jti, claims.sub],
    );
    const session = sessionResult.rows[0];
    if (!session || session.is_revoked) return res.status(401).json({ success: false, error: { message: "Session is no longer valid" } });
    const tokenMatches = hashToken(refreshToken) === session.refresh_token_hash;
    const expiresAt = session.expires_at instanceof Date ? session.expires_at : new Date(session.expires_at);
    if (!tokenMatches || expiresAt.getTime() < Date.now()) return res.status(401).json({ success: false, error: { message: "Refresh token has expired" } });
    const accessToken = createAccessToken(session.user_id, session.session_id, session.role);
    const nextRefreshToken = createRefreshToken(session.user_id, session.session_id);
    await pool.query(`UPDATE login_sessions SET refresh_token_hash = $1, expires_at = $2 WHERE session_id = $3`, [hashToken(nextRefreshToken), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), session.session_id]);
    setAuthCookies(res, accessToken, nextRefreshToken);
    return res.status(200).json({ success: true, data: { user: serializeUser(session) } });
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid or expired refresh token" } });
  }
});
router.post("/logout", async (req, res) => {
  const refreshToken = typeof req.cookies?.shohojrin_refresh_token === "string" ? req.cookies.shohojrin_refresh_token : typeof req.body?.refreshToken === "string" ? req.body.refreshToken : null;
  if (refreshToken) {
    try {
      const claims = verifyRefreshToken(refreshToken) as { jti?: string };
      if (claims.jti) await pool.query(`UPDATE login_sessions SET is_revoked = TRUE WHERE session_id = $1`, [claims.jti]);
    } catch {}
  }
  clearAuthCookies(res);
  return res.status(200).json({ success: true, data: { message: "Logged out successfully" } });
});
router.get("/me", requireAuth, requireUserProfile, (req, res) => {
  const authReq = req as RequestWithAuth;
  return res.status(200).json({ success: true, data: { user: authReq.user, session: authReq.auth } });
});
router.get("/session", requireAuth, requireUserProfile, (req, res) => {
  const authReq = req as RequestWithAuth;
  return res.status(200).json({ success: true, data: { authenticated: true, user: authReq.user, session: authReq.auth } });
});
export default router;

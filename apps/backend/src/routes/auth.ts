import { Router } from "express";
import { z } from "zod";
import type { PoolClient } from "pg";
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
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
const router = Router();
const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("A valid email address is required"),
  phone: z.string().trim().min(5).optional().nullable(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
const loginSchema = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(5).optional(),
    identifier: z.string().trim().min(3).optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((value) => Boolean(value.email || value.phone || value.identifier), {
    message: "Email or phone is required",
    path: ["identifier"],
  });
type UserQueryRow = {
  user_id: string;
  email: string;
  phone: string | null;
  role: string;
  account_status: string;
  email_verified: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  full_name: string | null;
  date_of_birth: Date | string | null;
  gender: string | null;
  city: string | null;
  district: string | null;
  occupation: string | null;
};
function serializeUser(row: UserQueryRow) {
  return {
    userId: row.user_id,
    email: row.email,
    phone: row.phone,
    role: row.role,
    accountStatus: row.account_status,
    emailVerified: row.email_verified,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    updatedAt:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : new Date(row.updated_at).toISOString(),
    profile: {
      fullName: row.full_name,
      dateOfBirth: row.date_of_birth
        ? row.date_of_birth instanceof Date
          ? row.date_of_birth.toISOString().slice(0, 10)
          : String(row.date_of_birth).slice(0, 10)
        : null,
      gender: row.gender,
      city: row.city,
      district: row.district,
      occupation: row.occupation,
    },
  };
}
async function fetchUserById(userId: string) {
  const result = await pool.query<UserQueryRow>(
    `SELECT
      u.user_id,
      u.email,
      u.phone,
      u.role,
      u.account_status,
      u.email_verified,
      u.created_at,
      u.updated_at,
      p.full_name,
      p.date_of_birth,
      p.gender,
      p.city,
      p.district,
      p.occupation
    FROM users u
    LEFT JOIN user_profiles p ON p.user_id = u.user_id
    WHERE u.user_id = $1
    LIMIT 1`,
    [userId],
  );
  return result.rows[0] ?? null;
}
async function createSession(
  db: Pick<PoolClient, "query">,
  userId: string,
  sessionId: string,
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.query(
    `INSERT INTO login_sessions (session_id, user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, userId, "session-auth", expiresAt],
  );
  return { expiresAt };
}
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid registration data",
        details: parsed.error.flatten(),
      },
    });
  }
  const fullName = parsed.data.fullName.trim();
  const email = normalizeEmail(parsed.data.email);
  const phone = normalizePhone(parsed.data.phone);
  const passwordHash = await hashPassword(parsed.data.password);
  const client = await pool.connect();
  const sessionId = generateSessionId();
  try {
    await client.query("BEGIN");
    const existingUser = await client.query(
      `SELECT user_id FROM users WHERE email = $1 OR ($2::varchar IS NOT NULL AND phone = $2) LIMIT 1`,
      [email, phone],
    );
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        error: { message: "An account with this email or phone already exists" },
      });
    }
    const userResult = await client.query(
      `INSERT INTO users (email, phone, password_hash, role)
       VALUES ($1, $2, $3, 'borrower')
       RETURNING user_id, email, phone, role, account_status, email_verified, created_at, updated_at`,
      [email, phone, passwordHash],
    );
    const user = userResult.rows[0] as {
      user_id: string;
      role: string;
    };
    await client.query(
      `INSERT INTO user_profiles (user_id, full_name)
       VALUES ($1, $2)`,
      [user.user_id, fullName],
    );
    await createSession(client, user.user_id, sessionId);
    await client.query("COMMIT");
    setSessionCookie(res, sessionId);
    const profile = await fetchUserById(user.user_id);
    return res.status(201).json({
      success: true,
      data: {
        user: profile ? serializeUser(profile) : null,
      },
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
        error: { message: "An account with this email or phone already exists" },
      });
    }
    console.error("Registration failed:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to create account" },
    });
  } finally {
    client.release();
  }
});
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid login data",
        details: parsed.error.flatten(),
      },
    });
  }
  const email = parsed.data.email ? normalizeEmail(parsed.data.email) : null;
  const phone = parsed.data.phone ? normalizePhone(parsed.data.phone) : null;
  const identifier = parsed.data.identifier ? parsed.data.identifier.trim() : null;
  const client = await pool.connect();
  try {
    const userResult = await client.query<{
      user_id: string;
      email: string;
      phone: string | null;
      role: string;
      account_status: string;
      password_hash: string;
    }>(
      `SELECT user_id, email, phone, role, account_status, password_hash
       FROM users
       WHERE email = $1
          OR phone = $2
          OR ($3::text IS NOT NULL AND (email = $3 OR phone = $3))
       LIMIT 1`,
      [email, phone, identifier],
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email/phone or password" },
      });
    }
    const passwordMatches = await comparePassword(parsed.data.password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email/phone or password" },
      });
    }
    if (user.account_status !== "active") {
      return res.status(403).json({
        success: false,
        error: { message: "Account is not active" },
      });
    }
    const sessionId = generateSessionId();
    await createSession(client, user.user_id, sessionId);
    setSessionCookie(res, sessionId);
    const profile = await fetchUserById(user.user_id);
    return res.status(200).json({
      success: true,
      data: {
        user: profile ? serializeUser(profile) : null,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to log in" },
    });
  } finally {
    client.release();
  }
});
router.post("/logout", async (req, res) => {
  const sessionId = typeof req.cookies?.shohojrin_session === "string"
    ? req.cookies.shohojrin_session
    : null;
  if (sessionId) {
    try {
      await pool.query(
        `UPDATE login_sessions
         SET is_revoked = TRUE
         WHERE session_id = $1`,
        [sessionId],
      );
    } catch {
    }
  }
  clearSessionCookie(res);
  return res.status(200).json({
    success: true,
    data: { message: "Logged out successfully" },
  });
});
router.get("/me", requireAuth, (req, res) => {
  const authReq = req as RequestWithAuth;
  return res.status(200).json({
    success: true,
    data: {
      user: authReq.user,
      session: authReq.auth,
    },
  });
});
router.get("/session", requireAuth, (req, res) => {
  const authReq = req as RequestWithAuth;
  return res.status(200).json({
    success: true,
    data: {
      authenticated: true,
      user: authReq.user,
      session: authReq.auth,
    },
  });
});
export default router;

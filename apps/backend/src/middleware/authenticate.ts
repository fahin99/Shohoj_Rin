import type { NextFunction, Request, Response } from "express";
import { pool } from "../lib/db.js";
import { getSessionIdFromCookie } from "../lib/auth.js";
export interface RequestWithAuth extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    role: string;
  };
  user?: {
    userId: string;
    email: string;
    phone: string | null;
    role: string;
    accountStatus: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    fullName: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    city: string | null;
    district: string | null;
    occupation: string | null;
  };
}
export async function requireAuth(req: RequestWithAuth, res: Response, next: NextFunction) {
  try {
    const sessionId = getSessionIdFromCookie(req.cookies);
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: { message: "Authentication required" },
      });
    }
    const sessionResult = await pool.query(
      `SELECT s.session_id, s.user_id, s.is_revoked, s.expires_at, u.role
       FROM login_sessions s
       INNER JOIN users u ON u.user_id = s.user_id
       WHERE s.session_id = $1
       LIMIT 1`,
      [sessionId],
    );
    const session = sessionResult.rows[0] as {
      session_id: string;
      user_id: string;
      is_revoked: boolean;
      expires_at: Date | string;
      role: string;
    } | undefined;
    if (!session || session.is_revoked) {
      return res.status(401).json({
        success: false,
        error: { message: "Session is no longer valid" },
      });
    }
    const expiresAt =
      session.expires_at instanceof Date ? session.expires_at : new Date(session.expires_at);
    if (expiresAt.getTime() < Date.now()) {
      return res.status(401).json({
        success: false,
        error: { message: "Session has expired" },
      });
    }
    const userResult = await pool.query(
      `SELECT
        u.user_id AS "userId",
        u.email,
        u.phone,
        u.role,
        u.account_status AS "accountStatus",
        u.email_verified AS "emailVerified",
        u.created_at AS "createdAt",
        u.updated_at AS "updatedAt",
        p.full_name AS "fullName",
        p.date_of_birth AS "dateOfBirth",
        p.gender,
        p.city,
        p.district,
        p.occupation
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.user_id
      WHERE u.user_id = $1
      LIMIT 1`,
      [session.user_id],
    );
    const row = userResult.rows[0] as RequestWithAuth["user"] | undefined;
    if (!row) {
      return res.status(401).json({
        success: false,
        error: { message: "User not found" },
      });
    }
    req.auth = {
      userId: session.user_id,
      sessionId: session.session_id,
      role: session.role,
    };
    req.user = row;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired session" },
    });
  }
}

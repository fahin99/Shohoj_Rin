import type { NextFunction, Request, Response } from "express";
import { pool } from "../lib/db.js";
import { getAuthTokenFromCookiesOrHeaders, verifyAccessToken } from "../lib/auth.js";
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
    const token = getAuthTokenFromCookiesOrHeaders(req.cookies, req.header("authorization"));
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "Authentication required" },
      });
    }
    const decoded = verifyAccessToken(token) as {
      tokenType?: string;
      role?: string;
      sub?: string;
      jti?: string;
    };
    if (decoded.tokenType !== "access" || !decoded.sub || !decoded.jti || !decoded.role) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid access token" },
      });
    }
    const userResult = await pool.query<{
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
      sessionId: string | null;
      isRevoked: boolean | null;
      sessionExpiresAt: Date | string | null;
    }>(
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
        p.occupation,
        s.session_id AS "sessionId",
        s.is_revoked AS "isRevoked",
        s.expires_at AS "sessionExpiresAt"
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.user_id
      LEFT JOIN login_sessions s ON s.session_id = $2 AND s.user_id = u.user_id
      WHERE u.user_id = $1
      LIMIT 1`,
      [decoded.sub, decoded.jti],
    );
    const row = userResult.rows[0];
    if (!row) {
      return res.status(401).json({
        success: false,
        error: { message: "User not found" },
      });
    }
    if (!row.sessionId || row.isRevoked) {
      return res.status(401).json({
        success: false,
        error: { message: "Session is no longer valid or has been revoked" },
      });
    }
    if (row.sessionExpiresAt) {
      const expiresAt =
        row.sessionExpiresAt instanceof Date
          ? row.sessionExpiresAt
          : new Date(row.sessionExpiresAt);
      if (expiresAt.getTime() < Date.now()) {
        return res.status(401).json({
          success: false,
          error: { message: "Session has expired" },
        });
      }
    }
    if (row.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        error: { message: "Account is not active" },
      });
    }
    req.auth = {
      userId: decoded.sub,
      sessionId: decoded.jti,
      role: decoded.role,
    };
    req.user = {
      userId: row.userId,
      email: row.email,
      phone: row.phone,
      role: row.role,
      accountStatus: row.accountStatus,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      fullName: row.fullName,
      dateOfBirth: row.dateOfBirth,
      gender: row.gender,
      city: row.city,
      district: row.district,
      occupation: row.occupation,
    };
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired access token" },
    });
  }
}

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

    const userResult = await pool.query(
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
      [decoded.sub],
    );

    const row = userResult.rows[0] as RequestWithAuth["user"] | undefined;
    if (!row) {
      return res.status(401).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    req.auth = {
      userId: decoded.sub,
      sessionId: decoded.jti,
      role: decoded.role,
    };
    req.user = row;

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired access token" },
    });
  }
}

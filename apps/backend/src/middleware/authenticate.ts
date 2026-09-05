import type { NextFunction, Request, Response } from "express";
import { pool } from "../lib/db.js";
import { getAuthTokenFromCookiesOrHeaders, verifyAccessToken } from "../lib/auth.js";
export interface RequestWithAuth extends Request {
  auth?: { userId: string; sessionId: string; role: string };
  user?: {
    userId: string;
    username: string | null;
    email: string;
    phone: string | null;
    role: string;
    accountStatus: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    profileCompletionStatus: string | null;
    profile: {
      fullName: string | null;
      dateOfBirth: string | null;
      gender: string | null;
      city: string | null;
      district: string | null;
      occupation: string | null;
      nidNumber: string | null;
      addressLine: string | null;
      postalCode: string | null;
      monthlyFamilyIncome: number | string | null;
      employmentType: string | null;
      employerName: string | null;
      monthlyIncome: number | string | null;
      incomeSource: string | null;
      studentId: string | null;
      enrollmentYear: number | null;
      institutionId: string | null;
      profilePhotoUrl: string | null;
    };
  };
}
export async function requireAuth(req: RequestWithAuth, res: Response, next: NextFunction) {
  try {
    const token = getAuthTokenFromCookiesOrHeaders(req.cookies, req.header("authorization"));
    if (!token) return res.status(401).json({ success: false, error: { message: "Authentication required" } });
    const decoded = verifyAccessToken(token) as { tokenType?: string; role?: string; sub?: string; jti?: string };
    if (decoded.tokenType !== "access" || !decoded.sub || !decoded.jti || !decoded.role) return res.status(401).json({ success: false, error: { message: "Invalid access token" } });
    const userResult = await pool.query(
      `SELECT
        u.user_id AS "userId", u.username, u.email, u.phone, u.role,
        u.account_status AS "accountStatus", u.email_verified AS "emailVerified",
        u.created_at AS "createdAt", u.updated_at AS "updatedAt",
        p.profile_completion_status AS "profileCompletionStatus",
        p.full_name AS "fullName", p.date_of_birth AS "dateOfBirth", p.gender,
        p.city, p.district, p.occupation, p.nid_number AS "nidNumber",
        p.address_line AS "addressLine", p.postal_code AS "postalCode",
        p.monthly_family_income AS "monthlyFamilyIncome", p.employment_type AS "employmentType",
        p.employer_name AS "employerName", p.monthly_income AS "monthlyIncome",
        p.income_source AS "incomeSource", p.student_id AS "studentId",
        p.enrollment_year AS "enrollmentYear", p.institution_id AS "institutionId",
        p.profile_photo_url AS "profilePhotoUrl",
        s.is_revoked AS "isRevoked", s.expires_at AS "sessionExpiresAt"
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.user_id
      LEFT JOIN login_sessions s ON s.session_id = $2
      WHERE u.user_id = $1 LIMIT 1`,
      [decoded.sub, decoded.jti],
    );
    const row = userResult.rows[0];
    if (!row) return res.status(401).json({ success: false, error: { message: "User not found" } });
    if (row.isRevoked === true || new Date(row.sessionExpiresAt).getTime() < Date.now()) {
      return res.status(401).json({ success: false, error: { message: "Session expired or revoked" } });
    }

    req.auth = { userId: decoded.sub, sessionId: decoded.jti, role: decoded.role };
    req.user = {
      userId: row.userId,
      username: row.username,
      email: row.email,
      phone: row.phone,
      role: row.role,
      accountStatus: row.accountStatus,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : new Date(row.updatedAt).toISOString(),
      profileCompletionStatus: row.profileCompletionStatus,
      profile: {
        fullName: row.fullName,
        dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth).toISOString().slice(0, 10) : null,
        gender: row.gender,
        city: row.city,
        district: row.district,
        occupation: row.occupation,
        nidNumber: row.nidNumber,
        addressLine: row.addressLine,
        postalCode: row.postalCode,
        monthlyFamilyIncome: row.monthlyFamilyIncome,
        employmentType: row.employmentType,
        employerName: row.employerName,
        monthlyIncome: row.monthlyIncome,
        incomeSource: row.incomeSource,
        studentId: row.studentId,
        enrollmentYear: row.enrollmentYear,
        institutionId: row.institutionId,
        profilePhotoUrl: row.profilePhotoUrl,
      },
    };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: { message: "Invalid or expired access token" } });
  }
}

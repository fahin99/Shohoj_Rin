import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { CookieOptions, Response } from "express";
import { config } from "../config/index.js";
const BCRYPT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "shohojrin_session";
export function sessionCookieOptions(): CookieOptions {
  const isProduction = config.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
export function normalizePhone(phone?: string | null) {
  if (!phone) {
    return null;
  }
  const normalized = phone.replace(/[^\d+]/g, "").trim();
  return normalized.length > 0 ? normalized : null;
}
export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
export function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
export function generateSessionId() {
  return crypto.randomUUID();
}
export function setSessionCookie(res: Response, sessionId: string) {
  res.cookie(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions());
}
export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
}
export function getSessionIdFromCookie(cookies: Record<string, unknown>): string | null {
  const value = cookies[SESSION_COOKIE_NAME];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return null;
}

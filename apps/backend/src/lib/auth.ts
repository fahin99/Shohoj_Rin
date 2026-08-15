import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";

import { config } from "../config/index.js";

const BCRYPT_ROUNDS = 12;
const REFRESH_COOKIE_NAME = "shohojrin_refresh_token";
const ACCESS_COOKIE_NAME = "shohojrin_access_token";

export function accessCookieOptions(): CookieOptions {
  return getCookieOptions(15 * 60 * 1000);
}

export function refreshCookieOptions(): CookieOptions {
  return getCookieOptions(7 * 24 * 60 * 60 * 1000);
}

function getCookieOptions(maxAgeMs: number): CookieOptions {
  const isProduction = config.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    // The frontend proxies API calls through its own origin, so Lax gives us
    // CSRF protection without sacrificing the cookie-based session flow.
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
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

export function createAccessToken(userId: string, sessionId: string, role: string) {
  return jwt.sign({ tokenType: "access", role }, config.jwt.accessSecret, {
    subject: userId,
    jwtid: sessionId,
    expiresIn: config.jwt.accessExpiresIn,
  });
}

export function createRefreshToken(userId: string, sessionId: string) {
  return jwt.sign({ tokenType: "refresh" }, config.jwt.refreshSecret, {
    subject: userId,
    jwtid: sessionId,
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwt.accessSecret);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

export function clearAuthCookies(res: Response) {
  const cookieOptions = { path: "/" };
  res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions);
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
}

export function getAuthTokenFromCookiesOrHeaders(
  cookies: Record<string, unknown>,
  authorizationHeader?: string,
) {
  const cookieToken = cookies[ACCESS_COOKIE_NAME] ?? cookies[REFRESH_COOKIE_NAME];
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

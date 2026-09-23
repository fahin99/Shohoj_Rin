import { describe, it, expect, afterAll } from "vitest";
import { pool } from "../../lib/db.js";
import { createAccessToken, hashPassword, generateSessionId } from "../../lib/auth.js";
import { requireAuth, type RequestWithAuth } from "../../middleware/authenticate.js";
import type { Response, NextFunction } from "express";

function createMockResponse() {
  const res: Partial<Response> & { statusCode: number; responseData: unknown } = {
    statusCode: 200,
    responseData: null,
    status(code: number) {
      this.statusCode = code;
      return this as Response;
    },
    json(data: unknown) {
      this.responseData = data;
      return this as Response;
    },
  };
  return res as Response & { statusCode: number; responseData: unknown };
}

describe("Logout & Session Invalidation", () => {
  const testUserId = `test-user-${Date.now()}`;
  const testEmail = `${testUserId}@example.com`;
  let userId: string;
  let sessionId: string;
  let validAccessToken: string;

  afterAll(async () => {
    if (userId) {
      await pool.query(`DELETE FROM users WHERE user_id = $1`, [userId]);
    }
  });

  it("sets up an active user and login session", async () => {
    const passwordHash = await hashPassword("ValidPassword123!");
    const userRes = await pool.query<{ user_id: string }>(
      `INSERT INTO users (email, password_hash, role, account_status)
       VALUES ($1, $2, 'borrower', 'active')
       RETURNING user_id`,
      [testEmail, passwordHash],
    );
    userId = userRes.rows[0].user_id;

    sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      `INSERT INTO login_sessions (session_id, user_id, refresh_token_hash, is_revoked, expires_at)
       VALUES ($1, $2, 'mock-refresh-hash', false, $3)`,
      [sessionId, userId, expiresAt],
    );

    validAccessToken = createAccessToken(userId, sessionId, "borrower");
    expect(validAccessToken).toBeDefined();
  });

  it("allows access when session is active and valid", async () => {
    const req = {
      cookies: { shohojrin_access_token: validAccessToken },
      header: () => undefined,
    } as unknown as RequestWithAuth;
    const res = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await requireAuth(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req.auth?.userId).toBe(userId);
    expect(req.auth?.sessionId).toBe(sessionId);
  });

  it("rejects access immediately when session is marked is_revoked = true", async () => {
    // Simulate what /logout does
    await pool.query(
      `UPDATE login_sessions SET is_revoked = TRUE WHERE session_id = $1`,
      [sessionId],
    );

    const req = {
      cookies: { shohojrin_access_token: validAccessToken },
      header: () => undefined,
    } as unknown as RequestWithAuth;
    const res = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await requireAuth(req, res, next);
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.responseData).toEqual({
      success: false,
      error: { message: "Session expired or revoked" },
    });
  });

  it("rejects access when session does not exist in login_sessions", async () => {
    const orphanedSessionId = generateSessionId();
    const orphanedToken = createAccessToken(userId, orphanedSessionId, "borrower");

    const req = {
      cookies: { shohojrin_access_token: orphanedToken },
      header: () => undefined,
    } as unknown as RequestWithAuth;
    const res = createMockResponse();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };

    await requireAuth(req, res, next);
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.responseData).toEqual({
      success: false,
      error: { message: "Session expired or revoked" },
    });
  });
});

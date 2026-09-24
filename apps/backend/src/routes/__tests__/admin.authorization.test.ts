import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Response } from "express";
import type { RequestWithAuth } from "../../middleware/authenticate.js";
import { requireAdmin } from "../admin.js";

function createResponse() {
  const response: Partial<Response> & { statusCode: number; body: unknown } = {
    statusCode: 200,
    body: null,
    status(statusCode: number) {
      this.statusCode = statusCode;
      return this as Response;
    },
    json(body: unknown) {
      this.body = body;
      return this as Response;
    },
  };
  return response as Response & { statusCode: number; body: unknown };
}

describe("requireAdmin", () => {
  it("permits an authenticated admin", () => {
    const next = vi.fn<NextFunction>();
    const response = createResponse();
    const request = {
      auth: { userId: "admin-1", sessionId: "session-1", role: "admin" },
    } as RequestWithAuth;

    requireAdmin(request, response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });

  it("rejects non-admin users before showcase handlers run", () => {
    const next = vi.fn<NextFunction>();
    const response = createResponse();
    const request = {
      auth: { userId: "borrower-1", sessionId: "session-1", role: "borrower" },
    } as RequestWithAuth;

    requireAdmin(request, response, next as unknown as NextFunction);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      success: false,
      error: { message: "Admin access required" },
    });
  });
});

import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const demoMocks = vi.hoisted(() => ({
  getProfileWithCompletion: vi.fn(),
  getDocumentRequirements: vi.fn(),
  assess: vi.fn(),
  logAuditEvent: vi.fn(),
}));

vi.mock("../../config/index.js", () => ({ config: { demoMode: true } }));
vi.mock("../../lib/db.js", () => ({ pool: { connect: vi.fn() } }));
vi.mock("../../middleware/authenticate.js", () => ({
  requireAuth: (req: any, _res: any, next: () => void) => {
    req.auth = { userId: "borrower-1", sessionId: "session-1", role: "borrower" };
    next();
  },
}));
vi.mock("../../middleware/authorize.js", () => ({
  requireRole:
    (...roles: string[]) =>
    (req: any, res: any, next: () => void) =>
      roles.includes(req.auth?.role)
        ? next()
        : res.status(403).json({ success: false, error: { message: "Forbidden" } }),
}));
vi.mock("../../services/profile.service.js", () => ({
  getProfileWithCompletion: demoMocks.getProfileWithCompletion,
  getDocumentRequirements: demoMocks.getDocumentRequirements,
}));
vi.mock("../../services/document-verification.service.js", () => ({
  demoProvider: { assess: demoMocks.assess },
}));
vi.mock("../../services/audit.service.js", () => ({ logAuditEvent: demoMocks.logAuditEvent }));

import { pool } from "../../lib/db.js";
import demoRouter from "../demo.js";

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(demoRouter);
  const server = await new Promise<Server>((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer));
  });

  try {
    await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("demo document skip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    demoMocks.getProfileWithCompletion.mockResolvedValue({ profile: { occupation: "student" } });
    demoMocks.getDocumentRequirements.mockReturnValue(["nid_front", "student_id"]);
    demoMocks.assess.mockResolvedValue({ status: "demo_verified", confidence: 100 });
    demoMocks.logAuditEvent.mockResolvedValue(undefined);
  });

  it("creates schema-valid demo verification records without an uploaded file", async () => {
    let requestNumber = 0;
    const query = vi.fn(async (queryText: string) => {
      const sql = String(queryText);
      if (sql.includes("INSERT INTO verification_requests")) {
        requestNumber += 1;
        return { rows: [{ request_id: `request-${requestNumber}` }] };
      }
      if (sql.includes("INSERT INTO verification_documents")) {
        return {
          rows: [{ document_id: `document-${requestNumber}`, id: `document-${requestNumber}` }],
        };
      }
      return { rows: [] };
    });
    const client = { query, release: vi.fn() };
    (pool.connect as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(client);

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/skip-documents`, { method: "POST" });
      const payload = (await response.json()) as { data: unknown[] };

      expect(response.status).toBe(200);
      expect(payload.data).toHaveLength(2);
    });

    const sqlCalls = query.mock.calls.map(([sql]: [string]) => sql);
    const documentInsertCalls = query.mock.calls as unknown as Array<[string, unknown[]]>;
    expect(sqlCalls.some((sql) => sql.includes("RETURNING request_id"))).toBe(true);
    expect(sqlCalls.some((sql) => sql.includes("'demo_verified'"))).toBe(true);
    expect(
      documentInsertCalls.some(
        ([sql, values]: [string, unknown[]]) =>
          sql.includes("INSERT INTO verification_documents") &&
          values.some((value) => typeof value === "string" && value.startsWith("demo://")),
      ),
    ).toBe(true);
    expect(sqlCalls).toContain("COMMIT");
    expect(demoMocks.assess).toHaveBeenCalledTimes(2);
    expect(demoMocks.logAuditEvent).toHaveBeenCalledWith(
      "borrower-1",
      "demo_skip_documents",
      "user",
      "borrower-1",
      null,
      { skipped: true },
      expect.anything(),
    );
  });
});

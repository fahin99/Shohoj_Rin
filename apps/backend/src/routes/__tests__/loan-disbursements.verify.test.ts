import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db.js", () => ({
  pool: { connect: vi.fn() },
}));

vi.mock("../../middleware/authenticate.js", () => ({
  requireAuth: (req: any, _res: any, next: () => void) => {
    req.user = {
      userId: req.header("x-test-user") ?? "unknown",
      role: req.header("x-test-role") ?? "borrower",
    };
    next();
  },
}));

import { pool } from "../../lib/db.js";
import loanDisbursementsRouter from "../loan-disbursements.js";

const LOAN_ID = "00000000-0000-4000-8000-000000000010";
const APP_ID = "00000000-0000-4000-8000-000000000020";
const BORROWER_ID = "00000000-0000-4000-8000-0000000000b1";
const AUTHORIZED_LENDER_ID = "00000000-0000-4000-8000-0000000000l1";
const OTHER_LENDER_ID = "00000000-0000-4000-8000-0000000000l2";
const ADMIN_ID = "00000000-0000-4000-8000-0000000000a1";

function makeClient() {
  const query = vi.fn(async (sql: string, params: any[] = []) => {
    const text = String(sql);
    if (text === "BEGIN" || text === "COMMIT" || text === "ROLLBACK") return { rowCount: 0, rows: [] };
    if (text.includes("FROM loans WHERE loan_id")) {
      return {
        rowCount: 1,
        rows: [
          {
            user_id: BORROWER_ID,
            application_id: APP_ID,
            principal_amount: "100000.00",
            status: "active",
          },
        ],
      };
    }
    if (text.includes("FROM funding_commitments")) {
      const lenderId = params[1];
      const isAuthorized = lenderId === AUTHORIZED_LENDER_ID;
      return isAuthorized ? { rowCount: 1, rows: [{}] } : { rowCount: 0, rows: [] };
    }
    if (text.includes("INSERT INTO loan_disbursements")) {
      return {
        rowCount: 1,
        rows: [
          {
            disbursementId: "disb-1",
            loanId: LOAN_ID,
            amount: "100000.00",
            disbursementMethod: "bank_transfer",
            referenceNumber: null,
            disbursedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      };
    }
    return { rowCount: 0, rows: [] };
  });
  const client = { query, release: vi.fn() };
  (pool.connect as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(client);
  return client;
}

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  app.use(loanDisbursementsRouter);
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

async function postDisbursement(baseUrl: string, userId: string, role: string) {
  return fetch(`${baseUrl}/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-test-user": userId,
      "x-test-role": role,
    },
    body: JSON.stringify({ loanId: LOAN_ID, amount: 1000 }),
  });
}

describe("POST /loan-disbursements authorization", () => {
  it("rejects the borrower disbursing their own loan (403)", async () => {
    makeClient();
    await withServer(async (baseUrl) => {
      const res = await postDisbursement(baseUrl, BORROWER_ID, "borrower");
      expect(res.status).toBe(403);
    });
  });

  it("rejects an unauthorized lender (403)", async () => {
    makeClient();
    await withServer(async (baseUrl) => {
      const res = await postDisbursement(baseUrl, OTHER_LENDER_ID, "lender");
      expect(res.status).toBe(403);
    });
  });

  it("allows the authorized funding lender (201)", async () => {
    makeClient();
    await withServer(async (baseUrl) => {
      const res = await postDisbursement(baseUrl, AUTHORIZED_LENDER_ID, "lender");
      expect(res.status).toBe(201);
    });
  });

  it("allows admin (201)", async () => {
    makeClient();
    await withServer(async (baseUrl) => {
      const res = await postDisbursement(baseUrl, ADMIN_ID, "admin");
      expect(res.status).toBe(201);
    });
  });
});
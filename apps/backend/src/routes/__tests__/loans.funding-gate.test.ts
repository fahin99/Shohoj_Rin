import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db.js", () => ({
  pool: { connect: vi.fn() },
}));

vi.mock("../../middleware/authenticate.js", () => ({
  requireAuth: (req: any, _res: any, next: () => void) => {
    req.auth = {
      userId: "lender-1",
      sessionId: "session-1",
      role: req.header("x-test-role") ?? "lender",
    };
    next();
  },
}));

import { pool } from "../../lib/db.js";
import loansRouter from "../loans.js";

const APP = "00000000-0000-4000-8000-000000000001";

function makeClient(options: {
  commitment?: boolean;
  committedAmount?: number;
  appStatus?: string;
  existingLoan?: boolean;
}) {
  const query = vi.fn(async (sql: string) => {
    const text = String(sql);
    if (text === "BEGIN" || text === "COMMIT") return { rowCount: 0, rows: [] };
    if (text.includes("FROM loan_applications la")) {
      return {
        rowCount: 1,
        rows: [
          {
            application_id: APP,
            user_id: "borrower-1",
            partner_id: "11111111-1111-4111-8111-111111111111",
            product_id: "22222222-2222-4222-8222-222222222222",
            requested_amount: "180000.00",
            application_status: options.appStatus ?? "submitted",
            interest_rate: "8.00",
            duration_months: 48,
          },
        ],
      };
    }
    if (text.includes("FROM funding_commitments") && text.includes("lender_user_id")) {
      return options.commitment ? { rowCount: 1, rows: [{}] } : { rowCount: 0, rows: [] };
    }
    if (text.includes("SELECT loan_id FROM loans")) {
      return options.existingLoan ? { rowCount: 1, rows: [{}] } : { rowCount: 0, rows: [] };
    }
    if (text.includes("COALESCE(SUM(amount), 0) AS committed_amount")) {
      return { rowCount: 1, rows: [{ committed_amount: String(options.committedAmount ?? 0) }] };
    }
    if (text.includes("INSERT INTO loan_offers")) {
      return { rowCount: 1, rows: [{ offer_id: "offer-1" }] };
    }
    if (text.includes("INSERT INTO loans")) {
      return {
        rowCount: 1,
        rows: [
          {
            loanId: "loan-1",
            applicationId: APP,
            user_id: "borrower-1",
            partner_id: "11111111-1111-4111-8111-111111111111",
            principalAmount: "180000.00",
            interestRate: "8.00",
            tenureMonths: 48,
            status: "active",
          },
        ],
      };
    }
    if (text.includes("UPDATE loan_applications")) {
      return { rowCount: 1, rows: [] };
    }
    if (text.includes("INSERT INTO audit_logs")) {
      return { rowCount: 1, rows: [] };
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
  app.use(loansRouter);
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

async function postLoan(baseUrl: string, role: string, body = { applicationId: APP }) {
  return fetch(`${baseUrl}/`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-test-role": role },
    body: JSON.stringify(body),
  });
}

describe("POST /loans funding gate", () => {
  it("rejects a lender who has not committed funding to the application (403)", async () => {
    const client = makeClient({ commitment: false, committedAmount: 0 });
    await withServer(async (baseUrl) => {
      const res = await postLoan(baseUrl, "lender");
      expect(res.status).toBe(403);
    });
    const calls = client.query.mock.calls.map(([sql]: [string]) => String(sql));
    expect(calls).toContain("ROLLBACK");
    expect(calls).not.toContain("INSERT INTO loans");
  });

  it("rejects loan creation while the application is not fully funded (400)", async () => {
    const client = makeClient({ commitment: true, committedAmount: 80000 });
    await withServer(async (baseUrl) => {
      const res = await postLoan(baseUrl, "lender");
      expect(res.status).toBe(400);
    });
    const calls = client.query.mock.calls.map(([sql]: [string]) => String(sql));
    expect(calls).toContain("ROLLBACK");
    expect(calls).not.toContain("INSERT INTO loans");
  });

  it("creates the loan when the lender is a funder and the application is fully funded (201)", async () => {
    const client = makeClient({ commitment: true, committedAmount: 180000 });
    await withServer(async (baseUrl) => {
      const res = await postLoan(baseUrl, "lender");
      expect(res.status).toBe(201);
    });
    const calls = client.query.mock.calls.map(([sql]: [string]) => String(sql));
    expect(calls).toContain("COMMIT");
    // Loan creation must move the application to 'approved', NOT 'disbursed'
    // (a real disbursement row is recorded separately later).
    const appUpdate = calls.find((sql) => sql.includes("UPDATE loan_applications"));
    expect(appUpdate).toBeDefined();
    expect(appUpdate).toContain("'approved'");
    expect(appUpdate).not.toContain("'disbursed'");
  });

  it("rejects an application that is already a loan (409 duplicate)", async () => {
    const client = makeClient({ commitment: true, committedAmount: 180000, existingLoan: true });
    await withServer(async (baseUrl) => {
      const res = await postLoan(baseUrl, "lender");
      expect(res.status).toBe(409);
    });
    const calls = client.query.mock.calls.map(([sql]: [string]) => String(sql));
    expect(calls).toContain("ROLLBACK");
    expect(calls).not.toContain("INSERT INTO loans");
  });

  it("rejects an application in a non-eligible state (rejected → 400)", async () => {
    const client = makeClient({ commitment: true, committedAmount: 180000, appStatus: "rejected" });
    await withServer(async (baseUrl) => {
      const res = await postLoan(baseUrl, "lender");
      expect(res.status).toBe(400);
    });
    const calls = client.query.mock.calls.map(([sql]: [string]) => String(sql));
    expect(calls).not.toContain("INSERT INTO loans");
  });
});
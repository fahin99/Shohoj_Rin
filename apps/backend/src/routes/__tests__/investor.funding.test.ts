import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db.js", () => ({
  pool: { connect: vi.fn(), query: vi.fn() },
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
import investorRouter from "../investor.js";

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  app.use(investorRouter);
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

function setFundingClient(options: { existing?: boolean; failAudit?: boolean } = {}) {
  const query = vi.fn(async (queryText: string) => {
    const sql = String(queryText);
    if (sql.includes("FROM loan_applications")) {
      return {
        rowCount: 1,
        rows: [
          { application_id: "application-1", status: "submitted", requested_amount: "5000.00" },
        ],
      };
    }
    if (sql.includes("SELECT commitment_id")) {
      return options.existing
        ? { rowCount: 1, rows: [{ commitment_id: "existing-commitment" }] }
        : { rowCount: 0, rows: [] };
    }
    if (sql.includes("COALESCE(SUM(amount)")) {
      return { rowCount: 1, rows: [{ committed_amount: "1000.00" }] };
    }
    if (sql.includes("INSERT INTO funding_commitments")) {
      return {
        rowCount: 1,
        rows: [
          {
            commitment_id: "commitment-1",
            application_id: "application-1",
            lender_user_id: "lender-1",
            amount: "2000.00",
            status: "committed",
            created_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      };
    }
    if (sql.includes("INSERT INTO audit_logs")) {
      if (options.failAudit) throw new Error("audit write failed");
      return { rowCount: 1, rows: [] };
    }
    return { rowCount: 0, rows: [] };
  });
  const client = { query, release: vi.fn() };
  (pool.connect as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(client);
  return client;
}

describe("investor funding commitments", () => {
  it("denies a borrower before any funding transaction begins", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/fund/application-1`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-test-role": "borrower" },
        body: JSON.stringify({ amount: 2000 }),
      });

      expect(response.status).toBe(403);
    });

    expect(pool.connect).not.toHaveBeenCalled();
  });

  it("persists a commitment and records a separate audit event in one transaction", async () => {
    const client = setFundingClient();

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/fund/application-1`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 2000 }),
      });
      const payload = (await response.json()) as { data: Record<string, unknown> };

      expect(response.status).toBe(200);
      expect(payload.data).toMatchObject({
        applicationId: "application-1",
        commitmentId: "commitment-1",
        fundedAmount: 2000,
        status: "committed",
      });
    });

    expect(
      client.query.mock.calls.some(([sql]: [string]) =>
        sql.includes("INSERT INTO funding_commitments"),
      ),
    ).toBe(true);
    expect(
      client.query.mock.calls.some(([sql]: [string]) => sql.includes("INSERT INTO audit_logs")),
    ).toBe(true);
    expect(
      client.query.mock.calls.map(([sql]: [string]) => sql).filter((sql) => sql === "COMMIT"),
    ).toHaveLength(1);
  });

  it("rejects a duplicate lender commitment without inserting a financial record", async () => {
    const client = setFundingClient({ existing: true });

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/fund/application-1`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 2000 }),
      });

      expect(response.status).toBe(409);
    });

    expect(
      client.query.mock.calls.some(([sql]: [string]) =>
        sql.includes("INSERT INTO funding_commitments"),
      ),
    ).toBe(false);
    expect(client.query.mock.calls.map(([sql]: [string]) => sql)).toContain("ROLLBACK");
  });

  it("rolls back the commitment when its audit write fails", async () => {
    const client = setFundingClient({ failAudit: true });

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/fund/application-1`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 2000 }),
      });

      expect(response.status).toBe(500);
    });

    const calls = client.query.mock.calls.map(([sql]: [string]) => sql);
    expect(calls).toContain("ROLLBACK");
    expect(calls).not.toContain("COMMIT");
  });

  it("builds the lender portfolio from funding commitments, not audit logs", async () => {
    const query = pool.query as unknown as ReturnType<typeof vi.fn>;
    query.mockReset();
    query.mockResolvedValue({
      rows: [
        {
          commitmentId: "commitment-1",
          applicationId: "application-1",
          fundedAmount: "2000.00",
          fundingStatus: "committed",
          fundedAt: "2026-01-01T00:00:00.000Z",
          purpose: "education",
          requestedAmount: "5000.00",
          applicationStatus: "submitted",
          productName: null,
          category: null,
          interestRate: null,
          partnerName: null,
          trustBand: null,
          loanId: null,
          loanStatus: null,
          principalAmount: null,
        },
      ],
    });

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/portfolio`);
      const payload = (await response.json()) as {
        data: { totalDeployed: number; fundedLoans: unknown[] };
      };

      expect(response.status).toBe(200);
      expect(payload.data.totalDeployed).toBe(2000);
      expect(payload.data.fundedLoans).toHaveLength(1);
    });

    const portfolioSql = query.mock.calls[0][0] as string;
    expect(portfolioSql).toContain("FROM funding_commitments fc");
    expect(portfolioSql).not.toContain("audit_logs");
  });
});

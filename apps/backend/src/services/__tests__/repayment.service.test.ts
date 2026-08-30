import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PoolClient } from "pg";

const repaymentMocks = vi.hoisted(() => ({ recalculateAndPersistTrustScore: vi.fn() }));
vi.mock("../trust-persistence.service.js", () => ({
  recalculateAndPersistTrustScore: repaymentMocks.recalculateAndPersistTrustScore,
}));

import { recordRepayment } from "../repayment.service.js";

type Scenario = "partial" | "final";

function createClient(scenario: Scenario) {
  const query = vi.fn(async (queryText: string) => {
    const sql = String(queryText);
    if (sql.includes("FROM repayment_schedules") && sql.includes("FOR UPDATE")) {
      return {
        rowCount: 1,
        rows: [{
          schedule_id: "schedule-1",
          loan_id: "loan-1",
          installment_number: 1,
          due_date: "2026-01-01",
          expected_amount: scenario === "final" ? "100.00" : "200.00",
          status: "pending",
          created_at: "2025-12-01T00:00:00.000Z",
        }],
      };
    }
    if (sql.includes("INSERT INTO repayments")) {
      return {
        rowCount: 1,
        rows: [{
          repayment_id: "repayment-1",
          schedule_id: "schedule-1",
          amount_paid: scenario === "final" ? "100.00" : "100.00",
          payment_method: "bank_transfer",
          transaction_reference: null,
          status: "completed",
          paid_at: "2026-01-01T00:00:00.000Z",
        }],
      };
    }
    if (sql.includes("FROM repayments") && sql.includes("WHERE schedule_id = $1")) {
      return {
        rowCount: 1,
        rows: [{
          repayment_id: "repayment-1",
          schedule_id: "schedule-1",
          amount_paid: "100.00",
          payment_method: "bank_transfer",
          transaction_reference: null,
          status: "completed",
          paid_at: "2026-01-01T00:00:00.000Z",
        }],
      };
    }
    if (sql.includes("FROM loans") && sql.includes("FOR UPDATE")) {
      return { rowCount: 1, rows: [{ loan_id: "loan-1", user_id: "user-1", status: "active" }] };
    }
    if (sql.includes("FROM repayment_schedules") && sql.includes("WHERE loan_id = $1")) {
      return {
        rowCount: 1,
        rows: [{
          schedule_id: "schedule-1",
          status: scenario === "final" ? "paid" : "partially_paid",
          due_date: "2026-01-01",
          expected_amount: scenario === "final" ? "100.00" : "200.00",
        }],
      };
    }
    return { rowCount: 0, rows: [] };
  });

  return { query } as unknown as PoolClient & { query: ReturnType<typeof vi.fn> };
}

describe("recordRepayment loan status", () => {
  beforeEach(() => {
    repaymentMocks.recalculateAndPersistTrustScore.mockReset();
    repaymentMocks.recalculateAndPersistTrustScore.mockResolvedValue(null);
  });

  it("keeps a partially repaid loan active", async () => {
    const client = createClient("partial");

    const result = await recordRepayment(client, { scheduleId: "schedule-1", amountPaid: 100 });

    const loanUpdate = client.query.mock.calls.find(([sql]) => String(sql).includes("UPDATE loans"));
    expect(loanUpdate?.[1]).toEqual(["loan-1", "active"]);
    expect(result.loan.status).toBe("active");
  });

  it("marks a fully repaid loan completed instead of closed", async () => {
    const client = createClient("final");

    const result = await recordRepayment(client, { scheduleId: "schedule-1", amountPaid: 100 });

    const loanUpdate = client.query.mock.calls.find(([sql]) => String(sql).includes("UPDATE loans"));
    expect(loanUpdate?.[1]).toEqual(["loan-1", "completed"]);
    expect(result.loan.status).toBe("completed");
  });
});

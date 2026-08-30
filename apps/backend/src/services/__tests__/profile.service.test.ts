import { beforeEach, describe, expect, it, vi } from "vitest";
import { profileUpdateSchema } from "@shohojrin/shared";

vi.mock("../../lib/db.js", () => ({
  pool: { query: vi.fn() },
}));

import { pool } from "../../lib/db.js";
import { updateProfile } from "../profile.service.js";

const query = pool.query as unknown as ReturnType<typeof vi.fn>;

describe("updateProfile", () => {
  beforeEach(() => {
    query.mockReset();
  });

  it("maps allowed camelCase fields to parameterized snake_case columns", async () => {
    query.mockResolvedValue({ rows: [{ user_id: "user-1" }] });

    await updateProfile("user-1", {
      fullName: "Ada Lovelace",
      monthlyIncome: 120000,
      institutionId: null,
    });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain("full_name = $2");
    expect(sql).toContain("monthly_income = $3");
    expect(sql).toContain("institution_id = $4");
    expect(values).toEqual(["user-1", "Ada Lovelace", 120000, null]);
  });

  it("does not issue an update for an empty partial update", async () => {
    await expect(updateProfile("user-1", {})).resolves.toBeNull();
    expect(query).not.toHaveBeenCalled();
  });

  it("strips unknown fields using the existing shared schema before the service is called", () => {
    const parsed = profileUpdateSchema.safeParse({
      fullName: "Ada Lovelace",
      "full_name = NULL; DROP TABLE user_profiles; --": "ignored",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ fullName: "Ada Lovelace" });
    }
  });
});

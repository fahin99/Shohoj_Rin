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

  it("accepts the canonical onboarding payload produced by OnboardingPage", () => {
    // This is the exact field shape / types OnboardingPage now sends.
    const onboardingPayload = {
      fullName: "Rahim Uddin Ahmed",
      dateOfBirth: "1996-05-12",
      gender: "male",
      nidNumber: "1234567890",
      addressLine: "House 12, Road 5, Block C",
      city: "dhaka",
      district: "dhaka",
      monthlyIncome: 25000,
      employmentType: "employed-full",
      employerName: "ABC Ltd",
      occupation: "Software Engineer",
      incomeSource: "salary",
      studentId: "S-2021-01",
    };
    const parsed = profileUpdateSchema.safeParse(onboardingPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({
        fullName: "Rahim Uddin Ahmed",
        city: "dhaka",
        district: "dhaka",
        monthlyIncome: 25000,
        occupation: "Software Engineer",
        incomeSource: "salary",
      });
    }
  });

  it("describes why the raw onboarding state could not be persisted", () => {
    // OnboardingPage previously sent its raw form state: string numerics and an
    // empty-string uuid made the shared schema reject the whole request (HTTP
    // 400), and legacy/onboarding-only keys (incomeType, jobTitle, savings,
    // goals, preferences) simply had no persistent profile column.
    const rawOnboardingState = {
      fullName: "Rahim Uddin Ahmed",
      monthlyIncome: "25000",
      incomeType: "salary",
      jobTitle: "Engineer",
      savingsAmount: "5000",
      existingLoans: "no",
      institutionId: "",
      goals: ["education"],
      notifEmail: true,
      notifSms: true,
      language: "en",
    };
    const parsed = profileUpdateSchema.safeParse(rawOnboardingState);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      expect(fields.monthlyIncome).toBeDefined();
      expect(fields.institutionId).toBeDefined();
      // Onboarding-only keys are not part of the profile contract: they never
      // produce field errors because they are never persisted at all.
      expect(Object.keys(fields)).not.toContain("incomeType");
      expect(Object.keys(fields)).not.toContain("jobTitle");
      expect(Object.keys(fields)).not.toContain("savingsAmount");
    }
  });

  it("maps onboarding canonical fields to their snake_case columns", async () => {
    query.mockResolvedValue({ rows: [{ user_id: "user-1" }] });

    await updateProfile("user-1", {
      city: "dhaka",
      district: "dhaka",
      occupation: "Software Engineer",
      incomeSource: "salary",
    });

    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain("city = $2");
    expect(sql).toContain("district = $3");
    expect(sql).toContain("occupation = $4");
    expect(sql).toContain("income_source = $5");
    expect(values).toEqual(["user-1", "dhaka", "dhaka", "Software Engineer", "salary"]);
  });
});

import { pool } from "../lib/db.js";
import { TrustInputs } from "./trust.service.js";
export async function buildTrustInputs(userId: string): Promise<TrustInputs> {
  // Single SQL function call replaces 6 separate queries
  const result = await pool.query<{ get_trust_inputs: TrustInputs }>(
    `SELECT get_trust_inputs($1) AS get_trust_inputs`,
    [userId],
  );

  const raw = result.rows[0]?.get_trust_inputs;

  if (!raw) {
    // Fallback: if the function returns null (e.g., user doesn't exist),
    // return safe defaults matching the original behavior
    return {
      repayment: {
        totalDuePayments: 0,
        onTimePayments: 0,
        latePayments: 0,
        missedPayments: 0,
        defaults: 0,
      },
      financial: {
        monthlyIncome: null,
        monthlyDebtObligations: 0,
        activeLoanCount: 0,
      },
      behavior: {
        hasTransactionData: false,
      },
      verification: {
        identityVerified: false,
        phoneVerified: false,
        emailVerified: false,
        addressVerified: false,
        incomeVerified: false,
        studentVerified: false,
      },
      credit: {
        activeLoanCount: 0,
        recentApplications: 0,
      },
      tenure: {
        accountAgeDays: 0,
        totalRepaymentCount: 0,
        verificationCount: 0,
      },
    };
  }

  // Ensure numeric types are correct (pg may return strings for some types)
  return {
    repayment: {
      totalDuePayments: Number(raw.repayment.totalDuePayments),
      onTimePayments: Number(raw.repayment.onTimePayments),
      latePayments: Number(raw.repayment.latePayments),
      missedPayments: Number(raw.repayment.missedPayments),
      defaults: Number(raw.repayment.defaults),
    },
    financial: {
      monthlyIncome:
        raw.financial.monthlyIncome != null ? Number(raw.financial.monthlyIncome) : null,
      monthlyDebtObligations: Number(raw.financial.monthlyDebtObligations),
      activeLoanCount: Number(raw.financial.activeLoanCount),
    },
    behavior: {
      hasTransactionData: Boolean(raw.behavior.hasTransactionData),
    },
    verification: {
      identityVerified: Boolean(raw.verification.identityVerified),
      phoneVerified: Boolean(raw.verification.phoneVerified),
      emailVerified: Boolean(raw.verification.emailVerified),
      addressVerified: Boolean(raw.verification.addressVerified),
      incomeVerified: Boolean(raw.verification.incomeVerified),
      studentVerified: Boolean(raw.verification.studentVerified),
    },
    credit: {
      activeLoanCount: Number(raw.credit.activeLoanCount),
      recentApplications: Number(raw.credit.recentApplications),
    },
    tenure: {
      accountAgeDays: Number(raw.tenure.accountAgeDays),
      totalRepaymentCount: Number(raw.tenure.totalRepaymentCount),
      verificationCount: Number(raw.tenure.verificationCount),
    },
  };
}

export async function hasPreviousLoans(userId: string): Promise<boolean> {
  const result = await pool.query(`SELECT 1 FROM loans WHERE user_id = $1 LIMIT 1`, [userId]);
  return (result.rowCount ?? 0) > 0;
}

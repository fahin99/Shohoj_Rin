export type TrustBand =
  "very_low_risk" | "low_risk" | "moderate_risk" | "high_risk" | "very_high_risk";
export interface TrustInputs {
  repayment: {
    totalDuePayments: number;
    onTimePayments: number;
    latePayments: number;
    missedPayments: number;
    defaults: number;
  };
  financial: {
    monthlyIncome: number | null;
    monthlyDebtObligations: number;
    activeLoanCount: number;
  };
  behavior: {
    hasTransactionData: boolean;
  };
  verification: {
    identityVerified: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
    addressVerified: boolean;
    incomeVerified: boolean;
    studentVerified: boolean;
  };
  credit: {
    activeLoanCount: number;
    recentApplications: number;
  };
  tenure: {
    accountAgeDays: number;
    totalRepaymentCount: number;
    verificationCount: number;
  };
}
export interface ComponentScore {
  name: string;
  score: number;
  weight: number;
  description: string;
}
export interface TrustScoreResult {
  score: number;
  band: TrustBand;
  confidenceScore: number;
  components: ComponentScore[];
}
export function calculateRepaymentHistory(inputs: TrustInputs["repayment"]): number {
  if (inputs.totalDuePayments === 0) return 50;
  const onTimeRatio = inputs.onTimePayments / inputs.totalDuePayments;
  const baseScore = onTimeRatio * 100;
  const latePenalty = (inputs.latePayments / inputs.totalDuePayments) * 30;
  const missedPenalty = (inputs.missedPayments / inputs.totalDuePayments) * 50;
  const defaultPenalty = inputs.defaults * 25;
  const score = baseScore - latePenalty - missedPenalty - defaultPenalty;
  return Math.max(0, Math.min(100, score));
}
export function calculateFinancialCapacity(inputs: TrustInputs["financial"]): number {
  if (inputs.monthlyIncome === null || inputs.monthlyIncome === 0) return 50;
  const dti = inputs.monthlyDebtObligations / inputs.monthlyIncome;
  let dtiScore = 20;
  if (dti <= 0.2) dtiScore = 100;
  else if (dti <= 0.3) dtiScore = 85;
  else if (dti <= 0.4) dtiScore = 70;
  else if (dti <= 0.5) dtiScore = 50;
  const activeLoanPenalty =
    inputs.activeLoanCount > 1 ? Math.min(15, (inputs.activeLoanCount - 1) * 5) : 0;
  const score = dtiScore - activeLoanPenalty;
  return Math.max(0, Math.min(100, score));
}
export function calculateFinancialBehavior(inputs: TrustInputs["behavior"]): number {
  if (!inputs.hasTransactionData) return 50;
  return 50;
}
export function calculateIdentityVerification(inputs: TrustInputs["verification"]): number {
  let score = 0;
  if (inputs.identityVerified) score += 35;
  if (inputs.emailVerified) score += 15;
  if (inputs.phoneVerified) score += 15;
  if (inputs.addressVerified) score += 15;
  if (inputs.incomeVerified) score += 10;
  if (inputs.studentVerified) score += 10;
  return Math.max(0, Math.min(100, score));
}
export function calculateCreditBehavior(inputs: TrustInputs["credit"]): number {
  let penalty = 0;
  if (inputs.activeLoanCount > 3) {
    penalty += (inputs.activeLoanCount - 3) * 10;
  }
  if (inputs.recentApplications > 2) {
    penalty += (inputs.recentApplications - 2) * 15;
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}
export function calculateConfidenceScore(inputs: TrustInputs["tenure"]): number {
  const ageFactor = Math.min(30, inputs.accountAgeDays / 12);
  const repaymentFactor = Math.min(40, inputs.totalRepaymentCount * 4);
  const verificationFactor = Math.min(30, inputs.verificationCount * 6);
  return Math.max(0, Math.min(100, ageFactor + repaymentFactor + verificationFactor));
}
export function getTrustBand(score: number): TrustBand {
  if (score >= 80) return "very_low_risk";
  if (score >= 65) return "low_risk";
  if (score >= 50) return "moderate_risk";
  if (score >= 35) return "high_risk";
  return "very_high_risk";
}
export function calculateTrustScore(inputs: TrustInputs): TrustScoreResult {
  const rScore = calculateRepaymentHistory(inputs.repayment);
  const fScore = calculateFinancialCapacity(inputs.financial);
  const bScore = calculateFinancialBehavior(inputs.behavior);
  const vScore = calculateIdentityVerification(inputs.verification);
  const cScore = calculateCreditBehavior(inputs.credit);
  const composite = 0.35 * rScore + 0.25 * fScore + 0.15 * bScore + 0.15 * vScore + 0.1 * cScore;
  const finalScore = Math.max(0, Math.min(100, Math.round(composite * 100) / 100));
  return {
    score: finalScore,
    band: getTrustBand(finalScore),
    confidenceScore: Math.round(calculateConfidenceScore(inputs.tenure) * 100) / 100,
    components: [
      {
        name: "repayment_history",
        score: Math.round(rScore * 100) / 100,
        weight: 0.35,
        description:
          inputs.repayment.totalDuePayments === 0
            ? "No repayment history"
            : "Repayment history performance",
      },
      {
        name: "financial_capacity",
        score: Math.round(fScore * 100) / 100,
        weight: 0.25,
        description:
          inputs.financial.monthlyIncome === null || inputs.financial.monthlyIncome === 0
            ? "Insufficient income data"
            : "Debt-to-income capacity",
      },
      {
        name: "financial_behavior",
        score: Math.round(bScore * 100) / 100,
        weight: 0.15,
        description: !inputs.behavior.hasTransactionData
          ? "No transaction data available"
          : "Financial behavior",
      },
      {
        name: "identity_verification",
        score: Math.round(vScore * 100) / 100,
        weight: 0.15,
        description: "Profile and identity verification status",
      },
      {
        name: "credit_behavior",
        score: Math.round(cScore * 100) / 100,
        weight: 0.1,
        description: "Credit application and active loan behavior",
      },
    ],
  };
}

function generateRepaymentDescription(
  inputs: TrustInputs["repayment"],
  hasPreviousLoans: boolean,
): string {
  if (!hasPreviousLoans && inputs.totalDuePayments === 0) {
    return "No previous loan history. First-time borrower baseline is 80.";
  }
  if (hasPreviousLoans && inputs.totalDuePayments === 0) {
    return "Based on your previous repayment history.";
  }
  const parts: string[] = ["Based on your previous repayment history."];
  const details: string[] = [];
  if (inputs.onTimePayments > 0) details.push(`${inputs.onTimePayments} on time`);
  if (inputs.latePayments > 0) details.push(`${inputs.latePayments} late`);
  if (inputs.missedPayments > 0) details.push(`${inputs.missedPayments} missed`);
  if (inputs.defaults > 0) details.push(`${inputs.defaults} defaulted`);
  if (details.length > 0) parts.push(details.join(", ") + ".");
  return parts.join(" ");
}

export function calculateInitialTrustScore(
  inputs: TrustInputs,
  hasPrevLoans: boolean,
): TrustScoreResult {
  const baseline = hasPrevLoans ? 70 : 80;
  const neutral = 50;

  const rScore = calculateRepaymentHistory(inputs.repayment);
  const fScore = calculateFinancialCapacity(inputs.financial);
  const bScore = calculateFinancialBehavior(inputs.behavior);
  const vScore = calculateIdentityVerification(inputs.verification);
  const cScore = calculateCreditBehavior(inputs.credit);

  const adjustment =
    0.35 * (rScore - neutral) +
    0.25 * (fScore - neutral) +
    0.15 * (bScore - neutral) +
    0.15 * (vScore - neutral) +
    0.1 * (cScore - neutral);

  const finalScore = Math.max(0, Math.min(100, Math.round((baseline + adjustment) * 100) / 100));

  return {
    score: finalScore,
    band: getTrustBand(finalScore),
    confidenceScore: Math.round(calculateConfidenceScore(inputs.tenure) * 100) / 100,
    components: [
      {
        name: "repayment_history",
        score: Math.round(rScore * 100) / 100,
        weight: 0.35,
        description: generateRepaymentDescription(inputs.repayment, hasPrevLoans),
      },
      {
        name: "financial_capacity",
        score: Math.round(fScore * 100) / 100,
        weight: 0.25,
        description:
          inputs.financial.monthlyIncome === null || inputs.financial.monthlyIncome === 0
            ? "No income data reported yet."
            : "Financial capacity based on your reported income and current debt obligations.",
      },
      {
        name: "financial_behavior",
        score: Math.round(bScore * 100) / 100,
        weight: 0.15,
        description: !inputs.behavior.hasTransactionData
          ? "No transaction data available yet."
          : "Financial behavior based on your transaction history.",
      },
      {
        name: "identity_verification",
        score: Math.round(vScore * 100) / 100,
        weight: 0.15,
        description: "Based on your current verification status.",
      },
      {
        name: "credit_behavior",
        score: Math.round(cScore * 100) / 100,
        weight: 0.1,
        description:
          inputs.credit.activeLoanCount === 0 && inputs.credit.recentApplications <= 2
            ? "No previous credit problems recorded."
            : "Credit application and active loan behavior.",
      },
    ],
  };
}

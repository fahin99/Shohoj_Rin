/**
 * Trust score calculation engine.
 * Recalculates trust scores based on verification states and repayment history.
 */

export interface TrustFactor {
  factorName: string;
  factorValue: number;
  description: string;
}

export interface TrustScoreResult {
  score: number;
  band: "A" | "B" | "C" | "D" | "F";
  factors: TrustFactor[];
}

const BAND_THRESHOLDS = [
  { min: 80, band: "A" as const },
  { min: 65, band: "B" as const },
  { min: 50, band: "C" as const },
  { min: 35, band: "D" as const },
  { min: 0, band: "F" as const },
];

function getBand(score: number): TrustScoreResult["band"] {
  for (const { min, band } of BAND_THRESHOLDS) {
    if (score >= min) return band;
  }
  return "F";
}

/**
 * Calculate trust score from individual factor values.
 * Each factor contributes a weighted value to the total score (0–100).
 */
export function calculateTrustScore(factors: TrustFactor[]): TrustScoreResult {
  const totalScore = factors.reduce((sum, f) => sum + f.factorValue, 0);
  const clampedScore = Math.max(0, Math.min(100, Math.round(totalScore * 100) / 100));

  return {
    score: clampedScore,
    band: getBand(clampedScore),
    factors,
  };
}

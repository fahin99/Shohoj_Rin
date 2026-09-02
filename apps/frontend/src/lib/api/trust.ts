import { apiRequest } from "../api";

export interface TrustScoreFactor {
  name: string;
  score: number;
  weight: number;
  description: string | null;
}

export interface TrustScoreData {
  score: number;
  band: string;
  confidenceScore: number;
  lastUpdated: string;
  factors: TrustScoreFactor[];
}

export async function getTrustScore() {
  return apiRequest<TrustScoreData | null>("/trust-score");
}
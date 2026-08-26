import { type PoolClient } from "pg";
import { pool } from "../lib/db.js";
import { TrustScoreResult, calculateTrustScore } from "./trust.service.js";
import { buildTrustInputs } from "./trust-inputs.service.js";
export async function persistTrustScore(
  client: Pick<PoolClient, "query">,
  userId: string,
  result: TrustScoreResult,
  triggerEvent: string,
): Promise<{ scoreId: string; score: number; band: string }> {
  await client.query(
    `UPDATE trust_scores SET is_current = FALSE WHERE user_id = $1 AND is_current = TRUE`,
    [userId],
  );
  const insertRes = await client.query(
    `INSERT INTO trust_scores (user_id, score, trust_band, confidence_score, trigger_event, is_current) 
     VALUES ($1, $2, $3, $4, $5, TRUE) 
     RETURNING score_id, score, trust_band`,
    [userId, result.score, result.band, result.confidenceScore, triggerEvent],
  );
  const scoreInfo = insertRes.rows[0];
  for (const comp of result.components) {
    await client.query(
      `INSERT INTO trust_score_factors (score_id, factor_name, factor_value, factor_weight, description) 
       VALUES ($1, $2, $3, $4, $5)`,
      [scoreInfo.score_id, comp.name, comp.score, comp.weight, comp.description],
    );
  }
  return {
    scoreId: scoreInfo.score_id,
    score: Number(scoreInfo.score),
    band: scoreInfo.trust_band,
  };
}
export async function recalculateAndPersistTrustScore(
  userId: string,
  triggerEvent: string,
  client?: PoolClient,
): Promise<{ score: number; band: string }> {
  let retries = 3;
  while (retries > 0) {
    const inputs = await buildTrustInputs(userId);
    const result = calculateTrustScore(inputs);

    if (client) {
      try {
        await client.query("SAVEPOINT recalculate_trust_score");
        const persisted = await persistTrustScore(client, userId, result, triggerEvent);
        await client.query("RELEASE SAVEPOINT recalculate_trust_score");
        return { score: persisted.score, band: persisted.band };
      } catch (error: any) {
        await client.query("ROLLBACK TO SAVEPOINT recalculate_trust_score");
        if (error.code === "23505") {
          retries--;
          if (retries === 0) throw error;
          continue;
        }
        throw error;
      }
    } else {
      const newClient = await pool.connect();
      try {
        await newClient.query("BEGIN");
        const persisted = await persistTrustScore(newClient, userId, result, triggerEvent);
        await newClient.query("COMMIT");
        return { score: persisted.score, band: persisted.band };
      } catch (error: any) {
        await newClient.query("ROLLBACK");
        if (error.code === "23505") {
          retries--;
          if (retries === 0) throw error;
          continue;
        }
        throw error;
      } finally {
        newClient.release();
      }
    }
  }
  throw new Error("Failed to persist trust score after retries");
}

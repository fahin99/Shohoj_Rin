import { Router } from "express";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { recalculateAndPersistTrustScore } from "../services/trust-persistence.service.js";
const router = Router();
router.use(requireAuth);
router.get("/", async (req: RequestWithAuth, res) => {
  try {
    const scoreRes = await pool.query(
      `SELECT score_id, score, trust_band, confidence_score, calculated_at 
       FROM trust_scores 
       WHERE user_id = $1 AND is_current = TRUE`,
      [req.user!.userId],
    );
    if (scoreRes.rowCount === 0) {
      return res.status(200).json({ success: true, data: null });
    }
    const scoreRow = scoreRes.rows[0];
    const factorsRes = await pool.query(
      `SELECT factor_name as name, factor_value as score, factor_weight as weight, description 
       FROM trust_score_factors 
       WHERE score_id = $1`,
      [scoreRow.score_id],
    );
    return res.status(200).json({
      success: true,
      data: {
        score: Number(scoreRow.score),
        band: scoreRow.trust_band,
        confidenceScore: Number(scoreRow.confidence_score || 0),
        lastUpdated: scoreRow.calculated_at,
        factors: factorsRes.rows.map((f) => ({
          name: f.name,
          score: Number(f.score),
          weight: Number(f.weight || 0),
          description: f.description,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch trust score:", error);
    return res.status(500).json({ success: false, error: { message: "Internal server error" } });
  }
});
router.post("/recalculate", async (req: RequestWithAuth, res) => {
  try {
    await recalculateAndPersistTrustScore(req.user!.userId, "manual_recalculation");
    const scoreRes = await pool.query(
      `SELECT score_id, score, trust_band, confidence_score, calculated_at 
       FROM trust_scores 
       WHERE user_id = $1 AND is_current = TRUE`,
      [req.user!.userId],
    );
    if (scoreRes.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Score could not be calculated" } });
    }
    const scoreRow = scoreRes.rows[0];
    const factorsRes = await pool.query(
      `SELECT factor_name as name, factor_value as score, factor_weight as weight, description 
       FROM trust_score_factors 
       WHERE score_id = $1`,
      [scoreRow.score_id],
    );
    return res.status(200).json({
      success: true,
      data: {
        score: Number(scoreRow.score),
        band: scoreRow.trust_band,
        confidenceScore: Number(scoreRow.confidence_score || 0),
        lastUpdated: scoreRow.calculated_at,
        factors: factorsRes.rows.map((f) => ({
          name: f.name,
          score: Number(f.score),
          weight: Number(f.weight || 0),
          description: f.description,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to recalculate trust score:", error);
    return res.status(500).json({ success: false, error: { message: "Internal server error" } });
  }
});
export default router;
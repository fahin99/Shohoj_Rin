import { Router } from "express";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { 
  recalculateAndPersistTrustScore, 
  initializeTrustScoreIfNeeded 
} from "../services/trust-persistence.service.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: RequestWithAuth, res) => {
  try {
    await initializeTrustScoreIfNeeded(req.auth!.userId);

    const summary = await pool.query(
      `SELECT score, trust_band, confidence_score, calculated_at, is_first_time_borrower, factors
       FROM borrower_trust_summary WHERE user_id = $1`,
      [req.auth!.userId],
    );
    if (summary.rowCount === 0 || summary.rows[0].score === null) {
      return res.status(404).json({ success: false, error: { message: "Score could not be initialized" } });
    }
    const row = summary.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        score: Number(row.score),
        band: row.trust_band,
        confidenceScore: Number(row.confidence_score || 0),
        lastUpdated: row.calculated_at,
        isFirstTimeBorrower: row.is_first_time_borrower,
        factors: (row.factors || []).map((f: any) => ({
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
    await recalculateAndPersistTrustScore(req.auth!.userId, "manual_recalculation");

    const summary = await pool.query(
      `SELECT score, trust_band, confidence_score, calculated_at, is_first_time_borrower, factors
       FROM borrower_trust_summary WHERE user_id = $1`,
      [req.auth!.userId],
    );
    if (summary.rowCount === 0 || summary.rows[0].score === null) {
      return res
        .status(404)
        .json({ success: false, error: { message: "Score could not be calculated" } });
    }
    const row = summary.rows[0];
    return res.status(200).json({
      success: true,
      data: {
        score: Number(row.score),
        band: row.trust_band,
        confidenceScore: Number(row.confidence_score || 0),
        lastUpdated: row.calculated_at,
        isFirstTimeBorrower: row.is_first_time_borrower,
        factors: (row.factors || []).map((f: any) => ({
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

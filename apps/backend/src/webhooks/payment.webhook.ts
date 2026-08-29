import { Router } from "express";
import { pool } from "../lib/db.js";
import { createRepaymentSchema, recordRepayment } from "../services/repayment.service.js";
const router = Router();
router.post("/payment", async (req, res) => {
  const parsed = createRepaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment payload", details: parsed.error.flatten() },
    });
  }
  // In a real scenario, this would verify a provider signature (e.g., HMAC with a shared secret).
  // For this implementation, we simulate it with a simple authorization token check.
  const authHeader = req.headers.authorization;
  if (
    !authHeader ||
    authHeader !== `Bearer ${process.env.WEBHOOK_SECRET || "test-webhook-secret"}`
  ) {
    return res.status(401).json({
      success: false,
      error: { message: "Unauthorized webhook" },
    });
  }

  const client = await pool.connect();
  try {
    const result = await recordRepayment(client, parsed.data);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[Webhook] Failed to process payment notification", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to process payment notification" },
    });
  } finally {
    client.release();
  }
});
export default router;

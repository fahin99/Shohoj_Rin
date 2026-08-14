/**
 * Payment gateway webhook handler stub.
 * This module will handle async payment notifications from bKash, SSLCommerz, Stripe, etc.
 */

import { Router } from "express";

import { pool } from "../lib/db.js";
import { createRepaymentSchema, recordRepayment } from "../services/repayment.service.js";

const router = Router();

// POST /api/v1/webhooks/payment
router.post("/payment", async (req, res) => {
  // TODO: Implement signature verification per payment gateway
  // TODO: Add gateway-specific idempotency and signature validation.
  const parsed = createRepaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment payload", details: parsed.error.flatten() },
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

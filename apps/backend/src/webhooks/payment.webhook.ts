/**
 * Payment gateway webhook handler stub.
 * This module will handle async payment notifications from bKash, SSLCommerz, Stripe, etc.
 */

import { Router } from "express";

const router = Router();

// POST /api/v1/webhooks/payment
router.post("/payment", (req, res) => {
  // TODO: Implement signature verification per payment gateway
  // TODO: Process repayment, update schedule, recalculate trust score
  console.log("[Webhook] Payment notification received", req.body);

  res.status(200).json({ status: "received" });
});

export default router;

import { Router } from "express";
import { z } from "zod";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import {
  getUserPaymentAccounts,
  getPaymentAccountById,
  createPaymentAccount,
  updatePaymentAccount,
  setDefaultPaymentAccount,
  deletePaymentAccount,
} from "../services/payment-account.service.js";
import {
  createPaymentAccountSchema,
  updatePaymentAccountSchema,
} from "@shohojrin/shared";

const router = Router();
router.use(requireAuth);

const accountIdParamSchema = z.object({
  id: z.string().uuid("Invalid payment account id"),
});

// GET /api/v1/payment-accounts — list active accounts for current user
router.get("/", async (req: RequestWithAuth, res) => {
  try {
    const accounts = await getUserPaymentAccounts(req.auth!.userId);
    return res.status(200).json({
      success: true,
      data: { accounts },
    });
  } catch (error) {
    console.error("Failed to fetch payment accounts:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch payment accounts" },
    });
  }
});

// GET /api/v1/payment-accounts/:id — get single account
router.get("/:id", async (req: RequestWithAuth, res) => {
  const paramParsed = accountIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment account id", details: paramParsed.error.flatten() },
    });
  }

  try {
    const account = await getPaymentAccountById(paramParsed.data.id, req.auth!.userId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { message: "Payment account not found" },
      });
    }
    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Failed to fetch payment account:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch payment account" },
    });
  }
});

// POST /api/v1/payment-accounts — register a new account
router.post("/", async (req: RequestWithAuth, res) => {
  const parsed = createPaymentAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment account details", details: parsed.error.flatten() },
    });
  }

  try {
    const account = await createPaymentAccount(req.auth!.userId, parsed.data);
    return res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Failed to create payment account:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to register payment account" },
    });
  }
});

// PUT /api/v1/payment-accounts/:id — update account
router.put("/:id", async (req: RequestWithAuth, res) => {
  const paramParsed = accountIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment account id", details: paramParsed.error.flatten() },
    });
  }

  const parsed = updatePaymentAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment account details", details: parsed.error.flatten() },
    });
  }

  try {
    const account = await updatePaymentAccount(
      paramParsed.data.id,
      req.auth!.userId,
      parsed.data,
    );
    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error: any) {
    if (error?.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: { message: "Payment account not found" },
      });
    }
    console.error("Failed to update payment account:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to update payment account" },
    });
  }
});

// POST /api/v1/payment-accounts/:id/default or PATCH
const handleSetDefault = async (req: RequestWithAuth, res: any) => {
  const paramParsed = accountIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment account id", details: paramParsed.error.flatten() },
    });
  }

  try {
    const account = await setDefaultPaymentAccount(paramParsed.data.id, req.auth!.userId);
    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error: any) {
    if (error?.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: { message: "Payment account not found" },
      });
    }
    console.error("Failed to set default payment account:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to set default payment account" },
    });
  }
};

router.post("/:id/default", handleSetDefault);
router.patch("/:id/default", handleSetDefault);

// DELETE /api/v1/payment-accounts/:id — soft delete
router.delete("/:id", async (req: RequestWithAuth, res) => {
  const paramParsed = accountIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid payment account id", details: paramParsed.error.flatten() },
    });
  }

  try {
    await deletePaymentAccount(paramParsed.data.id, req.auth!.userId);
    return res.status(200).json({
      success: true,
      data: { deleted: true },
    });
  } catch (error: any) {
    if (error?.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: { message: "Payment account not found" },
      });
    }
    console.error("Failed to delete payment account:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to delete payment account" },
    });
  }
});

export default router;

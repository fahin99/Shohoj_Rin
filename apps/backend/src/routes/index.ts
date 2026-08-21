import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import repaymentsRouter from "./repayments.js";
import institutionsRouter from "./institutions.js";
import trustScoreRouter from "./trust-score.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/repayments", repaymentsRouter);
router.use("/institutions", institutionsRouter);
router.use("/trust-score", trustScoreRouter);

// Future route mounts:
// router.use("/users", usersRouter);
// router.use("/loans", loansRouter);
// router.use("/applications", applicationsRouter);
// router.use("/verification", verificationRouter);
// router.use("/trust", trustRouter);
// router.use("/partners", partnersRouter);
// router.use("/notifications", notificationsRouter);
// router.use("/audit", auditRouter);
// router.use("/admin", adminRouter);

export default router;

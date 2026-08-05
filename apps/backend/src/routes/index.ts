import { Router } from "express";
import healthRouter from "./health.js";

const router = Router();

router.use("/health", healthRouter);

// Future route mounts:
// router.use("/auth", authRouter);
// router.use("/users", usersRouter);
// router.use("/loans", loansRouter);
// router.use("/applications", applicationsRouter);
// router.use("/verification", verificationRouter);
// router.use("/trust", trustRouter);
// router.use("/partners", partnersRouter);
// router.use("/repayments", repaymentsRouter);
// router.use("/notifications", notificationsRouter);
// router.use("/audit", auditRouter);
// router.use("/admin", adminRouter);

export default router;

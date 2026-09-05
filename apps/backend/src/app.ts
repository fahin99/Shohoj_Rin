import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { config, validateConfig } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import apiRouter from "./routes/index.js";
import webhookRouter from "./webhooks/payment.webhook.js";
import { pool } from "./lib/db.js";
const app = express();
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.get("/", (_req, res) => {
  res.json({
    name: "ShohojRin Microcredit API Server",
    version: "1.0.0",
    healthCheck: "/api/v1/health",
    auth: {
      register: "/api/v1/auth/register",
      login: "/api/v1/auth/login",
      refresh: "/api/v1/auth/refresh",
      logout: "/api/v1/auth/logout",
      me: "/api/v1/auth/me",
    },
    repayments: {
      schedules: "/api/v1/repayments/loans/:loanId/schedules",
      payments: "/api/v1/repayments/payments",
    },
    frontendUrl: "http://localhost:8080",
  });
});
app.use("/api/v1", apiRouter);
app.use("/api/v1/webhooks", webhookRouter);
app.use(notFoundHandler);
app.use(errorHandler);
async function start() {
  try {
    validateConfig();
    await pool.query("SELECT 1");
    app.listen(config.port, () => {
      console.log(`\n  ShohojRin API server running on http://localhost:${config.port}`);
      if (config.demoMode) {
        console.log("  ⚠️  DEMO MODE ENABLED — document bypass available");
      }
      console.log(`  Health check: http://localhost:${config.port}/api/v1/health`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log("  PostgreSQL: connected successfully\n");
    });
  } catch (error) {
    console.error("Failed to start server or connect to PostgreSQL:", error);
    process.exit(1);
  }
}
void start();
export default app;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { config } from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import apiRouter from "./routes/index.js";
import webhookRouter from "./webhooks/payment.webhook.js";
import { pool } from "./lib/db.js";

const app = express();

// Security & parsing middleware
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

// Root info endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "ShohojRin Microcredit API Server",
    version: "1.0.0",
    healthCheck: "/api/v1/health",
    frontendUrl: "http://localhost:8080",
  });
});

// API routes
app.use("/api/v1", apiRouter);
app.use("/api/v1/webhooks", webhookRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await pool.query("SELECT 1");

    app.listen(config.port, () => {
      console.log(`\n  ShohojRin API server running on http://localhost:${config.port}`);
      console.log(`  Health check: http://localhost:${config.port}/api/v1/health`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log("  PostgreSQL: connected to postgres@localhost:5432/shohoj_rin_db\n");
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
}

void start();

export default app;

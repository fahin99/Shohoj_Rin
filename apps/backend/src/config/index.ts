import dotenv from "dotenv";
dotenv.config();
function parseCorsOrigins(rawValue: string | undefined) {
  if (!rawValue) {
    return ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"];
  }
  return rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  demoMode: process.env.SHOHOJRIN_DEMO_MODE === "true",
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  },
  database: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/shohoj_rin_db",
  },
} as const;

export function validateConfig() {
  if (config.demoMode === true && config.nodeEnv === "production") {
    throw new Error("DEMO MODE cannot be enabled in production environments!");
  }
  if (config.nodeEnv === "production") {
    if (!process.env.DATABASE_URL) {
      throw new Error("Production environments MUST set DATABASE_URL");
    }
  }
}

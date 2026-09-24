import dotenv from "dotenv";
dotenv.config();
function parseCorsOrigins(rawValue: string | undefined) {
  if (!rawValue) {
    return [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8080",
    ];
  }
  return rawValue.split(",").map((origin) => origin.trim()).filter(Boolean);
}
export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  },
  database: {
    url: process.env.DATABASE_URL || "postgresql://postgres:2405012@localhost:5432/shohoj_rin_db",
  },
} as const;

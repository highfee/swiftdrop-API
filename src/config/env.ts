import dotenv from "dotenv";
import type { Secret } from "jsonwebtoken";

dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  JWT_SECRET: process.env.JWT_SECRET || "random",
  JWT_EXPIRES_IN: "1d",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/swiftdrop",
};

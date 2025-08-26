import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

interface UserPayload {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "RIDER";
}

export const generateToken = (user: UserPayload): string => {
  return jwt.sign(user, config.JWT_SECRET, { expiresIn: "1d" });
};

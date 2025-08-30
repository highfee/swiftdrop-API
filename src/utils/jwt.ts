import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

interface UserPayload {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "RIDER";
}

export const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(user, config.JWT_SECRET, { expiresIn: "15m" }); // shorter expiry
};

export const generateRefreshToken = (user: UserPayload): string => {
  return jwt.sign(user, config.JWT_REFRESH_SECRET, { expiresIn: "7d" }); // longer expiry
};

export const verifyAccessToken = (token: string): UserPayload => {
  return jwt.verify(token, config.JWT_SECRET) as UserPayload;
};

export const verifyRefreshToken = (token: string): UserPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as UserPayload;
};

import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { AppError } from "../middlewares/error.middleware.js";
import { verifyRefreshToken, generateAccessToken } from "../utils/jwt.js";

const authService = new AuthService();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // send only over HTTPS in production
  sameSite: "strict" as const,
  // You can set 'domain' and 'path' as needed
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return next(
        new AppError("Please provide name, email, phone and password", 400)
      );
    }

    const result = await authService.register(name, email, password, phone);

    // Set tokens as HTTP-only cookies
    res.cookie("accessToken", result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      status: "success",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const result = await authService.login(email, password);

    // Set tokens as HTTP-only cookies
    res.cookie("accessToken", result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      status: "success",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout: clear cookies
export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", { ...cookieOptions });
  res.clearCookie("refreshToken", { ...cookieOptions });
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

export const refresh = (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return next(new AppError("Refresh token missing", 401));
    }
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return next(new AppError("Invalid refresh token", 401));
    }
    const accessToken = generateAccessToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({ status: "success", accessToken });
  } catch (error) {
    next(error);
  }
};

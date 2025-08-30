import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { AppError } from "./error.middleware.js";
import prisma from "../config/db.js";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from header or cookie
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    console.log(req.cookies);

    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to get access", 401)
      );
    }

    // 2) Verify token
    const decoded: any = jwt.verify(token, config.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError("Not authorized", 401));
  }
};

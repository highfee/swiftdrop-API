import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";

export const validate =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        const message = error.details
          .map((detail: any) => detail.message)
          .join(", ");
        return next(new AppError(message, 400));
      }
      next();
    } catch (error) {
      next(error);
    }
  };

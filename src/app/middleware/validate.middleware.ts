import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validateRequest =
  (schemas: { body?: AnyZodObject; query?: AnyZodObject; params?: AnyZodObject }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error: any) {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.errors,
      });
    }
  };
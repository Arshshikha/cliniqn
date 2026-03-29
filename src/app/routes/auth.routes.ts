import { Router } from "express";

import {
  registerHandler,
  loginHandler,
} from "../controllers/auth.controller";

import { validateRequest } from "../middleware/validate.middleware";

import {
  registerSchema,
  loginSchema,
} from "../schemas/auth.schema";

import {
  authLimiter,
  authLoginLimiter,
} from "../middleware/rateLimiter.middleware";

const router = Router();

//////////////////////////////
// REGISTER
//////////////////////////////

router.post(
  "/register",
  authLimiter, // prevent abuse
  validateRequest({ body: registerSchema }), // validate input
  registerHandler
);

//////////////////////////////
// LOGIN
//////////////////////////////

router.post(
  "/login",
  authLoginLimiter, // stricter limit
  validateRequest({ body: loginSchema }),
  loginHandler
);

export default router;
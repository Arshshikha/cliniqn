import rateLimit from "express-rate-limit";

//////////////////////////////
// GENERAL AUTH LIMITER
//////////////////////////////

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: "Too many requests, please try again later",
});

//////////////////////////////
// LOGIN LIMITER (STRICT)
//////////////////////////////

export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for login
  message: "Too many login attempts, please try again later",
});
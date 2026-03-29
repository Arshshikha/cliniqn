import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../db/prisma";
import { verifyAccessToken } from "../utils/jwt";

//////////////////////////////
// TYPES
//////////////////////////////

export type Role = "ADMIN" | "DOCTOR" | "STAFF";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: {
          id: string;
          email: string;
          role: Role;
          organizationId: string;
        };
      };
    }
  }
}

//////////////////////////////
// ROLE HIERARCHY (IMPORTANT)
//////////////////////////////

const ROLE_INHERITANCE: Record<Role, Role[]> = {
  ADMIN: ["ADMIN", "DOCTOR", "STAFF"],
  DOCTOR: ["DOCTOR", "STAFF"],
  STAFF: ["STAFF"],
};

//////////////////////////////
// TOKEN EXTRACTOR
//////////////////////////////

function extractBearerToken(
  authorizationHeader?: string | null
): string | null {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

//////////////////////////////
// AUTHENTICATE MIDDLEWARE
//////////////////////////////

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractBearerToken(req.header("authorization"));

    if (!token) {
      return res.status(401).json({
        message: "Missing Authorization bearer token",
      });
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // ✅ Fetch user from DB (VERY IMPORTANT)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "User not found or inactive",
      });
    }

    // Attach user to request
    req.auth = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        organizationId: user.organizationId,
      },
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

//////////////////////////////
// ROLE-BASED ACCESS CONTROL
//////////////////////////////

export const requireRoles =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = req.auth?.user.role;

    if (!role) {
      return res.status(401).json({
        message: "Unauthenticated",
      });
    }

    // If no roles specified → allow all authenticated users
    if (allowedRoles.length === 0) {
      return next();
    }

    const effectiveRoles = ROLE_INHERITANCE[role];

    if (!effectiveRoles) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const isAllowed = allowedRoles.some((allowed) =>
      effectiveRoles.includes(allowed)
    );

    if (!isAllowed) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    return next();
  };
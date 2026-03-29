import type { Request, Response, NextFunction } from "express";

import prisma from "../../db/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

//////////////////////////////
// REGISTER CONTROLLER
//////////////////////////////

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//////////////////////////////
// LOGIN CONTROLLER
//////////////////////////////

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return res.status(200).json({
      data: {
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};
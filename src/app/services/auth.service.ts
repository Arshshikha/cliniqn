import { prisma } from "../../db/prisma";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { RegisterBody, LoginBody } from "../schemas/auth.schema";

//////////////////////////////
// CUSTOM ERROR (IMPORTANT)
//////////////////////////////

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

//////////////////////////////
// TYPES
//////////////////////////////

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  user: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

//////////////////////////////
// REGISTER USER
//////////////////////////////

export const registerUser = async (
  data: RegisterBody
): Promise<AuthSession> => {
  const { name, email, password, organizationName } = data;

  // ✅ Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new HttpError(409, "Email already registered");
  }

  const hashedPassword = await hashPassword(password);

  // ✅ Transaction (VERY IMPORTANT)
  const result = await prisma.$transaction(async (tx) => {
    // Create organization
    const org = await tx.organization.create({
      data: {
        name: organizationName,
      },
    });

    // Create user
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizationId: org.id,
        role: "ADMIN", // first user becomes admin
      },
    });

    return { user, org };
  });

  const payload = {
    userId: result.user.id,
    role: result.user.role,
    organizationId: result.user.organizationId,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // store refresh token
  await prisma.user.update({
    where: { id: result.user.id },
    data: { refreshToken },
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      organizationId: result.user.organizationId,
    },
  };
};

//////////////////////////////
// LOGIN USER
//////////////////////////////

export const loginUser = async (
  data: LoginBody
): Promise<AuthSession> => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // ❌ Avoid user enumeration
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  // Optional: check if active
  if (!user.isActive) {
    throw new HttpError(403, "User is inactive");
  }

  const payload = {
    userId: user.id,
    role: user.role,
    organizationId: user.organizationId,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Update refresh token + last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      lastLoginAt: new Date(),
    },
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  };
};
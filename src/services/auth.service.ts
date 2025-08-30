import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { AppError } from "../middlewares/error.middleware.js";

export class AuthService {
  async register(name: string, email: string, password: string, phone: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }
}

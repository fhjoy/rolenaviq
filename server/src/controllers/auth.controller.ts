import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { registerSchema } from "../validators/auth.validator.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid registration data",
        errors: result.error.flatten().fieldErrors,
      });

      return;
    }

    const { firstName, lastName, email, password } = result.data;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        message: "A user with this email already exists",
      });

      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

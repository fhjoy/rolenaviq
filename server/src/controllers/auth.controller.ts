import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";

import { registerSchema } from "../validators/auth.validator.js";
import { loginSchema } from "../validators/auth.validator.js";
import { generateToken } from "../utils/token.js";
import User from "../models/User.js";
import Application from "../models/Application.js";
import { updateProfileSchema } from "../validators/auth.validator.js";
import {
  authCookieOptions,
  clearAuthCookieOptions,
} from "../config/auth-cookie.js";
import {
  DEMO_EMAIL,
  DEMO_FIRST_NAME,
  DEMO_LAST_NAME,
  DEMO_PASSWORD,
} from "../config/demo.js";
import { createDemoApplications } from "../utils/demo-data.js";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

async function ensureDemoUser() {
  let user = await User.findOne({ email: DEMO_EMAIL }).select("+passwordHash");

  if (!user) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    user = await User.create({
      firstName: DEMO_FIRST_NAME,
      lastName: DEMO_LAST_NAME,
      email: DEMO_EMAIL,
      passwordHash,
    });
  } else if (
    user.firstName !== DEMO_FIRST_NAME ||
    user.lastName !== DEMO_LAST_NAME
  ) {
    user.firstName = DEMO_FIRST_NAME;
    user.lastName = DEMO_LAST_NAME;
    await user.save();
  }

  await Application.deleteMany({
    userId: user._id,
  });

  await Application.insertMany(createDemoApplications(user._id));

  return user;
}

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

    if (normalizedEmail === DEMO_EMAIL) {
      res.status(409).json({
        message: "This email is reserved for the RoleNaviq demo account",
      });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

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
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        message: "A user with this email already exists",
      });
      return;
    }

    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid login data",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const demoUser = await ensureDemoUser();
      const token = generateToken(demoUser._id.toString());

      res.cookie("token", token, authCookieOptions);
      res.status(200).json({
        message: "Demo login successful",
        user: {
          id: demoUser._id,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          email: demoUser.email,
        },
      });
      return;
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString());
    res.cookie("token", token, authCookieOptions);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (currentUser.email === DEMO_EMAIL) {
      res.status(403).json({ message: "The demo account profile is read-only" });
      return;
    }

    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: result.error.issues[0]?.message || "Invalid profile data",
      });
      return;
    }

    const { firstName, lastName, email } = result.data;
    const normalizedEmail = email.toLowerCase();

    if (normalizedEmail === DEMO_EMAIL) {
      res.status(409).json({
        message: "This email is reserved for the RoleNaviq demo account",
      });
      return;
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, email: normalizedEmail },
      { new: true, runValidators: true },
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token", clearAuthCookieOptions);
  res.status(200).json({ message: "Logout successful" });
};

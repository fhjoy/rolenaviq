import { Schema, model } from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  isDemo: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    isDemo: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const User = model<IUser>("User", userSchema);

export default User;

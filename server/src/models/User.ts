import { Schema, model } from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  googleSub?: string;
  // Null means a new password account is pending verification; missing means a legacy account.
  emailVerifiedAt?: Date | null;
  verificationTokenHash?: string;
  verificationExpiresAt?: Date;
  verificationSentAt?: Date;
  unverifiedExpiresAt?: Date;
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
      select: false,
    },
    googleSub: { type: String, unique: true, sparse: true },
    emailVerifiedAt: { type: Date },
    verificationTokenHash: { type: String, select: false },
    verificationExpiresAt: { type: Date, select: false },
    verificationSentAt: { type: Date },
    unverifiedExpiresAt: { type: Date },
    isDemo: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("validate", function () {
  if (!this.passwordHash && !this.googleSub) {
    this.invalidate("passwordHash", "An account needs a password or Google sign-in");
  }
});

userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ unverifiedExpiresAt: 1 }, { expireAfterSeconds: 0 });

const User = model<IUser>("User", userSchema);

export default User;

import { Schema, model, Types } from "mongoose";

export const applicationStatuses = [
  "saved",
  "applied",
  "screening",
  "interview",
  "technical_interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const workplaceTypes = ["remote", "hybrid", "onsite"] as const;

export const employmentTypes = [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "internship",
] as const;

export interface IApplication {
  userId: Types.ObjectId;

  company: string;
  position: string;

  jobUrl?: string;
  location?: string;

  workplaceType?: (typeof workplaceTypes)[number];
  employmentType?: (typeof employmentTypes)[number];

  status: (typeof applicationStatuses)[number];

  technologies: string[];

  salaryMin?: number;
  salaryMax?: number;
  currency?: string;

  appliedAt?: Date;
  interviewDate?: Date;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    position: {
      type: String,
      required: true,
      trim: true,
    },

    jobUrl: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    workplaceType: {
      type: String,
      enum: workplaceTypes,
    },

    employmentType: {
      type: String,
      enum: employmentTypes,
    },

    status: {
      type: String,
      enum: applicationStatuses,
      default: "saved",
    },

    technologies: {
      type: [String],
      default: [],
    },

    salaryMin: {
      type: Number,
      min: 0,
    },

    salaryMax: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      default: "EUR",
      uppercase: true,
      trim: true,
    },

    appliedAt: {
      type: Date,
    },

    interviewDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index({
  userId: 1,
  status: 1,
  createdAt: -1,
});

const Application = model<IApplication>("Application", applicationSchema);

export default Application;

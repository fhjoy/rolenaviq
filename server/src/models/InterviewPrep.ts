import { Schema, model, Types } from "mongoose";

export interface IInterviewPrep {
  userId: Types.ObjectId;
  expiresAt?: Date;
  applicationId: Types.ObjectId;
  completedTasks: string[];
  practice: { questionId: string; answer: string; practiced: boolean }[];
  notes: string;
  sessions: {
    completedAt: Date;
    results: { questionId: string; confidence: number }[];
  }[];
}

const interviewPrepSchema = new Schema<IInterviewPrep>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    completedTasks: { type: [String], default: [] },
    practice: {
      type: [
        new Schema(
          {
            questionId: { type: String, required: true },
            answer: { type: String, default: "", maxlength: 2000 },
            practiced: { type: Boolean, default: false },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    notes: { type: String, default: "", maxlength: 5000 },
    sessions: {
      type: [
        new Schema(
          {
            completedAt: { type: Date, required: true },
            results: {
              type: [new Schema({
                questionId: { type: String, required: true },
                confidence: { type: Number, required: true, min: 1, max: 3 },
              }, { _id: false })],
              required: true,
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

interviewPrepSchema.index({ userId: 1, applicationId: 1 }, { unique: true });
interviewPrepSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IInterviewPrep>("InterviewPrep", interviewPrepSchema);

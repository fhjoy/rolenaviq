import { Schema, model, Types } from "mongoose";

export interface IInterviewPrep {
  userId: Types.ObjectId;
  applicationId: Types.ObjectId;
  completedTasks: string[];
  practice: { questionId: string; answer: string; practiced: boolean }[];
  notes: string;
}

const interviewPrepSchema = new Schema<IInterviewPrep>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
  },
  { timestamps: true },
);

interviewPrepSchema.index({ userId: 1, applicationId: 1 }, { unique: true });

export default model<IInterviewPrep>("InterviewPrep", interviewPrepSchema);

import { Schema, model, Types } from "mongoose";

export interface IAction {
  userId: Types.ObjectId;
  applicationId: Types.ObjectId;
  title: string;
  dueDate: Date;
  completedAt?: Date;
  expiresAt?: Date;
  legacyApplicationId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const actionSchema = new Schema<IAction>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  dueDate: { type: Date, required: true },
  completedAt: { type: Date },
  expiresAt: { type: Date },
  legacyApplicationId: { type: Schema.Types.ObjectId },
}, { timestamps: true });

actionSchema.index({ userId: 1, completedAt: 1, dueDate: 1, _id: 1 });
actionSchema.index({ userId: 1, applicationId: 1, createdAt: -1 });
actionSchema.index({ legacyApplicationId: 1 }, { unique: true, sparse: true });
actionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model<IAction>("Action", actionSchema);

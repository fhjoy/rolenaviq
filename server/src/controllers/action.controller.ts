import { type Request, type Response } from "express";
import { isValidObjectId, type QueryFilter } from "mongoose";
import Application from "../models/Application.js";
import Action, { type IAction } from "../models/Action.js";
import { actionQuerySchema, createActionSchema, updateActionSchema } from "../validators/action.validator.js";

export async function listActions(req: Request, res: Response): Promise<void> {
  const parsed = actionQuerySchema.safeParse(req.query);
  if (!parsed.success || (parsed.data.applicationId && !isValidObjectId(parsed.data.applicationId))) {
    res.status(400).json({ message: "Invalid action query" }); return;
  }
  const { status, applicationId, page, limit } = parsed.data;
  const filter: QueryFilter<IAction> = { userId: req.userId };
  if (applicationId) filter.applicationId = applicationId;
  if (status === "open") filter.completedAt = { $exists: false };
  if (status === "completed") filter.completedAt = { $exists: true };
  const [actions, total] = await Promise.all([
    Action.find(filter).sort(status === "completed" ? { completedAt: -1, _id: -1 } : { dueDate: 1, _id: 1 })
      .skip((page - 1) * limit).limit(limit).populate("applicationId", "company position"),
    Action.countDocuments(filter),
  ]);
  res.json({ actions: actions.filter(action => action.applicationId), pagination: { page, limit, total, hasNextPage: page * limit < total } });
}

export async function createAction(req: Request, res: Response): Promise<void> {
  const parsed = createActionSchema.safeParse(req.body);
  if (!parsed.success || !isValidObjectId(parsed.data.applicationId)) {
    res.status(400).json({ message: "Invalid action data", errors: parsed.success ? undefined : parsed.error.flatten().fieldErrors }); return;
  }
  const application = await Application.findOne({ _id: parsed.data.applicationId, userId: req.userId });
  if (!application) { res.status(404).json({ message: "Application not found" }); return; }
  const action = await Action.create({ ...parsed.data, userId: req.userId, expiresAt: application.expiresAt });
  res.status(201).json({ action });
}

export async function updateAction(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  const parsed = updateActionSchema.safeParse(req.body);
  if (!isValidObjectId(id) || !parsed.success) { res.status(400).json({ message: "Invalid action data" }); return; }
  const { completed, ...fields } = parsed.data;
  const update = {
    $set: { ...fields, ...(completed === true ? { completedAt: new Date() } : {}) },
    ...(completed === false ? { $unset: { completedAt: 1 } } : {}),
  };
  const action = await Action.findOneAndUpdate({ _id: id, userId: req.userId }, update, { returnDocument: "after", runValidators: true });
  if (!action) { res.status(404).json({ message: "Action not found" }); return; }
  res.json({ action });
}

export async function deleteAction(req: Request, res: Response): Promise<void> {
  if (!isValidObjectId(req.params.id)) { res.status(400).json({ message: "Invalid action ID" }); return; }
  const action = await Action.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!action) { res.status(404).json({ message: "Action not found" }); return; }
  res.json({ message: "Action deleted" });
}

import { type Request, type Response } from "express";
import Application from "../models/Application.js";
import Action from "../models/Action.js";
import User from "../models/User.js";
import { Types } from "mongoose";
import { applicationIdentity, csvCell, csvColumns, decodeApplications } from "../utils/application-csv.js";

export async function exportApplications(req: Request, res: Response): Promise<void> {
  const applications = await Application.find({ userId: req.userId }).sort({ createdAt: 1 });
  const actions = await Action.find({ userId: req.userId, applicationId: { $in: applications.map(application => application._id) } });
  const actionsByApplication = new Map<string, typeof actions>();
  for (const action of actions) {
    const key = action.applicationId.toString();
    actionsByApplication.set(key, [...(actionsByApplication.get(key) ?? []), action]);
  }
  const rows = applications.map(application => {
    const record: Record<string, unknown> = {
      company: application.company, position: application.position, status: application.status,
      jobUrl: application.jobUrl, jobDescription: application.jobDescription, location: application.location,
      workplaceType: application.workplaceType, employmentType: application.employmentType,
      technologies: application.technologies.join("; "), salaryMin: application.salaryMin,
      salaryMax: application.salaryMax, currency: application.currency,
      appliedAt: application.appliedAt?.toISOString().slice(0, 10),
      interviewDate: application.interviewDate?.toISOString(), notes: application.notes,
      actions: JSON.stringify((actionsByApplication.get(application._id.toString()) ?? []).map(action => ({
        title: action.title, dueDate: action.dueDate.toISOString().slice(0, 10),
        ...(action.completedAt ? { completedAt: action.completedAt.toISOString() } : {}),
      }))),
    };
    return csvColumns.map(column => csvCell(record[column])).join(",");
  });
  res.type("text/csv; charset=utf-8");
  res.set("Content-Disposition", 'attachment; filename="rolenaviq-applications.csv"');
  res.send(`\uFEFF${csvColumns.join(",")}\r\n${rows.join("\r\n")}${rows.length ? "\r\n" : ""}`);
}

async function prepareImport(req: Request) {
  if (typeof req.body !== "string") throw new Error("Send a CSV file as text/csv");
  const parsed = decodeApplications(req.body);
  const existing = await Application.find({ userId: req.userId }).select("company position jobUrl appliedAt");
  const seen = new Set(existing.map(applicationIdentity));
  const duplicates: number[] = [];
  const toImport = parsed.valid.filter(item => {
    const key = applicationIdentity(item.application);
    if (seen.has(key)) { duplicates.push(item.row); return false; }
    seen.add(key); return true;
  });
  return { ...parsed, duplicates, toImport };
}

export async function previewImport(req: Request, res: Response): Promise<void> {
  try {
    const result = await prepareImport(req);
    res.json({ total: result.valid.length + result.errors.length, importable: result.toImport.length, duplicates: result.duplicates, errors: result.errors });
  } catch (error) { res.status(400).json({ message: error instanceof Error ? error.message : "Invalid CSV" }); }
}

export async function importApplications(req: Request, res: Response): Promise<void> {
  const createdIds: Types.ObjectId[] = [];
  try {
    const result = await prepareImport(req);
    if (result.errors.length) { res.status(400).json({ message: "Fix invalid rows before importing", errors: result.errors }); return; }
    const user = await User.findById(req.userId).select("expiresAt");
    if (!user || (user.expiresAt && user.expiresAt < new Date())) { res.status(401).json({ message: "Session expired" }); return; }
    for (const item of result.toImport) {
      const application = await Application.create({ ...item.application, userId: req.userId, expiresAt: user.expiresAt });
      createdIds.push(application._id);
      if (item.actions.length) await Action.insertMany(item.actions.map(action => ({
        userId: req.userId, applicationId: application._id, title: action.title,
        dueDate: new Date(`${action.dueDate}T00:00:00.000Z`),
        completedAt: action.completedAt ? new Date(action.completedAt) : undefined,
        expiresAt: user.expiresAt,
      })));
    }
    res.status(201).json({ imported: result.toImport.length, duplicates: result.duplicates });
  } catch (error) {
    if (createdIds.length) {
      await Promise.all([
        Action.deleteMany({ userId: req.userId, applicationId: { $in: createdIds } }),
        Application.deleteMany({ userId: req.userId, _id: { $in: createdIds } }),
      ]);
    }
    if (error instanceof Error && /CSV|file/i.test(error.message)) { res.status(400).json({ message: error.message }); return; }
    console.error("Import applications error:", error);
    res.status(500).json({ message: "Could not import applications" });
  }
}

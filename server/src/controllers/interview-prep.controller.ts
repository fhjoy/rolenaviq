import { type Request, type Response } from "express";
import { isValidObjectId } from "mongoose";

import Application from "../models/Application.js";
import InterviewPrep from "../models/InterviewPrep.js";
import { interviewPrepSchema, practiceSessionSchema } from "../validators/interview-prep.validator.js";

export const listInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({
      userId: req.userId,
      status: { $in: ["interview", "technical_interview"] },
    })
      .select("company position status interviewDate")
      .sort({ interviewDate: 1 })
      .lean();

    const preparations = await InterviewPrep.find({
      userId: req.userId,
      applicationId: { $in: applications.map(application => application._id) },
    }).select("applicationId completedTasks practice sessions").lean();
    const progress = new Map(preparations.map(prep => [String(prep.applicationId), {
      completedTasks: prep.completedTasks.length,
      practicedQuestions: prep.practice.filter(item => item.practiced).length,
      sessions: prep.sessions?.length ?? 0,
    }]));
    res.json({ applications: applications.map(application => ({
      ...application,
      progress: progress.get(String(application._id)) ?? {
        completedTasks: 0, practicedQuestions: 0, sessions: 0,
      },
    })) });
  } catch (error) {
    console.error("List interviews error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function findOwnedApplication(req: Request, res: Response) {
  const { applicationId } = req.params;

  if (!isValidObjectId(applicationId)) {
    res.status(400).json({ message: "Invalid application ID" });
    return null;
  }

  const application = await Application.findOne({
    _id: applicationId,
    userId: req.userId,
  }).select("company position status interviewDate");

  if (!application) {
    res.status(404).json({ message: "Application not found" });
    return null;
  }

  return application;
}

export const getInterviewPrep = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await findOwnedApplication(req, res);
    if (!application) return;

    const prep = await InterviewPrep.findOne({
      applicationId: application._id,
      userId: req.userId,
    });

    res.json({
      application,
      prep: prep ?? { completedTasks: [], practice: [], notes: "", sessions: [] },
    });
  } catch (error) {
    console.error("Get interview prep error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const recordPracticeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await findOwnedApplication(req, res);
    if (!application) return;

    const result = practiceSessionSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid practice session", errors: result.error.flatten().fieldErrors });
      return;
    }

    const session = { completedAt: new Date(), results: result.data.results };
    const prep = await InterviewPrep.findOneAndUpdate(
      { applicationId: application._id, userId: req.userId },
      {
        $setOnInsert: { completedTasks: [], practice: [], notes: "" },
        $push: { sessions: { $each: [session], $slice: -20 } },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    res.status(201).json({ session: prep.sessions.at(-1) });
  } catch (error) {
    console.error("Record practice session error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const saveInterviewPrep = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await findOwnedApplication(req, res);
    if (!application) return;

    const result = interviewPrepSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Invalid interview preparation data",
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const prep = await InterviewPrep.findOneAndUpdate(
      { applicationId: application._id, userId: req.userId },
      { $set: result.data },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    res.json({ application, prep });
  } catch (error) {
    console.error("Save interview prep error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

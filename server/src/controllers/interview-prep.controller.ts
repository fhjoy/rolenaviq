import { type Request, type Response } from "express";
import { isValidObjectId } from "mongoose";

import Application from "../models/Application.js";
import InterviewPrep from "../models/InterviewPrep.js";
import { interviewPrepSchema } from "../validators/interview-prep.validator.js";

export const listInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({
      userId: req.userId,
      status: { $in: ["interview", "technical_interview"] },
    })
      .select("company position status interviewDate")
      .sort({ interviewDate: 1 })
      .lean();

    res.json({ applications });
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
      prep: prep ?? { completedTasks: [], practice: [], notes: "" },
    });
  } catch (error) {
    console.error("Get interview prep error:", error);
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

import { type Request, type Response } from "express";
import { Types } from "mongoose";

import Application from "../models/Application.js";
import Action from "../models/Action.js";
import InterviewPrep from "../models/InterviewPrep.js";

interface StatusCount {
  _id: string;
  count: number;
}

interface MonthlyCount {
  _id: string;
  count: number;
}

export const getDashboardStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Authentication required",
      });

      return;
    }

    const userId = new Types.ObjectId(req.userId);

    const [statusCounts, monthlyCounts, nextActions, upcomingInterviews] = await Promise.all([
      Application.aggregate<StatusCount>([
        {
          $match: {
            userId,
          },
        },

        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Application.aggregate<MonthlyCount>([
        {
          $match: {
            userId,
          },
        },

        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: -1,
          },
        },

        {
          $limit: 12,
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),
      Action.find({ userId, completedAt: { $exists: false } })
        .sort({ dueDate: 1, _id: 1 })
        .limit(6)
        .populate("applicationId", "company position"),
      Application.find({ userId, status: { $in: ["interview", "technical_interview"] }, interviewDate: { $gte: new Date() } })
        .sort({ interviewDate: 1, _id: 1 }).limit(3).select("company position interviewDate"),
    ]);

    const prep = await InterviewPrep.find({ userId, applicationId: { $in: upcomingInterviews.map(item => item._id) } });
    const prepByApplication = new Map(prep.map(item => [item.applicationId.toString(), item]));
    const interviewPrep = upcomingInterviews.map(application => {
      const progress = prepByApplication.get(application._id.toString());
      return {
        applicationId: application._id,
        company: application.company,
        position: application.position,
        interviewDate: application.interviewDate,
        completedTasks: progress?.completedTasks.length ?? 0,
        practicedQuestions: progress?.practice.filter(item => item.practiced).length ?? 0,
        sessions: progress?.sessions.length ?? 0,
      };
    });

    const counts: Record<string, number> = {};

    for (const item of statusCounts) {
      counts[item._id] = item.count;
    }

    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

    const interviews =
      (counts.interview ?? 0) + (counts.technical_interview ?? 0);

    const responded =
      (counts.screening ?? 0) +
      interviews +
      (counts.offer ?? 0) +
      (counts.rejected ?? 0);

    const submitted = total - (counts.saved ?? 0);

    const responseRate =
      submitted > 0 ? Math.round((responded / submitted) * 100) : 0;

    const statusDistribution = [
      {
        status: "Saved",
        count: counts.saved ?? 0,
      },
      {
        status: "Applied",
        count: counts.applied ?? 0,
      },
      {
        status: "Screening",
        count: counts.screening ?? 0,
      },
      {
        status: "Interview",
        count: counts.interview ?? 0,
      },
      {
        status: "Technical Interview",
        count: counts.technical_interview ?? 0,
      },
      {
        status: "Offer",
        count: counts.offer ?? 0,
      },
      {
        status: "Rejected",
        count: counts.rejected ?? 0,
      },
      {
        status: "Withdrawn",
        count: counts.withdrawn ?? 0,
      },
    ];

    const monthlyActivity = monthlyCounts.map((item) => ({
      month: item._id,
      count: item.count,
    }));

    res.status(200).json({
      stats: {
        total,

        applied: counts.applied ?? 0,

        interviews,

        offers: counts.offer ?? 0,

        rejected: counts.rejected ?? 0,

        responseRate,
      },

      statusDistribution,

      monthlyActivity,

      nextActions: nextActions.filter(action => action.applicationId),
      interviewPrep,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

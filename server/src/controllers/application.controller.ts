import { type Request, type Response } from "express";
import { type QueryFilter, isValidObjectId } from "mongoose";

import Application, { type IApplication } from "../models/Application.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationQuerySchema,
} from "../validators/application.validator.js";
import {
  canMoveApplication,
  isInterviewStatus,
  isReopenTransition,
} from "../utils/application-workflow.js";
import { escapeRegex } from "../utils/regex.js";

export const createApplication = async (
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

    const result = createApplicationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid application data",
        errors: result.error.flatten().fieldErrors,
      });

      return;
    }

    const application = await Application.create({
      ...result.data,
      userId: req.userId,
    });

    res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    console.error("Create application error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getApplications = async (
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

    const result = applicationQuerySchema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid query parameters",
        errors: result.error.flatten().fieldErrors,
      });

      return;
    }

    const { search, status, workplaceType, employmentType, page, limit, sort } =
      result.data;

    const filter: QueryFilter<IApplication> = {
      userId: req.userId,
    };

    if (status) {
      filter.status = status;
    }

    if (workplaceType) {
      filter.workplaceType = workplaceType;
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { company: searchRegex },
        { position: searchRegex },
        { location: searchRegex },
        { technologies: searchRegex },
      ];
    }

    const sortDescending = sort.startsWith("-");
    const sortField = sortDescending ? sort.substring(1) : sort;
    const sortOption = {
      [sortField]: sortDescending ? -1 : 1,
    } as Record<string, 1 | -1>;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(filter).sort(sortOption).skip(skip).limit(limit),
      Application.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getApplicationById = async (
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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        message: "Invalid application ID",
      });

      return;
    }

    const application = await Application.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!application) {
      res.status(404).json({
        message: "Application not found",
      });

      return;
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    console.error("Get application error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateApplication = async (
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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        message: "Invalid application ID",
      });

      return;
    }

    const result = updateApplicationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Invalid application data",
        errors: result.error.flatten().fieldErrors,
      });

      return;
    }

    const currentApplication = await Application.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!currentApplication) {
      res.status(404).json({
        message: "Application not found",
      });

      return;
    }

    const { reopen = false, ...applicationUpdates } = result.data;
    const nextStatus = applicationUpdates.status ?? currentApplication.status;
    const statusChanged = nextStatus !== currentApplication.status;

    if (reopen) {
      if (
        !statusChanged ||
        !isReopenTransition(currentApplication.status, nextStatus)
      ) {
        res.status(409).json({
          message: "Only rejected or withdrawn applications can be reopened to Applied",
        });

        return;
      }
    } else if (
      statusChanged &&
      !canMoveApplication(currentApplication.status, nextStatus)
    ) {
      res.status(409).json({
        message: "This status transition is not allowed",
      });

      return;
    }

    const nextInterviewDate =
      applicationUpdates.interviewDate === null
        ? undefined
        : applicationUpdates.interviewDate ?? currentApplication.interviewDate;

    if (isInterviewStatus(nextStatus) && !nextInterviewDate) {
      res.status(400).json({
        message: "Interview date and time is required for interview stages",
      });

      return;
    }

    const fieldsToSet = Object.fromEntries(
      Object.entries(applicationUpdates).filter(([, value]) => value !== null),
    );

    const fieldsToUnset = Object.fromEntries(
      Object.entries(applicationUpdates)
        .filter(([, value]) => value === null)
        .map(([key]) => [key, 1]),
    );

    const updateOperations: {
      $set?: Record<string, unknown>;
      $unset?: Record<string, number>;
    } = {};

    if (Object.keys(fieldsToSet).length > 0) {
      updateOperations.$set = fieldsToSet;
    }

    if (Object.keys(fieldsToUnset).length > 0) {
      updateOperations.$unset = fieldsToUnset;
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      updateOperations,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!application) {
      res.status(404).json({
        message: "Application not found",
      });

      return;
    }

    res.status(200).json({
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteApplication = async (
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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({
        message: "Invalid application ID",
      });

      return;
    }

    const application = await Application.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!application) {
      res.status(404).json({
        message: "Application not found",
      });

      return;
    }

    res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

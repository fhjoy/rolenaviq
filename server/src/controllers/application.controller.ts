import { type Request, type Response } from "express";
import { isValidObjectId } from "mongoose";

import Application from "../models/Application.js";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../validators/application.validator.js";

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

    const applications = await Application.find({
      userId: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: applications.length,
      applications,
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

    const application = await Application.findOneAndUpdate(
      {
        _id: id,
        userId: req.userId,
      },
      result.data,
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

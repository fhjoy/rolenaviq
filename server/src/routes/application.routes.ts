import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplications,
  updateApplication,
} from "../controllers/application.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createApplication);

router.get("/", getApplications);

router.get("/:id", getApplicationById);

router.patch("/:id", updateApplication);

router.delete("/:id", deleteApplication);

export default router;

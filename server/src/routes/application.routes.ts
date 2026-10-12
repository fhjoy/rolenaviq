import { Router, text } from "express";
import { exportApplications, importApplications, previewImport } from "../controllers/application-transfer.controller.js";

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

router.get("/export", exportApplications);
router.post("/import/preview", text({ type: "text/csv", limit: "1mb" }), previewImport);
router.post("/import", text({ type: "text/csv", limit: "1mb" }), importApplications);

router.get("/:id", getApplicationById);

router.patch("/:id", updateApplication);

router.delete("/:id", deleteApplication);

export default router;

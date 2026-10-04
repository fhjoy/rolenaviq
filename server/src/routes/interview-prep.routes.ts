import { Router } from "express";

import {
  getInterviewPrep,
  listInterviews,
  saveInterviewPrep,
  recordPracticeSession,
} from "../controllers/interview-prep.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/interviews", listInterviews);
router.get("/interviews/:applicationId", getInterviewPrep);
router.put("/interviews/:applicationId", saveInterviewPrep);
router.post("/interviews/:applicationId/sessions", recordPracticeSession);

export default router;

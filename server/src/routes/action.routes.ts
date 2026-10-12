import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createAction, deleteAction, listActions, updateAction } from "../controllers/action.controller.js";

const router = Router();
router.use(authenticate);
router.get("/", listActions);
router.post("/", createAction);
router.patch("/:id", updateAction);
router.delete("/:id", deleteAction);
export default router;

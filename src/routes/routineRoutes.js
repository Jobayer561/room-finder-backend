import Router from "express";
import {
  getRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../controllers/routineController.js";

const router = Router();

router.get("/", getRoutines);
router.post("/", createRoutine);
router.patch("/:id", updateRoutine);
router.delete("/:id", deleteRoutine);
export default router;

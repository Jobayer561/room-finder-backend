import Router from "express";
import {
  getAllRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../controllers/routineController.js";

const router = Router();

router.get("/", getAllRoutines);
router.post("/", createRoutine);
router.patch("/:id", updateRoutine);
router.delete("/:id", deleteRoutine);
export default router;

import { Router } from "express";
import { getAllCourses, createCourse,updateCourse, deleteCourse } from "../controllers/courseController.js";

const router = Router();

router.get("/", getAllCourses);
router.post("/", createCourse);
router.patch("/:id", updateCourse);
router.delete("/:id",deleteCourse)
export default router;

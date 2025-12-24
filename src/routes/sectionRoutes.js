import { Router } from "express";
import { getAllSections, createSection, updateSection, deleteSection } from "../controllers/sectionController.js";
const router = Router();

router.get("/", getAllSections);
router.post("/", createSection);
router.patch("/:id", updateSection);
router.delete("/:id", deleteSection);

export default router;

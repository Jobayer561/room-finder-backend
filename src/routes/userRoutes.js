import { Router } from "express";
import {
  deleteUser,
  getALlUsers,
  getUserById,
  updateUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/", getALlUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

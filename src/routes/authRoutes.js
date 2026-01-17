import { Router } from "express";
import {
  syncFirebaseUser,
  getAllUsers,
  updateUserRole,
} from "../controllers/authController.js";

const router = Router();

router.post("/sync-firebase-user", syncFirebaseUser);
router.get("/users", getAllUsers);
router.patch("/users/:id", updateUserRole);

export default router;
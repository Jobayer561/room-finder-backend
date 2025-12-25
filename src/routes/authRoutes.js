import { Router } from "express";
import {
  syncFirebaseUser,
  getAllUsers,
} from "../controllers/authController.js";

const router = Router();

router.post("/sync-firebase-user", syncFirebaseUser);
router.get("/users", getAllUsers);

export default router;

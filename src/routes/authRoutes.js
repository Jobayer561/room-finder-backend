import { Router } from "express";
import { getCurrentUser, userSignIn, userSignUp } from "../controllers/authController.js";
import { authMiddleWare } from "../middleware/auth.js";


const router = Router();

router.post("/sign-up", userSignUp);
router.post("/sign-in", userSignIn);
router.get("/me", authMiddleWare, getCurrentUser);
export default router;

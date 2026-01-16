import { Router } from "express";
import {
  getAllRoomStatuses,
  createRoomStatus,
  updateRoomStatus,
  deleteRoomStatus
} from "../controllers/RoomStatusController.js";


const router = Router();

router.get("/", getAllRoomStatuses);
router.post("/", createRoomStatus);
router.patch("/:id", updateRoomStatus);
router.delete("/:id", deleteRoomStatus);

export default router;
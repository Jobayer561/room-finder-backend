import admin from "../middleware/firebaseAdmin.js";
import { prisma } from "../database/prisma.js";

export const authMiddleWare = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

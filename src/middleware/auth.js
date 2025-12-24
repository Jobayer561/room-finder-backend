import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";
export const authMiddleWare = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized access" });
  }
  const accessToken = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET_KEY;
  jwt.verify(accessToken, secretKey, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const userId = decoded.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      omit: {
        passwordHash: true,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }
    req.user = user;
    next();
  });
};

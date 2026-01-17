import admin from "../middleware/firebaseAdmin.js";
import { prisma } from "../database/prisma.js";

export const syncFirebaseUser = async (req, res) => {
  try {
    console.log("Request received:", req.body);
    const { idToken, displayName: providedName } = req.body;
    if (!idToken) {
      return res
        .status(400)
        .json({ status: "error", message: "idToken is required" });
    }

    console.log("Verifying token...");
    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded token:", decoded);
    const { uid, email, name } = decoded;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message:
          "Email claim missing in token. Use a provider that provides email.",
      });
    }

    const displayName = providedName || name || email.split("@")[0];

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: displayName },
      create: {
        id: uid,
        email,
        name: displayName,
        role: "STUDENT",
      },
    });

    const created = user.created_at === user.updated_at;

    return res.status(created ? 201 : 200).json({
      status: "success",
      message: created
        ? "User created and synced successfully"
        : "User synced successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (err) {
    console.error("syncFirebaseUser error:", err);
    const code = err.code === "auth/argument-error" ? 401 : 500;
    return res.status(code).json({
      status: "error",
      message: err.message || "Failed to sync user",
    });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.json({
    status: "success",
    data: { users, count: users.length },
    message: "Users fetched successfully",
  });
};

export const getUserRole = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.json({
      status: "success",
      role: user.role,
    });
  } catch (error) {
    console.error("getUserRole error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch user role",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["ADMIN", "ASSISTANT_ADMIN", "TEACHER", "STUDENT"];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updated_at: true,
      },
    });

    return res.json({
      status: "success",
      message: "User role updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update user role",
    });
  }
};

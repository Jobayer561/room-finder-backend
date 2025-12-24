import { prisma } from "../database/prisma.js";
import { z } from "zod";
export const getALlUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  res.send({
    status: "success",
    data: { users },
    message: "User fetched Successfully",
  });
};

export const getUserById = async (req, res) => {
  const userId = req.params.id;
  const userGetSchema = z.object({
    id: z.uuid(),
  });
  const { success, error } = userGetSchema.safeParse({
    id: userId,
  });
  if (!success) {
    return res
      .status(400)
      .json({ message: "Validation error", data: z.flattenError(error) });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      passwordHash: true,
    },
  });
  if (!user) {
    return res.status(404).json({ status: "error", message: "user not found" });
  }
  res.json({
    status: "success",
    message: "User fetched successfully",
    data: { user },
  });
};

export const updateUser = async (req, res) => {
  const Userid = req.params.id;
  const userUpdateSchema = z.object({
    id: z.uuid(),
    name: z.string().optional(),
  });
  const { success, data, error } = userUpdateSchema.safeParse({
    id: Userid,
    name: req.body.name,
  });

  if (!success) {
    return res
      .status(400)
      .json({ message: "validation failed", data: z.flattenError(error) });
  }
  const user = {
    name: req.body.name,
  };
  const updatedUser = await prisma.user.update({
    where: {
      id: Userid,
    },

    data: user,
    omit: {
      passwordHash: true,
    },
  });
  res.json({
    status: "success",
    data: { user: updatedUser },
    message: "User updated Successfully",
  });
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  const userDeleteSchema = z.object({
    id: z.uuid(),
  });
  const { success, error } = userDeleteSchema.safeParse({
    id: userId,
  });
  if (!success) {
    return res
      .status(400)
      .json({ message: "validation failed", data: z.flattenError(error) });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return res.status(404).json({ status: "error", message: "user not found" });
  }
  const deletedUser = await prisma.user.delete({
    where: {
      id: userId,
    },
    omit: {
      passwordHash: true,
    },
  });
  res.json({
    status: "success",
    data: { user: deletedUser },
    message: "User deleted Successfully",
  });
};

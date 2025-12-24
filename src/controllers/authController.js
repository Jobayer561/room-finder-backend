import { prisma } from "../database/prisma.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const userSignUp = async (req, res) => {
  const userCreateSchema = z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
  });

  const { success, data, error } = userCreateSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: error.errors });
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = {
    name: data.name,
    email: data.email,
    passwordHash,
  };
  const createdUser = await prisma.user.create({ data: user });
  res.status(201).json({ user: createdUser });
};
export const userSignIn = async (req, res) => {
  const userSignInSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
  });
  const { success, data, error } = userSignInSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ message: "Validation failed", data: z.flattenError(error) });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }
  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.passwordHash
  );
  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid Password" });
  }

  const secretKey = process.env.JWT_SECRET_KEY;
  const accessToken = jwt.sign({ sub: user.id }, secretKey, {
    expiresIn: "7d",
  });
  res.json({
    status: "success",
    message: "User signed in successfully",
    data: { accessToken },
  });
};

export const getCurrentUser = async (req, res) => {
  const user = req.user;
  res.json({
    status: "success",
    message: "User Fetched Successfully",
    data: { user },
  });
};

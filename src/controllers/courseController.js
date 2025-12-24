import { prisma } from "../database/prisma.js";
import { z } from "zod";

export const getAllCourses = async (req, res) => {
  const courses = await prisma.course.findMany();

  res.json({
    status: "success",
    data: { courses },
    message: "Courses fetched successfully",
  });
};

export const createCourse = async (req, res) => {
  const courseCreateSchema = z.object({
    course_code: z.string().min(1).max(20),
    course_name: z.string().min(1).max(100),
  });

  const { success, data, error } = courseCreateSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }



  const course = await prisma.course.create({
    data: {
      course_code: data.course_code,
      course_name: data.course_name,
    },
    select: {
      id: true,
      course_code: true,
      course_name: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.status(201).json({
    status: "success",
    data: { course },
    message: "Course created successfully",
  });
};

export const updateCourse = async (req, res) => {
  const courseId = req.params.id;
  const courseUpdateSchema = z.object({
    id: z.uuid(),
    course_code: z.string().min(1).max(20).optional(),
    course_name: z.string().min(1).max(100).optional(),
  });

  const { success, data, error } = courseUpdateSchema.safeParse({
    id: courseId,
    course_code: req.body.course_code,
    course_name: req.body.course_name,
  });

  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }


  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(data.course_code && { course_code: data.course_code }),
      ...(data.course_name && { course_name: data.course_name }),
    },
    select: {
      id: true,
      course_code: true,
      course_name: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.json({
    status: "success",
    data: { course: updatedCourse },
    message: "Course updated successfully",
  });
};

export const deleteCourse = async (req, res) => {
  const courseId = req.params.id;
  const courseDeleteSchema = z.object({
    id: z.uuid(),
  });

  const { success, error } = courseDeleteSchema.safeParse({ id: courseId });
  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }


  const deletedCourse = await prisma.course.delete({
    where: { id: courseId },
    select: {
      id: true,
      course_code: true,
      course_name: true,
    },
  });

  res.json({
    status: "success",
    data: { course: deletedCourse },
    message: "Course deleted successfully",
  });
};
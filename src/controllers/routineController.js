import { prisma } from "../database/prisma.js";
import { z } from "zod";

export const getAllRoutines = async (req, res) => {
  const routines = await prisma.routine.findMany({
    select: {
      id: true,
      day: true,
      start_time: true,
      end_time: true,
      class_type: true,
      teacher: true,
      created_at: true,
      updated_at: true,
      course: {
        select: {
          course_code: true,
          course_name: true,
        },
      },
      section: {
        select: {
          section_name: true,
        },
      },
      room: {
        select: {
          room_number: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  res.json({
    status: "success",
    data: { routines },
    message: "Routines fetched successfully",
  });
};

export const createRoutine = async (req, res) => {
  const routineCreateSchema = z.object({
    day: z.string().min(1).max(10),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    class_type: z.string().min(1).max(20),
    teacher: z.string().min(1).max(20),
    course_id: z.uuid(),
    section_id: z.uuid(),
    room_id: z.uuid(),
  });

  const { success, data, error } = routineCreateSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }

  const [courseExists, sectionExists, roomExists] = await Promise.all([
    prisma.course.findUnique({ where: { id: data.course_id } }),
    prisma.section.findUnique({ where: { id: data.section_id } }),
    prisma.room.findUnique({ where: { id: data.room_id } }),
  ]);

  if (!courseExists) {
    return res.status(404).json({
      status: "error",
      message: "Course not found",
    });
  }

  if (!sectionExists) {
    return res.status(404).json({
      status: "error",
      message: "Section not found",
    });
  }

  if (!roomExists) {
    return res.status(404).json({
      status: "error",
      message: "Room not found",
    });
  }

  const conflictingRoutine = await prisma.routine.findFirst({
    where: {
      day: data.day,
      start_time: data.start_time,
      end_time: data.end_time,
      room_id: data.room_id,
    },
  });

  if (conflictingRoutine) {
    return res.status(409).json({
      status: "error",
      message: "A routine already exists for this room at the specified time",
    });
  }

  const routine = await prisma.routine.create({
    data: {
      day: data.day,
      start_time: data.start_time,
      end_time: data.end_time,
      class_type: data.class_type,
      teacher: data.teacher,
      course_id: data.course_id,
      section_id: data.section_id,
      room_id: data.room_id,
    },
    select: {
      id: true,
      day: true,
      start_time: true,
      end_time: true,
      class_type: true,
      teacher: true,
      created_at: true,
      updated_at: true,
      course: {
        select: {
          course_code: true,
          course_name: true,
        },
      },
      section: {
        select: {
          section_name: true,
        },
      },
      room: {
        select: {
          room_number: true,
        },
      },
    },
  });

  res.status(201).json({
    status: "success",
    data: { routine },
    message: "Routine created successfully",
  });
};

export const updateRoutine = async (req, res) => {
  const routineId = req.params.id;
  const routineUpdateSchema = z.object({
    id: z.uuid(),
    day: z.string().min(1).max(10).optional(),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")
      .optional(),
    end_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format")
      .optional(),
    class_type: z.string().min(1).max(20).optional(),
    teacher: z.string().min(1).max(20).optional(),
    course_id: z.uuid().optional(),
    section_id: z.uuid().optional(),
    room_id: z.uuid().optional(),
  });

  const { success, data, error } = routineUpdateSchema.safeParse({
    id: routineId,
    ...req.body,
  });

  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }

  const routineExists = await prisma.routine.findUnique({
    where: { id: routineId },
  });

  if (!routineExists) {
    return res
      .status(404)
      .json({ status: "error", message: "Routine not found" });
  }

  if (data.course_id) {
    const courseExists = await prisma.course.findUnique({
      where: { id: data.course_id },
    });
    if (!courseExists) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }
  }

  if (data.section_id) {
    const sectionExists = await prisma.section.findUnique({
      where: { id: data.section_id },
    });
    if (!sectionExists) {
      return res.status(404).json({
        status: "error",
        message: "Section not found",
      });
    }
  }

  if (data.room_id) {
    const roomExists = await prisma.room.findUnique({
      where: { id: data.room_id },
    });
    if (!roomExists) {
      return res.status(404).json({
        status: "error",
        message: "Room not found",
      });
    }
  }

  if (data.day || data.start_time || data.end_time || data.room_id) {
    const conflictingRoutine = await prisma.routine.findFirst({
      where: {
        id: { not: routineId },
        day: data.day || routineExists.day,
        start_time: data.start_time || routineExists.start_time,
        end_time: data.end_time || routineExists.end_time,
        room_id: data.room_id || routineExists.room_id,
      },
    });

    if (conflictingRoutine) {
      return res.status(409).json({
        status: "error",
        message: "A routine already exists for this room at the specified time",
      });
    }
  }

  const updatedRoutine = await prisma.routine.update({
    where: { id: routineId },
    data: {
      ...(data.day && { day: data.day }),
      ...(data.start_time && { start_time: data.start_time }),
      ...(data.end_time && { end_time: data.end_time }),
      ...(data.class_type && { class_type: data.class_type }),
      ...(data.teacher && { teacher: data.teacher }),
      ...(data.course_id && { course_id: data.course_id }),
      ...(data.section_id && { section_id: data.section_id }),
      ...(data.room_id && { room_id: data.room_id }),
    },
    select: {
      id: true,
      day: true,
      start_time: true,
      end_time: true,
      class_type: true,
      teacher: true,
      created_at: true,
      updated_at: true,
      course: {
        select: {
          course_code: true,
          course_name: true,
        },
      },
      section: {
        select: {
          section_name: true,
        },
      },
      room: {
        select: {
          room_number: true,
        },
      },
    },
  });

  res.json({
    status: "success",
    data: { routine: updatedRoutine },
    message: "Routine updated successfully",
  });
};

export const deleteRoutine = async (req, res) => {
  const routineId = req.params.id;
  const routineDeleteSchema = z.object({
    id: z.uuid(),
  });

  const { success, error } = routineDeleteSchema.safeParse({ id: routineId });
  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }

  const routineExists = await prisma.routine.findUnique({
    where: { id: routineId },
  });

  if (!routineExists) {
    return res
      .status(404)
      .json({ status: "error", message: "Routine not found" });
  }

  const deletedRoutine = await prisma.routine.delete({
    where: { id: routineId },
    select: {
      id: true,
      day: true,
      start_time: true,
      end_time: true,
      class_type: true,
      teacher: true,
    },
  });

  res.json({
    status: "success",
    data: { routine: deletedRoutine },
    message: "Routine deleted successfully",
  });
};

export const getRoutinesByDay = async (req, res) => {
  const day = req.params.day;

  if (!day) {
    return res.status(400).json({
      status: "error",
      message: "Day parameter is required",
    });
  }

  const routines = await prisma.routine.findMany({
    where: {
      day: {
        equals: day,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      day: true,
      start_time: true,
      end_time: true,
      class_type: true,
      teacher: true,
      course: {
        select: {
          course_code: true,
          course_name: true,
        },
      },
      section: {
        select: {
          section_name: true,
        },
      },
      room: {
        select: {
          room_number: true,
        },
      },
    },
    orderBy: [{ start_time: "asc" }, { room: { room_number: "asc" } }],
  });

  res.json({
    status: "success",
    data: { routines, count: routines.length },
    message: `Routines for ${day} fetched successfully`,
  });
};

export const getRoutinesByTeacher = async (req, res) => {
  const teacher = req.params.teacher;

  if (!teacher) {
    return res.status(400).json({
      status: "error",
      message: "Teacher parameter is required",
    });
  }

  const routines = await prisma.routine.findMany({
    where: {
      teacher: {
        contains: teacher,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      day: true,
      start_time: true,
      end_time: true,
      class_type: true,
      teacher: true,
      course: {
        select: {
          course_code: true,
          course_name: true,
        },
      },
      section: {
        select: {
          section_name: true,
        },
      },
      room: {
        select: {
          room_number: true,
        },
      },
    },
    orderBy: [{ day: "asc" }, { start_time: "asc" }],
  });

  res.json({
    status: "success",
    data: { routines, count: routines.length },
    message: `Routines for teacher "${teacher}" fetched successfully`,
  });
};

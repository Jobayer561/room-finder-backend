import { prisma } from "../database/prisma.js";
import { z } from "zod";

const StatusEnum = ["FREE", "OCCUPIED", "MAINTENANCE", "RESCHEDULED"];
export const getAllRoomStatuses = async (req, res) => {
  try {
    const statuses = await prisma.roomStatus.findMany({
      select: {
        id: true,
        status: true,
        status_date: true,
        updated_at: true,
        start_time: true,
        end_time: true,
         day_of_week: true, 
        is_recurring: true,   
        routine_id: true,
        room: {
          select: {
            id: true,
            room_number: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    
    const routineIds = statuses
      .filter((s) => s.routine_id)
      .map((s) => s.routine_id);

    let routinesMap = {};
    if (routineIds.length > 0) {
      const routines = await prisma.routine.findMany({
        where: { id: { in: routineIds } },
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
        },
      });
      routinesMap = Object.fromEntries(routines.map((r) => [r.id, r]));
    }

    const enrichedStatuses = statuses.map((status) => ({
      ...status,
      routine: status.routine_id ? routinesMap[status.routine_id] : null,
    }));

    res.json({
      status: "success",
      data: { roomStatuses: enrichedStatuses },
      message: "Room statuses fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching room statuses:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createRoomStatusSchema = z.object({
  status: z.enum(StatusEnum),
  status_date: z.coerce.date(),
  routine_id: z.string().uuid().optional(),
  room_id: z.string().uuid(),
  updated_by: z.string().max(255),
  day_of_week: z.string().max(10).optional(), 
  is_recurring: z.boolean().optional(),
  start_time: z.string().max(5).optional(),
  end_time: z.string().max(5).optional(),
});

export const createRoomStatus = async (req, res) => {
  try {
    const { success, data, error } = createRoomStatusSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ message: "Validation failed", error });
    }

  

    let routine = null;
    if (data.routine_id) {
      routine = await prisma.routine.findUnique({
        where: { id: data.routine_id },
      });

      if (!routine) {
        return res.status(404).json({ message: "Routine not found" });
      }

     
    }

    const [room, user] = await Promise.all([
      prisma.room.findUnique({ where: { id: data.room_id } }),
      prisma.user.findUnique({ where: { id: data.updated_by } }),
    ]);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const selectObject = {
      id: true,
      status: true,
      status_date: true,
      updated_at: true,
      start_time: true,
      end_time: true,
      day_of_week: true, 
      is_recurring: true,
      room: {
        select: {
          id: true,
          room_number: true,
          room_type: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };

    if (data.routine_id) {
      selectObject.routine = {
        select: {
          id: true,
          day: true,
          start_time: true,
          end_time: true,
          teacher: true,
          course: {
            select: {
              id: true,
              course_name: true,
            },
          },
          section: {
            select: {
              id: true,
              section_name: true,
            },
          },
        },
      };
    }

    const createData = {
      status: data.status,
      status_date: data.status_date,
      room: { connect: { id: data.room_id } },
      updatedBy: { connect: { id: data.updated_by } },
    };

    if (data.routine_id) {
      createData.routine = { connect: { id: data.routine_id } };
    }

    if (data.day_of_week !== undefined) {
      createData.day_of_week = data.day_of_week;
    }
    if (data.is_recurring !== undefined) {
      createData.is_recurring = data.is_recurring;
    }
    if (data.start_time !== undefined) {
      createData.start_time = data.start_time;
    }
    if (data.end_time !== undefined) {
      createData.end_time = data.end_time;
    }

    const roomStatus = await prisma.roomStatus.create({
      data: createData,
      select: selectObject,
    });

    res.status(201).json({
      message: "Room status created successfully",
      data: roomStatus,
    });
  } catch (error) {
    console.error("Error creating room status:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateRoomStatus = async (req, res) => {
  const statusId = req.params.id;

  const updateSchema = z.object({
    status: z.enum(StatusEnum).optional(),
    status_date: z.coerce.date().optional(),
    routine_id: z.string().uuid().optional(),
    room_id: z.string().uuid().optional(),
    updated_by: z.string().max(255).optional(),
    day_of_week: z.string().max(10).optional(),
    is_recurring: z.boolean().optional(),
    start_time: z.string().max(5).optional(),
    end_time: z.string().max(5).optional(),
  });

  const { success, data, error } = updateSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: z.flattenErrors(error),
    });
  }

  try {
    const statusExists = await prisma.roomStatus.findUnique({
      where: { id: statusId },
      include: { routine: true },
    });

    if (!statusExists) {
      return res.status(404).json({
        status: "error",
        message: "Room status not found",
      });
    }

    if (data.routine_id) {
      const routine = await prisma.routine.findUnique({
        where: { id: data.routine_id },
      });

      if (!routine) {
        return res.status(404).json({
          status: "error",
          message: "Routine not found",
        });
      }
      
 
    }

    if (data.room_id) {
      const room = await prisma.room.findUnique({
        where: { id: data.room_id },
      });

      if (!room) {
        return res.status(404).json({
          status: "error",
          message: "Room not found",
        });
      }
    }

    if (data.updated_by) {
      const user = await prisma.user.findUnique({
        where: { id: data.updated_by },
      });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }
    }

    const updateData = {};
    if (data.status) updateData.status = data.status;
    if (data.status_date) updateData.status_date = data.status_date;
    if (data.routine_id) updateData.routine_id = data.routine_id;
    if (data.room_id) updateData.room_id = data.room_id;
    if (data.updated_by) updateData.updated_by = data.updated_by;
    if (data.day_of_week !== undefined) updateData.day_of_week = data.day_of_week;
    if (data.is_recurring !== undefined) updateData.is_recurring = data.is_recurring;
    if (data.start_time !== undefined) updateData.start_time = data.start_time;
    if (data.end_time !== undefined) updateData.end_time = data.end_time;
    updateData.updated_at = new Date();

    const updatedStatus = await prisma.roomStatus.update({
      where: { id: statusId },
      data: updateData,
      select: {
        id: true,
        status: true,
        status_date: true,
        updated_at: true,
        start_time: true,
        end_time: true,
        day_of_week: true,
        is_recurring: true,
        room: {
          select: {
            id: true,
            room_number: true,
          },
        },
        routine: {
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
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Room status updated successfully",
      data: { roomStatus: updatedStatus },
    });
  } catch (error) {
    console.error("Error updating room status:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
export const deleteRoomStatus = async (req, res) => {
  const statusId = req.params.id;

  const schema = z.object({
    id: z.string().uuid(),
  });

  const { success, error } = schema.safeParse({ id: statusId });

  if (!success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: z.flattenErrors(error),
    });
  }

  try {
    const statusExists = await prisma.roomStatus.findUnique({
      where: { id: statusId },
    });

    if (!statusExists) {
      return res.status(404).json({
        status: "error",
        message: "Room status not found",
      });
    }

    const deletedStatus = await prisma.roomStatus.delete({
      where: { id: statusId },
      select: {
        id: true,
        status: true,
        status_date: true,
        routine_id: true,
        room_id: true,
        updated_at: true,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Room status deleted successfully",
      data: { roomStatus: deletedStatus },
    });
  } catch (error) {
    console.error("Error deleting room status:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

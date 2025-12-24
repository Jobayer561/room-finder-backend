import { prisma } from "../database/prisma.js";
import { z } from "zod";

export const getAllRooms = async (req, res) => {
  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      room_number: true,
      room_type: true,
      created_at: true,
      updated_at: true,
      routines: {
        select: {
          id: true,
          day: true,
          start_time: true,
          end_time: true,
        },
      },
      roomStatuses: {
        select: {
          id: true,
          status: true,
          updated_at: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  res.json({
    status: "success",
    data: { rooms },
    message: "Rooms fetched successfully",
  });
};

export const getRoomById = async (req, res) => {
  const roomId = req.params.id;
  const roomGetSchema = z.object({
    id: z.uuid(),
  });

  const { success, error } = roomGetSchema.safeParse({ id: roomId });
  if (!success) {
    return res.status(400).json({
      message: "Validation error",
      data: z.flattenError(error),
    });
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      routines: {
        select: {
          id: true,
          day: true,
          start_time: true,
          end_time: true,
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
      roomStatuses: {
        select: {
          id: true,
          status: true,
          updated_at: true,
          updated_by: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updated_at: "desc",
        },
      },
    },
  });

  if (!room) {
    return res.status(404).json({ status: "error", message: "Room not found" });
  }

  res.json({
    status: "success",
    data: { room },
    message: "Room fetched successfully",
  });
};

export const createRoom = async (req, res) => {
  const roomCreateSchema = z.object({
    room_number: z.string().min(1).max(10),
    room_type: z.string().min(1).max(20),
  });

  const { success, data, error } = roomCreateSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }

  const room = await prisma.room.create({
    data: {
      room_number: data.room_number,
      room_type: data.room_type,
    },
    select: {
      id: true,
      room_number: true,
      room_type: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.status(201).json({
    status: "success",
    data: { room },
    message: "Room created successfully",
  });
};

export const updateRoom = async (req, res) => {
  const roomId = req.params.id;
  const roomUpdateSchema = z.object({
    id: z.uuid(),
    room_number: z.string().min(1).max(10).optional(),
    room_type: z.string().min(1).max(20).optional(),
  });

  const { success, data, error } = roomUpdateSchema.safeParse({
    id: roomId,
    room_number: req.body.room_number,
    room_type: req.body.room_type,
  });

  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }



  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      ...(data.room_number && { room_number: data.room_number }),
      ...(data.room_type && { room_type: data.room_type }),
    },
    select: {
      id: true,
      room_number: true,
      room_type: true,
      created_at: true,
      updated_at: true,
    },
  });

  res.json({
    status: "success",
    data: { room: updatedRoom },
    message: "Room updated successfully",
  });
};

export const deleteRoom = async (req, res) => {
  const roomId = req.params.id;
  const roomDeleteSchema = z.object({
    id: z.uuid(),
  });

  const { success, error } = roomDeleteSchema.safeParse({ id: roomId });
  if (!success) {
    return res.status(400).json({
      message: "Validation failed",
      data: z.flattenError(error),
    });
  }
  const deletedRoom = await prisma.room.delete({
    where: { id: roomId },
    select: {
      id: true,
      room_number: true,
      room_type: true,
    },
  });

  res.json({
    status: "success",
    data: { room: deletedRoom },
    message: "Room deleted successfully",
  });
};
import { prisma } from "../database/prisma.js";
import { z } from "zod";

export const getAllSections = async (req, res) => {
  const sections = await prisma.section.findMany();

    res.json({
      status: "success",
      data: { sections },
      message: "Sections fetched successfully",
    });
};

export const createSection = async (req, res) => {
  const sectionCreateSchema = z.object({
      section_name: z.string().min(1).max(10),
    });

    const { success, data, error } = sectionCreateSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        message: "Validation failed",
        data: z.flattenError(error),
      });
    }
    const section = await prisma.section.create({
      data: {
        section_name: data.section_name,
      },
      select: {
        id: true,
        section_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(201).json({
      status: "success",
      data: { section },
      message: "Section created successfully",
    });
};

export const updateSection = async (req, res) => {
  const sectionId = req.params.id;
    const sectionUpdateSchema = z.object({
      id: z.uuid(),
      section_name: z.string().min(1).max(10).optional(),
    });

    const { success, data, error } = sectionUpdateSchema.safeParse({
      id: sectionId,
      section_name: req.body.section_name,
    });

    if (!success) {
      return res.status(400).json({
        message: "Validation failed",
        data: z.flattenError(error),
      });
    }



    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        ...(data.section_name && { section_name: data.section_name }),
      },
      select: {
        id: true,
        section_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      status: "success",
      data: { section: updatedSection },
      message: "Section updated successfully",
    });
};

export const deleteSection = async (req, res) => {
  const sectionId = req.params.id;
    const sectionDeleteSchema = z.object({
      id: z.uuid(),
    });

    const { success, error } = sectionDeleteSchema.safeParse({ id: sectionId });
    if (!success) {
      return res.status(400).json({
        message: "Validation failed",
        data: z.flattenError(error),
      });
    }



    const deletedSection = await prisma.section.delete({
      where: { id: sectionId },
      select: {
        id: true,
        section_name: true,
      },
    });

    res.json({
      status: "success",
      data: { section: deletedSection },
      message: "Section deleted successfully",
    });
}
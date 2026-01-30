import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendResponse, sendError } from '../utils/response';
import { createClassSchema } from '../validators/student.validator';

export const getClasses = async (req: Request, res: Response) => {
  const academicYear = req.query.academicYear as string;
  const level = req.query.level as string;

  const where = {
    deletedAt: null,
    ...(academicYear && { academicYear }),
    ...(level && { level }),
  };

  const items = await prisma.class.findMany({
    where,
    orderBy: { code: 'asc' },
  });

  return sendResponse(res, 200, true, 'Classes retrieved', items);
};

export const getClassById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.class.findUnique({
    where: { id },
    include: {
      students: {
        where: { deletedAt: null },
        select: {
          id: true,
          nisn: true,
          name: true,
          totalPoints: true,
        },
      },
    },
  });

  if (!item) return sendError(res, 404, 'Class not found');

  return sendResponse(res, 200, true, 'Class detail retrieved', item);
};

export const createClass = async (req: Request, res: Response) => {
  const { error, value } = createClassSchema.validate(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  const existing = await prisma.class.findFirst({
    where: { code: value.code, academicYear: value.academicYear },
  });

  if (existing) return sendError(res, 400, 'Class code already exists for this academic year');

  const item = await prisma.class.create({
    data: {
      ...value,
      createdBy: (req as any).user?.id || 'SYSTEM',
    },
  });

  return sendResponse(res, 201, true, 'Class created', item);
};

export const updateClass = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error, value } = createClassSchema.validate(req.body, { allowUnknown: true });
  if (error) return sendError(res, 400, error.details[0].message);

  const updated = await prisma.class.update({
    where: { id },
    data: {
      ...value,
      updatedBy: (req as any).user?.id || 'SYSTEM',
    },
  });

  return sendResponse(res, 200, true, 'Class updated', updated);
};

export const deleteClass = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.class.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
      updatedBy: (req as any).user?.id || 'SYSTEM',
    },
  });

  return sendResponse(res, 200, true, 'Class deleted successfully');
};

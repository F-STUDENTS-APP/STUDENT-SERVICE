import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendResponse, sendError } from '../utils/response';
import { createStudentSchema, updateStudentSchema } from '../validators/student.validator';

export const getStudents = async (req: Request, res: Response) => {
  const offset = parseInt(req.headers['x-paging-offset'] as string) || 0;
  const limit = parseInt(req.headers['x-paging-limit'] as string) || 25;
  const search = req.headers['x-paging-search'] as string;
  const classId = req.query.classId as string;
  const status = req.query.status as any;

  const where = {
    deletedAt: null,
    ...(classId && { classId }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as any } },
        { nisn: { contains: search, mode: 'insensitive' as any } },
        { nis: { contains: search, mode: 'insensitive' as any } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: offset,
      take: limit,
      include: { class: true },
      orderBy: { name: 'asc' },
    }),
    prisma.student.count({ where }),
  ]);

  return sendResponse(res, 200, true, 'Students retrieved', {
    items,
    pagination: {
      offset,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      pointsHistory: {
        take: 10,
        orderBy: { recordedAt: 'desc' },
      },
    },
  });

  if (!item) return sendError(res, 404, 'Student not found');

  return sendResponse(res, 200, true, 'Student detail retrieved', item);
};

export const createStudent = async (req: Request, res: Response) => {
  const { error, value } = createStudentSchema.validate(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  // Get class info for denormalization
  const classInfo = await prisma.class.findUnique({ where: { id: value.classId } });
  if (!classInfo) return sendError(res, 400, 'Invalid classId');

  const student = await prisma.student.create({
    data: {
      ...value,
      className: classInfo.name,
      classLevel: classInfo.level,
      classMajor: classInfo.major,
      createdBy: (req as any).user?.id || 'SYSTEM',
    },
  });

  // Update class currentTotal
  await prisma.class.update({
    where: { id: value.classId },
    data: { currentTotal: { increment: 1 } },
  });

  return sendResponse(res, 201, true, 'Student created', student);
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error, value } = updateStudentSchema.validate(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  const updated = await prisma.student.update({
    where: { id },
    data: {
      ...value,
      updatedBy: (req as any).user?.id || 'SYSTEM',
    },
  });

  return sendResponse(res, 200, true, 'Student updated', updated);
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return sendError(res, 404, 'Student not found');

  await prisma.$transaction([
    prisma.student.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: (req as any).user?.id || 'SYSTEM',
      },
    }),
    prisma.class.update({
      where: { id: student.classId },
      data: { currentTotal: { decrement: 1 } },
    }),
  ]);

  return sendResponse(res, 200, true, 'Student deleted successfully');
};

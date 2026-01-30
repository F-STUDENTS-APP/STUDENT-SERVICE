import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendResponse, sendError } from '../utils/response';
import { createAcademicYearSchema } from '../validators/student.validator';

export const getAcademicYears = async (req: Request, res: Response) => {
  const items = await prisma.academicYear.findMany({
    orderBy: { year: 'desc' },
  });
  return sendResponse(res, 200, true, 'Academic years retrieved', items);
};

export const createAcademicYear = async (req: Request, res: Response) => {
  const { error, value } = createAcademicYearSchema.validate(req.body);
  if (error) return sendError(res, 400, error.details[0].message);

  const year = await prisma.academicYear.create({
    data: value,
  });

  return sendResponse(res, 201, true, 'Academic year created', year);
};

export const setActiveAcademicYear = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.$transaction([
    prisma.academicYear.updateMany({
      data: { isActive: false },
    }),
    prisma.academicYear.update({
      where: { id },
      data: { isActive: true },
    }),
  ]);

  return sendResponse(res, 200, true, 'Academic year set as active');
};

export const getCurrentAcademicYear = async (req: Request, res: Response) => {
  const current = await prisma.academicYear.findFirst({
    where: { isActive: true },
  });

  if (!current) return sendError(res, 404, 'No active academic year found');

  return sendResponse(res, 200, true, 'Current academic year retrieved', current);
};

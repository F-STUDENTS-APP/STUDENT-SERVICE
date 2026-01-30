import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendResponse, sendError } from '../utils/response';
import axios from 'axios';

export const getConsolidatedProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await prisma.student.findUnique({
    where: { id, deletedAt: null },
    include: { class: true },
  });

  if (!student) return sendError(res, 404, 'Student not found');

  const results = {
    profile: student,
    monitoring: {
      currentClassStatus: 'UNKNOWN',
      activeLesson: null,
    },
    violations: {
      totalPoints: student.negativePoints,
      latest: [],
    },
    achievements: {
      totalPoints: student.positivePoints,
      latest: [],
    },
  };

  try {
    // 1. Fetch from schedule-service
    const SCHEDULE_SERVICE_URL = process.env.SCHEDULE_SERVICE_URL || 'http://localhost:3010';
    const scheduleRes = await axios.get(
      `${SCHEDULE_SERVICE_URL}/api/v1/schedules/active/${student.classId}`
    );
    if (scheduleRes.data.success) {
      results.monitoring.currentClassStatus = scheduleRes.data.data.status;
      results.monitoring.activeLesson = scheduleRes.data.data.lesson || null;
    }

    // 2. Fetch from violation-service (latest 5)
    const VIOLATION_SERVICE_URL = process.env.VIOLATION_SERVICE_URL || 'http://localhost:3004';
    const violationRes = await axios.get(
      `${VIOLATION_SERVICE_URL}/api/v1/violations?studentId=${student.id}&limit=5`
    );
    if (violationRes.data.success) {
      results.violations.latest = violationRes.data.data.items;
    }

    // 3. Fetch from achievement-service (latest 5)
    const ACHIEVEMENT_SERVICE_URL = process.env.ACHIEVEMENT_SERVICE_URL || 'http://localhost:3005';
    const achievementRes = await axios.get(
      `${ACHIEVEMENT_SERVICE_URL}/api/v1/achievements?studentId=${student.id}&limit=5`
    );
    if (achievementRes.data.success) {
      results.achievements.latest = achievementRes.data.data.items;
    }
  } catch (error) {
    console.error('Error fetching consolidated data:', error);
    // We still return partial results if some services are down
  }

  return sendResponse(res, 200, true, 'Consolidated profile retrieved', results);
};

import prisma from '../config/prisma';
import axios from 'axios';

class PointsSyncService {
  async syncStudentPoints(studentId: string): Promise<void> {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return;

    try {
      // Mocking fetch from other services - in real world these would be actual HTTP calls
      // const violations = await axios.get(`${process.env.VIOLATION_SERVICE_URL}/api/v1/violations/student/${studentId}`);
      // const achievements = await axios.get(`${process.env.ACHIEVEMENT_SERVICE_URL}/api/v1/achievements/student/${studentId}`);

      // For demonstration, we keep it as placeholder or logic from requirements
      const negativePoints = 0; // sum from violations
      const positivePoints = 0; // sum from achievements
      const totalPoints = positivePoints - negativePoints;

      await prisma.student.update({
        where: { id: studentId },
        data: {
          positivePoints,
          negativePoints,
          totalPoints,
        },
      });

      await this.updateRanking(studentId);
    } catch (error) {
      console.error(`Failed to sync points for student ${studentId}:`, error);
    }
  }

  async syncAllStudents(): Promise<void> {
    const students = await prisma.student.findMany({
      where: { isActive: true, deletedAt: null },
    });

    for (const student of students) {
      await this.syncStudentPoints(student.id);
    }
  }

  private async updateRanking(studentId: string): Promise<void> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) return;

    const rank =
      (await prisma.student.count({
        where: {
          classId: student.classId,
          totalPoints: { gt: student.totalPoints },
          isActive: true,
          deletedAt: null,
        },
      })) + 1;

    await prisma.student.update({
      where: { id: studentId },
      data: { currentRank: rank },
    });
  }
}

export default new PointsSyncService();

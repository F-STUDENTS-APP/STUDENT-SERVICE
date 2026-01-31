import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../controllers/student.controller';
import {
  mockRequest,
  mockResponse,
  mockPrismaClient,
  mockStudent,
  mockClass,
  resetAllMocks,
} from '../utils/test-helpers';

jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: mockPrismaClient,
}));

describe('Student Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('getStudents', () => {
    it('should return paginated list of students', async () => {
      req.headers = { 'x-paging-offset': '0', 'x-paging-limit': '25' };

      mockPrismaClient.student.findMany.mockResolvedValue([mockStudent]);
      mockPrismaClient.student.count.mockResolvedValue(1);

      await getStudents(req, res);

      expect(mockPrismaClient.student.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter by classId', async () => {
      req.headers = {};
      req.query = { classId: 'class-123' };

      mockPrismaClient.student.findMany.mockResolvedValue([mockStudent]);
      mockPrismaClient.student.count.mockResolvedValue(1);

      await getStudents(req, res);

      const call = mockPrismaClient.student.findMany.mock.calls[0][0];
      expect(call.where.classId).toBe('class-123');
    });

    it('should filter by search term', async () => {
      req.headers = { 'x-paging-search': 'Test' };

      mockPrismaClient.student.findMany.mockResolvedValue([mockStudent]);
      mockPrismaClient.student.count.mockResolvedValue(1);

      await getStudents(req, res);

      const call = mockPrismaClient.student.findMany.mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
    });
  });

  describe('getStudentById', () => {
    it('should return student detail', async () => {
      req.params = { id: 'student-123' };

      mockPrismaClient.student.findUnique.mockResolvedValue({
        ...mockStudent,
        class: mockClass,
        pointsHistory: [],
      });

      await getStudentById(req, res);

      expect(mockPrismaClient.student.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'student-123' },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if student not found', async () => {
      req.params = { id: 'nonexistent' };

      mockPrismaClient.student.findUnique.mockResolvedValue(null);

      await getStudentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createStudent', () => {
    it('should create new student', async () => {
      req.body = {
        nisn: '9876543210',
        nis: '54321',
        name: 'New Student',
        classId: 'class-123',
      };

      mockPrismaClient.class.findUnique.mockResolvedValue(mockClass);
      mockPrismaClient.student.create.mockResolvedValue({ id: 'new-student', ...req.body });
      mockPrismaClient.class.update.mockResolvedValue({});

      await createStudent(req, res);

      expect(mockPrismaClient.student.create).toHaveBeenCalled();
      expect(mockPrismaClient.class.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if classId is invalid', async () => {
      req.body = {
        nisn: '9876543210',
        name: 'Test',
        classId: 'invalid-class',
      };

      mockPrismaClient.class.findUnique.mockResolvedValue(null);

      await createStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateStudent', () => {
    it('should update student', async () => {
      req.params = { id: 'student-123' };
      req.body = { name: 'Updated Name' };

      mockPrismaClient.student.update.mockResolvedValue({ ...mockStudent, name: 'Updated Name' });

      await updateStudent(req, res);

      expect(mockPrismaClient.student.update).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteStudent', () => {
    it('should soft delete student and update class count', async () => {
      req.params = { id: 'student-123' };

      mockPrismaClient.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaClient.$transaction.mockResolvedValue([{}, {}]);

      await deleteStudent(req, res);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if student not found', async () => {
      req.params = { id: 'nonexistent' };

      mockPrismaClient.student.findUnique.mockResolvedValue(null);

      await deleteStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

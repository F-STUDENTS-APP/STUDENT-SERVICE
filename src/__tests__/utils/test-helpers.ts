import { Request, Response } from 'express';

// Extend Request type to include user property
interface RequestWithUser extends Request {
  user?: {
    id: string;
    username?: string;
    roles?: string[];
  };
}

export const mockRequest = (data: Partial<RequestWithUser> = {}): Partial<RequestWithUser> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: '127.0.0.1',
    user: undefined,
    ...data,
  } as Partial<RequestWithUser>;
};

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

export const mockPrismaClient: any = {
  student: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  class: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((operations: any) => Promise.all(operations)),
};

export const mockStudent = {
  id: 'student-123',
  nisn: '1234567890',
  nis: '12345',
  name: 'Test Student',
  classId: 'class-123',
  className: 'X IPA 1',
  classLevel: 10,
  classMajor: 'IPA',
  status: 'ACTIVE',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockClass = {
  id: 'class-123',
  name: 'X IPA 1',
  level: 10,
  major: 'IPA',
  currentTotal: 30,
};

export const resetAllMocks = () => {
  Object.values(mockPrismaClient).forEach((model: any) => {
    if (typeof model === 'object') {
      Object.values(model).forEach((method: any) => {
        if (typeof method?.mockReset === 'function') {
          method.mockReset();
        }
      });
    }
  });
};

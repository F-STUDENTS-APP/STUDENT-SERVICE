export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Student Service API',
    description: 'API for managing students, classes, and academic years',
    version: '1.0.0',
  },
  servers: [
    {
      url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3003',
      description: 'Server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Check if the service is running',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    service: { type: 'string', example: 'student-service' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/students': {
      get: {
        summary: 'Get list of students',
        tags: ['Students'],
        parameters: [
          { in: 'header', name: 'x-paging-offset', schema: { type: 'integer', default: 0 } },
          { in: 'header', name: 'x-paging-limit', schema: { type: 'integer', default: 25 } },
          { in: 'query', name: 'classId', schema: { type: 'string' } },
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED_OUT', 'SUSPENDED'],
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of students',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        items: { type: 'array', items: { $ref: '#/components/schemas/Student' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new student',
        tags: ['Students'],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateStudentDto' } },
          },
        },
        responses: { '201': { description: 'Student created' } },
      },
    },
    '/api/v1/students/{id}': {
      get: {
        summary: 'Get student by ID',
        tags: ['Students'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Student details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Student' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update student',
        tags: ['Students'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateStudentDto' } },
          },
        },
        responses: { '200': { description: 'Student updated' } },
      },
      delete: {
        summary: 'Delete student (Soft delete)',
        tags: ['Students'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Student deleted' } },
      },
    },
    '/api/v1/students/{id}/consolidated': {
      get: {
        summary: 'Get consolidated student profile',
        description: 'Fetches student data along with external data',
        tags: ['Students'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Consolidated profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        profile: { $ref: '#/components/schemas/Student' },
                        monitoring: { type: 'object' },
                        violations: { type: 'object' },
                        achievements: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/classes': {
      get: {
        summary: 'Get all classes',
        tags: ['Classes'],
        responses: { '200': { description: 'List of classes' } },
      },
      post: {
        summary: 'Create a class',
        tags: ['Classes'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name', 'level', 'academicYear'],
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  level: { type: 'string' },
                  major: { type: 'string' },
                  academicYear: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Class created' } },
      },
    },
    '/api/v1/academic-years': {
      get: {
        summary: 'Get academic years',
        tags: ['Academic Years'],
        responses: { '200': { description: 'List of academic years' } },
      },
    },
  },
  components: {
    schemas: {
      Student: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nisn: { type: 'string' },
          name: { type: 'string' },
          classId: { type: 'string' },
          className: { type: 'string' },
          status: { type: 'string' },
        },
      },
      CreateStudentDto: {
        type: 'object',
        required: ['name', 'nisn', 'classId', 'gender', 'birthDate', 'address'],
        properties: {
          userId: { type: 'string' },
          nisn: { type: 'string' },
          nis: { type: 'string' },
          name: { type: 'string' },
          classId: { type: 'string' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'] },
          birthPlace: { type: 'string' },
          birthDate: { type: 'string', format: 'date-time' },
          religion: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          province: { type: 'string' },
        },
      },
      UpdateStudentDto: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          offset: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
  },
};

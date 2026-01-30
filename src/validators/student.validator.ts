import Joi from 'joi';

export const createStudentSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  nisn: Joi.string().length(10).pattern(/^\d+$/).required(),
  nis: Joi.string().max(20).optional(),
  name: Joi.string().min(3).max(100).required(),
  nickname: Joi.string().max(50).optional(),
  classId: Joi.string().uuid().required(),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  birthPlace: Joi.string().max(100).required(),
  birthDate: Joi.date().max('now').required(),
  religion: Joi.string()
    .valid('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU')
    .required(),
  bloodType: Joi.string().valid('A', 'B', 'AB', 'O').optional(),
  address: Joi.string().max(500).required(),
  city: Joi.string().max(100).required(),
  province: Joi.string().max(100).required(),
  phone: Joi.string()
    .pattern(/^08\d{8,11}$/)
    .optional(),
  email: Joi.string().email().optional(),
  parentId: Joi.string().uuid().optional(),
  waliKelasId: Joi.string().uuid().optional(),
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .required(),
  entryYear: Joi.string()
    .pattern(/^\d{4}$/)
    .required(),
  entryDate: Joi.date().required(),
});

export const updateStudentSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  nickname: Joi.string().max(50).optional(),
  classId: Joi.string().uuid().optional(),
  phone: Joi.string()
    .pattern(/^08\d{8,11}$/)
    .optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().max(500).optional(),
  photoUrl: Joi.string().uri().optional(),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED_OUT', 'SUSPENDED')
    .optional(),
});

export const createClassSchema = Joi.object({
  code: Joi.string().uppercase().min(3).max(20).required(),
  name: Joi.string().min(3).max(100).required(),
  level: Joi.string().valid('10', '11', '12').required(),
  major: Joi.string().max(50).optional(),
  waliKelasId: Joi.string().uuid().optional(),
  capacity: Joi.number().integer().min(1).max(50).default(36),
  academicYear: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .required(),
  roomNumber: Joi.string().max(20).optional(),
  floor: Joi.string().max(10).optional(),
  building: Joi.string().max(10).optional(),
});

export const createAcademicYearSchema = Joi.object({
  year: Joi.string()
    .pattern(/^\d{4}\/\d{4}$/)
    .required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  semester1Start: Joi.date().required(),
  semester1End: Joi.date().required(),
  semester2Start: Joi.date().required(),
  semester2End: Joi.date().required(),
  isActive: Joi.boolean().default(false),
});

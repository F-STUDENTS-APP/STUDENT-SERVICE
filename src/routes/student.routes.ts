import { Router } from 'express';
import * as studentController from '../controllers/student.controller';
import * as consolidatedController from '../controllers/consolidated.controller';

const router = Router();

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.get('/:id/consolidated', consolidatedController.getConsolidatedProfile);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

export default router;

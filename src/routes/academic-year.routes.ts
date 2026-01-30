import { Router } from 'express';
import * as academicYearController from '../controllers/academic-year.controller';

const router = Router();

router.get('/', academicYearController.getAcademicYears);
router.post('/', academicYearController.createAcademicYear);
router.get('/current', academicYearController.getCurrentAcademicYear);
router.put('/:id/set-active', academicYearController.setActiveAcademicYear);

export default router;

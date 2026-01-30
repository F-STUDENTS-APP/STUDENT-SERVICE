import { Router } from 'express';
import * as classController from '../controllers/class.controller';

const router = Router();

router.get('/', classController.getClasses);
router.get('/:id', classController.getClassById);
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

export default router;

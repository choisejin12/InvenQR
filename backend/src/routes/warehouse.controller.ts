import { Router } from 'express';
import * as controller from '../controllers/warehouse.service';
import auth from '../middleware/auth';
import admin from '../middleware/admin';

const router = Router();

router.get('/', auth, controller.getAll);
router.post('/', auth, admin, controller.create);
router.patch('/:id', auth, admin, controller.update);
router.delete('/:id', auth, admin, controller.remove);

export default router;
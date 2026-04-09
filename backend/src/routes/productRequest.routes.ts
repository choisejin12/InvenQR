import { Router } from 'express';
import * as controller from '../controllers/productRequest.controller';
import auth from '../middleware/auth';
import admin from '../middleware/admin';

const router = Router();

router.post('/', auth, controller.create);
router.get('/', auth, admin, controller.getAllRequests);
router.get('/myrequest', auth, controller.getMyRequests);

router.patch('/:id/approve', auth, admin, controller.approve);
router.patch('/:id/reject', auth, admin, controller.reject);

export default router;
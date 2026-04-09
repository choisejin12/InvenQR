import { Router } from 'express';
import * as controller from '../controllers/product.controller';
import auth from '../middleware/auth';
import admin from '../middleware/admin';

const router = Router();

router.post('/', auth, admin, controller.create);
router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getOne);
router.patch('/:id', auth, admin, controller.update);
router.delete('/:id', auth, admin, controller.remove);
router.get('/qr/:qrCode', auth, controller.getByQRCode);

export default router;
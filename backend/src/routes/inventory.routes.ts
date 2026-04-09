import { Router } from 'express';
import * as controller from '../controllers/inventory.controller';
import auth from '../middleware/auth';

const router = Router();

router.post('/in', auth, controller.stockIn);
router.post('/out', auth, controller.stockOut);
router.get('/logs', auth, controller.getAllLogs);
router.get('/products/:productId/logs', auth, controller.getLogsByProduct);

export default router;
import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import  auth  from '../middleware/auth';

const router = Router();

router.get('/', getDashboard);

export default router;
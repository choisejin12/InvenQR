import { Router } from 'express';
import * as controller from '../controllers/category.controller';
import auth from '../middleware/auth';

const router = Router();

router.get('/', auth, controller.getAll);

export default router;

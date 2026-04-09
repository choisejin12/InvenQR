import express from 'express';
import {
  downloadProductsController,
  downloadInventoryController,
  getDownloadLogsController,
} from '../controllers/download.controller';

import auth from '../middleware/auth';

const router = express.Router();

// 제품 CSV 다운로드
router.get('/products', auth, downloadProductsController);

// 입출고 CSV 다운로드
router.get('/inventory', auth, downloadInventoryController);

// 다운로드 기록 조회
router.get('/logs', auth, getDownloadLogsController);

export default router;
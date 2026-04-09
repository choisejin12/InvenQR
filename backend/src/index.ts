import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import dashboardRouter from './routes/dashboard.route';
import DownloadRouter from './routes/download.route';
import InventoryRouter from './routes/inventory.routes';
import ProductRouter from './routes/product.routes';
import RequestProductRouter from './routes/productRequest.routes';
import WareHouseRouter from './routes/warehouse.controller';

dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());


// Auth 라우터
app.use('/user', authRoutes);
app.use('/dashboard', dashboardRouter);
app.use('/download',DownloadRouter );
app.use('/inventory',InventoryRouter );
app.use('/product',ProductRouter );
app.use('/requestproduct',RequestProductRouter );
app.use('/warehouse',WareHouseRouter );


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`서버 실행 중 (${PORT})`);
});
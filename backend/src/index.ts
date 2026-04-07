import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import dashboardRouter from './routes/dashboard.route';

dotenv.config();

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());


// 테스트 라우트
/*app.get('/', (req: Request, res: Response) => {
  res.send('서버 실행됨');
});*/

// Auth 라우터
app.use('/auth', authRoutes);
app.use('/', dashboardRouter);



const PORT = 5000;

app.listen(PORT, () => {
  console.log(`서버 실행 중 (${PORT})`);
});
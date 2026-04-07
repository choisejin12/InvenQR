import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.getDashboard();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: '대시보드 데이터 조회 실패'
    });
  }
};
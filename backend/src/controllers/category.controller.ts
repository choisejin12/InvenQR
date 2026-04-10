import { Request, Response } from 'express';
import * as service from '../services/category.service';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await service.getCategories();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

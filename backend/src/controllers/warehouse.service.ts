import { Request, Response } from 'express';
import * as service from '../services/warehouse.service';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await service.getWarehouses();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await service.createWarehouse(req.body);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


export const update = async (req: Request, res: Response) => {
  try {
    const data = await service.updateWarehouse(
      Number(req.params.id),
      req.body
    );
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const data = await service.deleteWarehouse(
      Number(req.params.id)
    );
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
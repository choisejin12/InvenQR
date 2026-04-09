import { Request, Response } from 'express';
import * as service from '../services/inventory.service';


export const stockIn = async (req: any, res: Response) => {
  try {
    const result = await service.stockIn(
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const stockOut = async (req: any, res: Response) => {
  try {
    const result = await service.stockOut(
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllLogs = async (req: Request, res: Response) => {
  try {
    const data = await service.getInventoryLogs({
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      warehouseId: req.query.warehouseId ? Number(req.query.warehouseId) : undefined,
      type: req.query.type as 'IN' | 'OUT' | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getLogsByProduct = async (req: Request, res: Response) => {
  try {
    const data = await service.getProductInventoryLogs(
      Number(req.params.productId),
      {
        type: req.query.type as 'IN' | 'OUT' | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      }
    );

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
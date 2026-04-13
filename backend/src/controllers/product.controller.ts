import { Request, Response } from 'express';
import * as service from '../services/product.service';

export const create = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const result = await service.createProduct(req.body, userId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await service.getProducts({
      search: req.query.search as string,
      categoryId: req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined,
      warehouseId: req.query.warehouseId
        ? Number(req.query.warehouseId)
        : undefined,
      minQty: req.query.minQty
        ? Number(req.query.minQty)
        : undefined,
      maxQty: req.query.maxQty
        ? Number(req.query.maxQty)
        : undefined,

      
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    });

    

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const data = await service.getProductById(
      Number(req.params.id)
    );
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const result = await service.updateProduct(
      Number(req.params.id),
      req.body,
      userId,
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const result = await service.deleteProduct(
      Number(req.params.id)
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getByQRCode = async (req: Request, res: Response) => {
  try {
    const data = await service.getProductByQRCode(
      String(req.params.qrCode)
    );
    res.json(data);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

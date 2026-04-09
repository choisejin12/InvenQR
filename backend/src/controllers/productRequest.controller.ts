import { Request, Response } from 'express';
import * as service from '../services/productRequest.service';

export const create = async (req: any, res: Response) => {
  try {
    const result = await service.createProductRequest(
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const data = await service.getProductRequests({
      status: req.query.status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyRequests = async (req: any, res: Response) => {
  try {
    const data = await service.getMyProductRequests(
      req.user.id,
      {
        status: req.query.status as
          | 'PENDING'
          | 'APPROVED'
          | 'REJECTED'
          | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      }
    );

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const approve = async (req: any, res: Response) => {
  try {
    const result = await service.approveProductRequest(
      Number(req.params.id),
      req.user.id
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const reject = async (req: any, res: Response) => {
  try {
    const { reason } = req.body;

    const result = await service.rejectProductRequest(
      Number(req.params.id),
      req.user.id,
      reason
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
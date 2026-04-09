import { Request, Response } from 'express';
import {
  generateProductsCSV,
  generateInventoryCSV,
  getDownloadLogsService,
} from '../services/download.service';

export const downloadProductsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { csv, fileName } = await generateProductsCSV(userId);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(fileName);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );

    const csvWithBOM = '\uFEFF' + csv;
    return res.send(csvWithBOM);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadInventoryController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const { csv, fileName } = await generateInventoryCSV(userId);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(fileName);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );

    const csvWithBOM = '\uFEFF' + csv;
    return res.send(csvWithBOM);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getDownloadLogsController = async (req: Request, res: Response) => {
  try {
    const logs = await getDownloadLogsService();
    res.json({ data: logs });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
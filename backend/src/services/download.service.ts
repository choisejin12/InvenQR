import { DownloadLog, User } from '@prisma/client';
import { Parser } from 'json2csv';
import { DownloadType } from '../types/download.type';
import prisma from '../config/prisma';

export const generateProductsCSV = async (userId: number) => {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      location: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  const data = products.map((p) => ({
    productCode: p.productCode,
    name: p.name,
    quantity: p.quantity,
    category: p.category?.name ?? '',
    location: p.location
      ? `${p.location.warehouse.name}${p.location.code}`
      : '',
  }));

  const parser = new Parser();
  const csv = parser.parse(data);

  const fileName = `products-${Date.now()}.csv`;
  const fileSize = Buffer.byteLength(csv, 'utf-8');

  await prisma.downloadLog.create({
    data: {
      type: 'PRODUCTS',
      fileName,
      fileSize,
      userId,
    },
  });

  return { csv, fileName };
};

export const generateInventoryCSV = async (userId: number) => {
  const logs = await prisma.inventoryLog.findMany({
    include: {
      product: true,
      location: {
        include: {
          warehouse: true,
        },
      },
      user: true,
    },
  });

  const data = logs.map((log) => ({
    product: log.product.name,
    type: log.type,
    quantity: log.quantity,
    location: log.location
      ? `${log.location.warehouse.name}${log.location.code}`
      : '',
    user: log.user.email,
    date: log.createdAt,
  }));

  const parser = new Parser();
  const csv = parser.parse(data);

  const fileName = `inventory-${Date.now()}.csv`;
  const fileSize = Buffer.byteLength(csv, 'utf-8');

  await prisma.downloadLog.create({
    data: {
      type: 'INVENTORY',
      fileName,
      fileSize,
      userId,
    },
  });

  return { csv, fileName };
};

export const getDownloadLogsService = async () => {
  const logs = await prisma.downloadLog.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return logs.map((log: DownloadLog & { user: User }) => ({
    id: log.id,
    type: log.type,
    fileName: log.fileName,
    fileSize: log.fileSize,
    user: log.user.email,
    createdAt: log.createdAt,
  }));
};

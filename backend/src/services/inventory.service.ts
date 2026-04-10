import { InventoryType } from '@prisma/client';
import { InventoryLogFilterDTO, StockInDTO, StockOutDTO } from '../types/inventory.types';
import prisma from '../config/prisma';

const formatLocation = (location: any) => {
  if (!location) return null;
  return `${location.warehouse.name}${location.code}`;
};

const buildDateFilter = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return undefined;

  return {
    gte: startDate ? new Date(startDate) : undefined,
    lte: endDate ? new Date(endDate) : undefined,
  };
};

/* 입고 */
export const stockIn = async (userId: number, data: StockInDTO) => {
  return prisma.$transaction(async (tx) => {
    // 1. 입고할 상품이 실제로 존재하는지 먼저 확인합니다.
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('상품이 존재하지 않습니다.');
    }

    // 2. 선택한 위치의 창고 정보를 같이 읽어와서
    // Product와 InventoryLog에 같은 warehouseId를 저장합니다.
    const location = await tx.location.findUnique({
      where: { id: data.locationId },
      select: {
        id: true,
        warehouseId: true,
      },
    });

    if (!location) {
      throw new Error('선택한 위치를 찾을 수 없습니다.');
    }

    // 3. 상품 수량과 위치, 창고 정보를 함께 갱신합니다.
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: {
        quantity: {
          increment: data.quantity,
        },
        locationId: location.id,
        warehouseId: location.warehouseId,
      },
    });

    // 4. 입고 로그에도 같은 위치/창고 정보를 남깁니다.
    await tx.inventoryLog.create({
      data: {
        productId: data.productId,
        userId,
        locationId: location.id,
        warehouseId: location.warehouseId,
        type: InventoryType.IN,
        quantity: data.quantity,
        note: data.note,
        processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
      },
    });

    return updatedProduct;
  });
};

/* 출고 */
export const stockOut = async (userId: number, data: StockOutDTO) => {
  return prisma.$transaction(async (tx) => {
    // 1. 출고할 상품을 확인합니다.
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('상품이 존재하지 않습니다.');
    }

    // 2. 현재 재고보다 더 많이 출고할 수는 없습니다.
    if (product.quantity < data.quantity) {
      throw new Error('재고가 부족합니다.');
    }

    // 3. 출고 위치에 연결된 창고 ID를 확인합니다.
    const location = await tx.location.findUnique({
      where: { id: data.locationId },
      select: {
        id: true,
        warehouseId: true,
      },
    });

    if (!location) {
      throw new Error('선택한 위치를 찾을 수 없습니다.');
    }

    // 4. 상품의 최신 위치/창고와 재고 수량을 함께 갱신합니다.
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: {
        quantity: {
          decrement: data.quantity,
        },
        locationId: location.id,
        warehouseId: location.warehouseId,
      },
    });

    // 5. 출고 로그에도 동일한 창고 정보를 저장합니다.
    await tx.inventoryLog.create({
      data: {
        productId: data.productId,
        userId,
        locationId: location.id,
        warehouseId: location.warehouseId,
        type: InventoryType.OUT,
        quantity: data.quantity,
        note: data.note,
        processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
      },
    });

    return updatedProduct;
  });
};

/* 전체 입출고 기록 조회 */
export const getInventoryLogs = async (filters: InventoryLogFilterDTO) => {
  const {
    productId,
    categoryId,
    warehouseId,
    type,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;

  const where = {
    AND: [
      productId ? { productId } : {},
      categoryId ? { product: { categoryId } } : {},
      warehouseId ? { warehouseId } : {},
      type ? { type: type as InventoryType } : {},
      buildDateFilter(startDate, endDate)
        ? { createdAt: buildDateFilter(startDate, endDate) }
        : {},
    ],
  };

  const total = await prisma.inventoryLog.count({ where });

  const logs = await prisma.inventoryLog.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          productCode: true,
          categoryId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      location: {
        include: {
          warehouse: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data: logs.map((log) => ({
      id: log.id,
      date: log.processedAt ?? log.createdAt,
      productId: log.product.id,
      productName: log.product.name,
      productCode: log.product.productCode,
      type: log.type,
      quantity: log.quantity,
      warehouse: log.location.warehouse.name,
      locationName: formatLocation(log.location),
      manager: log.user.name,
      note: log.note,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* 특정 상품 입출고 기록 조회 */
export const getProductInventoryLogs = async (
  productId: number,
  filters: InventoryLogFilterDTO,
) => {
  return getInventoryLogs({
    ...filters,
    productId,
  });
};

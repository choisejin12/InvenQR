import { PrismaClient, InventoryType } from '@prisma/client';
import {InventoryLogFilterDTO,StockInDTO,StockOutDTO} from '../types/inventory.types'

const prisma = new PrismaClient();

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

/*입고*/
export const stockIn = async (
  userId: number,
  data: StockInDTO
) => {
  return prisma.$transaction(async (tx) => { //transaction 사용 👉 재고 + 로그 하나라도 실패하면 전체 롤백 👉 데이터 꼬임 방지 (핵심)
    // 1️⃣ 상품 조회
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) throw new Error('상품이 존재하지않습니다.');

    // 2️⃣ 재고 증가
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: {
        quantity: {
          increment: data.quantity, // 동시성 문제 최소화
        },
        locationId: data.locationId,
      },
    });

    // 3️⃣ 로그 생성
    await tx.inventoryLog.create({
      data: {
        productId: data.productId,
        userId,
        locationId: data.locationId,
        type: InventoryType.IN,
        quantity: data.quantity,
        note: data.note,
        processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
      },
    });

    return updatedProduct;
  });
};

/* 출고*/
export const stockOut = async (
  userId: number,
  data: StockOutDTO
) => {
  return prisma.$transaction(async (tx) => {
    // 1️⃣ 상품 조회
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) throw new Error('상품 없음');

    // 재고 부족 체크 
    if (product.quantity < data.quantity) {
      throw new Error('재고 부족');
    }

    // 2️⃣ 재고 감소
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: {
        quantity: {
          decrement: data.quantity, // 동시성 문제 최소화
        },
        locationId: data.locationId,
      },
    });

    // 3️⃣ 로그 생성
    await tx.inventoryLog.create({
      data: {
        productId: data.productId,
        userId,
        locationId: data.locationId,
        type: InventoryType.OUT,
        quantity: data.quantity,
        note: data.note,
        processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
      },
    });

    return updatedProduct;
  });
};

/*전체 입출고 기록 조회*/
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
      warehouseId ? { location: { warehouseId } } : {},
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
          name:true,
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

/*특정 상품 입출고 기록 조회*/
export const getProductInventoryLogs = async (
  productId: number,
  filters: InventoryLogFilterDTO
) => {
  return getInventoryLogs({
    ...filters,
    productId,
  });
};
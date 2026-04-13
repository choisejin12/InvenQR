import { InventoryType, Prisma } from '@prisma/client';
import { InventoryLogFilterDTO, StockInDTO, StockOutDTO } from '../types/inventory.types';
import prisma from '../config/prisma';

const formatLocation = (location: any) => {
  if (!location) return null;
  return `${location.warehouse.name} ${location.code}`;
};

const buildDateFilter = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return undefined;

  return {
    gte: startDate ? new Date(startDate) : undefined,
    lte: endDate ? new Date(endDate) : undefined,
  };
};

const getLogTimelineDate = (log: {
  processedAt: Date | null;
  createdAt: Date;
}) => log.processedAt ?? log.createdAt;

const sortLogsByTimeline = <
  T extends {
    id: number;
    processedAt: Date | null;
    createdAt: Date;
  },
>(
  logs: T[],
) =>
  [...logs].sort((a, b) => {
    const timeDiff = getLogTimelineDate(b).getTime() - getLogTimelineDate(a).getTime();

    if (timeDiff !== 0) {
      return timeDiff;
    }

    // 같은 시각으로 들어온 경우에는 최신 id를 먼저 보여주면
    // 관리자 수정으로 추가된 로그도 화면에서 자연스럽게 최근 기록으로 정렬됩니다.
    return b.id - a.id;
  });

const resolveLocation = async (
  tx: Prisma.TransactionClient,
  data: { warehouseId?: number; locationId?: number; locationCode?: string },
) => {
  // 이전 구조처럼 locationId가 넘어오면 그대로 사용합니다.
  if (data.locationId) {
    const location = await tx.location.findUnique({
      where: { id: data.locationId },
      select: {
        id: true,
        code: true,
        warehouseId: true,
      },
    });

    if (!location) {
      throw new Error('선택한 위치를 찾을 수 없습니다.');
    }

    return location;
  }

  // 새 UI에서는 창고와 위치 코드를 받아 해당 위치를 재사용하거나 새로 만듭니다.
  const warehouseId = Number(data.warehouseId);
  const locationCode = data.locationCode?.trim().toUpperCase();

  if (!warehouseId || !locationCode) {
    throw new Error('창고와 위치를 모두 입력해주세요.');
  }

  return tx.location.upsert({
    where: {
      warehouseId_code: {
        warehouseId,
        code: locationCode,
      },
    },
    update: {},
    create: {
      warehouseId,
      code: locationCode,
    },
    select: {
      id: true,
      code: true,
      warehouseId: true,
    },
  });
};

const processStockMovement = async (
  userId: number,
  data: StockInDTO | StockOutDTO,
  type: InventoryType,
) => {
  return prisma.$transaction(async (tx) => {
    // 1. 처리할 상품이 존재하는지 먼저 확인합니다.
    const product = await tx.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('상품이 존재하지 않습니다.');
    }

    // 2. 사용자가 고른 창고/위치 정보를 실제 Location 레코드로 맞춥니다.
    const location = await resolveLocation(tx, data);

    // 3. 출고일 때는 현재 수량보다 많이 뺄 수 없게 막습니다.
    if (type === InventoryType.OUT && product.quantity < data.quantity) {
      throw new Error('재고가 부족합니다.');
    }

    // 4. 상품의 최신 수량과 창고/위치 정보를 함께 저장합니다.
    const updatedProduct = await tx.product.update({
      where: { id: data.productId },
      data: {
        quantity: {
          increment: type === InventoryType.IN ? data.quantity : -data.quantity,
        },
        locationId: location.id,
        warehouseId: location.warehouseId,
      },
    });

    // 5. 입출고 로그에도 같은 위치와 창고를 남겨 상세 페이지에서 바로 보여줄 수 있게 합니다.
    await tx.inventoryLog.create({
      data: {
        productId: data.productId,
        userId,
        locationId: location.id,
        warehouseId: location.warehouseId,
        type,
        quantity: data.quantity,
        note: data.note,
        processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
      },
    });

    return updatedProduct;
  });
};

/* 입고 */
export const stockIn = async (userId: number, data: StockInDTO) => {
  return processStockMovement(userId, data, InventoryType.IN);
};

/* 출고 */
export const stockOut = async (userId: number, data: StockOutDTO) => {
  return processStockMovement(userId, data, InventoryType.OUT);
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
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  const sortedLogs = sortLogsByTimeline(logs);
  const skip = (page - 1) * limit;
  const paginatedLogs = sortedLogs.slice(skip, skip + limit);

  return {
    data: paginatedLogs.map((log) => ({
      id: log.id,
      date: log.processedAt ?? log.createdAt,
      productId: log.product.id,
      productName: log.product.name,
      productCode: log.product.productCode,
      type: log.type,
      quantity: log.quantity,
      warehouse: log.location.warehouse.name,
      locationCode: log.location.code,
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

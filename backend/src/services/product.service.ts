import { InventoryType, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import {
  CreateProductDTO,
  ProductFilterDTO,
  UpdateProductDTO,
} from '../types/product.types';

const formatLocation = (location: any) => {
  if (!location) {
    return null;
  }

  return `${location.warehouse.name} ${location.code}`;
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

    return b.id - a.id;
  });

const getLastLog = (logs: any[], type: 'IN' | 'OUT') =>
  logs.find((log) => log.type === type)?.processedAt ||
  logs.find((log) => log.type === type)?.createdAt ||
  null;

const resolveProductLocation = async (
  tx: Prisma.TransactionClient,
  data: {
    locationId?: number;
    warehouseId?: number;
    locationCode?: string;
  },
) => {
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

/* 상품 생성 */
export const createProduct = async (data: CreateProductDTO, userId: number) => {
  return prisma.$transaction(async (tx) => {
    const location = await resolveProductLocation(tx, data);

    const product = await tx.product.create({
      data: {
        productCode: data.productCode,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        categoryId: data.categoryId,
        locationId: location.id,
        warehouseId: location.warehouseId,
        imageUrl: data.imageUrl,
        qrCode: `QR-${Date.now()}`,
        createdById: userId,
      },
    });

    // 관리자 직접 등록으로 초기 재고가 들어가면 이후 기록 화면과 수량이 어긋나지 않도록 초기 입고 로그를 함께 남김
    if (data.quantity > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          userId,
          warehouseId: location.warehouseId,
          locationId: location.id,
          type: InventoryType.IN,
          quantity: data.quantity,
          processedAt: new Date(),
          note: '관리자 직접 등록 초기 재고',
        },
      });
    }

    return product;
  });
};

/* 상품 리스트 조회 */
export const getProducts = async (
  filters: ProductFilterDTO & {
    page?: number;
    limit?: number;
  },
) => {
  const {
    search,
    categoryId,
    warehouseId,
    minQty,
    maxQty,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
              { productCode: { contains: search } },
            ],
          }
        : {},
      categoryId ? { categoryId } : {},
      warehouseId ? { warehouseId } : {},
      minQty !== undefined ? { quantity: { gte: minQty } } : {},
      maxQty !== undefined ? { quantity: { lte: maxQty } } : {},
    ],
  };

  const total = await prisma.product.count({ where });

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      warehouse: true,
      location: {
        include: {
          warehouse: true,
        },
      },
      inventoryLogs: {
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 20,
      },
      createdBy: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data: products.map((product) => ({
      ...(function () {
        const sortedLogs = sortLogsByTimeline(product.inventoryLogs);

        return {
          lastInDate: getLastLog(sortedLogs, 'IN'),
          lastOutDate: getLastLog(sortedLogs, 'OUT'),
        };
      })(),
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      imageUrl: product.imageUrl ?? null,

      categoryId: product.categoryId,
      categoryName: product.category?.name ?? null,

      warehouseId: product.warehouseId,
      warehouseName: product.warehouse?.name ?? product.location?.warehouse?.name ?? null,

      locationId: product.locationId,
      locationCode: product.location?.code ?? null,
      locationName: formatLocation(product.location),

      createdById: product.createdById,
      createdBy: product.createdBy?.name ?? null,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* 상품 수정 */
export const updateProduct = async (id: number, data: UpdateProductDTO, userId: number) => {
  return prisma.$transaction(async (tx) => {
    const currentProduct = await tx.product.findUnique({
      where: { id },
    });

    if (!currentProduct) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    const shouldUpdateLocation =
      data.locationId !== undefined ||
      data.warehouseId !== undefined ||
      data.locationCode !== undefined;

    const location = shouldUpdateLocation
      ? await resolveProductLocation(tx, data)
      : currentProduct.locationId
        ? await tx.location.findUnique({
            where: { id: currentProduct.locationId },
            select: { id: true, warehouseId: true, code: true },
          })
        : null;

    const nextQuantity = data.quantity ?? currentProduct.quantity;

    const updatedProduct = await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        quantity: nextQuantity,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        ...(location
          ? {
              locationId: location.id,
              warehouseId: location.warehouseId,
            }
          : {}),
      },
    });

    const quantityDiff = nextQuantity - currentProduct.quantity;

    // 관리자 수정에서 재고 수량이 바뀌면 차이만큼 로그를 자동 생성해서 상세 페이지 / 입출고 기록 / 대시보드 수치가 서로 어긋나지 않게
    if (quantityDiff !== 0 && location) {
      await tx.inventoryLog.create({
        data: {
          productId: updatedProduct.id,
          userId,
          warehouseId: location.warehouseId,
          locationId: location.id,
          type: quantityDiff > 0 ? InventoryType.IN : InventoryType.OUT,
          quantity: Math.abs(quantityDiff),
          processedAt: new Date(),
          note: '관리자 상품 정보 수정으로 재고 조정',
        },
      });
    }

    return updatedProduct;
  });
};

/* 상품 삭제 */
export const deleteProduct = async (id: number) => {
  const inventoryLogCount = await prisma.inventoryLog.count({
    where: { productId: id },
  });

  // 기록이 있는 상품을 바로 삭제하면 이력 조회가 깨질 수 있으므로 막기
  if (inventoryLogCount > 0) {
    throw new Error('입출고 기록이 있는 상품은 삭제할 수 없습니다.');
  }

  return prisma.product.delete({
    where: { id },
  });
};

const productInclude: Prisma.ProductInclude = {
  category: true,
  warehouse: true,
  location: {
    include: {
      warehouse: true,
    },
  },
  inventoryLogs: {
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 20,
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const getLastInOut = (logs: any[]) => {
  const sortedLogs = sortLogsByTimeline(logs);
  const lastIn = sortedLogs.find((log) => log.type === 'IN');
  const lastOut = sortedLogs.find((log) => log.type === 'OUT');

  return {
    lastInDate: lastIn?.processedAt ?? lastIn?.createdAt ?? null,
    lastOutDate: lastOut?.processedAt ?? lastOut?.createdAt ?? null,
  };
};

const buildDetailResponse = (product: any) => {
  const { lastInDate, lastOutDate } = getLastInOut(product.inventoryLogs);

  return {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    qrCode: product.qrCode,
    productCode: product.productCode,
    description: product.description,
    quantity: product.quantity,
    createdAt: product.createdAt,
    categoryId: product.categoryId,
    categoryName: product.category?.name || null,
    warehouseId: product.warehouseId,
    warehouseName: product.warehouse?.name || product.location?.warehouse?.name || null,
    locationId: product.locationId,
    locationCode: product.location?.code || null,
    locationName: formatLocation(product.location),
    createdById: product.createdById,
    createdBy: product.createdBy?.name || product.createdBy?.email || null,
    lastInDate,
    lastOutDate,
  };
};

/* QR 기준 상품 상세 */
export const getProductByQRCode = async (qrCode: string) => {
  const product = await prisma.product.findUnique({
    where: { qrCode },
    include: productInclude,
  });

  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.');
  }

  return buildDetailResponse(product);
};

/* 상품 상세 */
export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!product) {
    return null;
  }

  return buildDetailResponse(product);
};

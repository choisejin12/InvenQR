import { Prisma } from '@prisma/client';
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

  return `${location.warehouse.name}${location.code}`;
};

const getLastLog = (logs: any[], type: 'IN' | 'OUT') =>
  logs.find((log) => log.type === type)?.createdAt || null;

/* 상품 생성 */
export const createProduct = async (data: CreateProductDTO, userId: number) => {
  // 위치를 기준으로 상품이 생성되므로,
  // 먼저 위치가 어느 창고에 속하는지 조회해서 warehouseId를 같이 저장합니다.
  const location = await prisma.location.findUnique({
    where: { id: data.locationId },
    select: {
      id: true,
      warehouseId: true,
    },
  });

  if (!location) {
    throw new Error('선택한 위치를 찾을 수 없습니다.');
  }

  return prisma.product.create({
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
      location: {
        include: {
          warehouse: true,
        },
      },
      inventoryLogs: {
        orderBy: { createdAt: 'desc' },
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
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      imageUrl: product.imageUrl ?? null,

      categoryId: product.categoryId,
      categoryName: product.category?.name ?? null,

      locationId: product.locationId,
      locationName: formatLocation(product.location),

      warehouseId:product.warehouseId,
      warehouseName:product.location?.warehouse.name,

      createdById: product.createdById,
      createdBy: product.createdBy?.name ?? null,

      lastInDate: getLastLog(product.inventoryLogs, 'IN'),
      lastOutDate: getLastLog(product.inventoryLogs, 'OUT'),
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
export const updateProduct = async (id: number, data: UpdateProductDTO) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

/* 상품 삭제 */
export const deleteProduct = async (id: number) => {
  return prisma.product.delete({
    where: { id },
  });
};

const productInclude: Prisma.ProductInclude = {
  category: true,
  location: {
    include: {
      warehouse: true,
    },
  },
  inventoryLogs: {
    orderBy: { createdAt: 'desc' },
    take: 20,
  },
};

const getLastInOut = (logs: any[]) => {
  const lastIn = logs.find((log) => log.type === 'IN');
  const lastOut = logs.find((log) => log.type === 'OUT');

  return {
    lastInDate: lastIn?.createdAt ?? null,
    lastOutDate: lastOut?.createdAt ?? null,
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
    category: product.category?.name || null,
    locationName: formatLocation(product.location),
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

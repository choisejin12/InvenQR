import { PrismaClient } from '@prisma/client';
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilterDTO,
} from '../types/product.types';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/* location 문자열 가공 함수*/
const formatLocation = (location: any) => {
  if (!location) return null;
  return `${location.warehouse.name}${location.code}`;
};

const getLastLog = (logs: any[], type: 'IN' | 'OUT') => {
  return logs.find((l) => l.type === type)?.createdAt || null;
};



/*상품 생성*/
export const createProduct = async (data: CreateProductDTO) => (
  userId: number
) =>{
  return prisma.product.create({
    data: {
      productCode: data.productCode,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      categoryId: data.categoryId,
      locationId: data.locationId,
      imageUrl: data.imageUrl,
      qrCode: `QR-${Date.now()}`,
      createdById: userId,
    },
  });
};

/*상품 리스트 (검색 + 필터)*/
export const getProducts = async (filters: ProductFilterDTO & {
  page?: number;
  limit?: number;
}) => {
  const {
    search,
    categoryId,
    locationId,
    minQty,
    maxQty,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;

  // 전체 개수 (페이지네이션용)
  const total = await prisma.product.count({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {},
        categoryId ? { categoryId } : {},
        locationId ? { locationId } : {},
        minQty !== undefined ? { quantity: { gte: minQty } } : {},
        maxQty !== undefined ? { quantity: { lte: maxQty } } : {},
      ],
    },
  });

  const products = await prisma.product.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {},
        categoryId ? { categoryId } : {},
        locationId ? { locationId } : {},
        minQty !== undefined ? { quantity: { gte: minQty } } : {},
        maxQty !== undefined ? { quantity: { lte: maxQty } } : {},
      ],
    },
    include: {
      category: true,
      location: {
        include: {
          warehouse: true,
        },
      },
      inventoryLogs: {
        orderBy: { createdAt: 'desc' },
        take: 20, // 성능 고려
      },
      createdById: true,
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

  //  데이터 가공
  const result = products.map((p) => ({
    id: p.id,
    productCode: p.productCode,
    name: p.name,
    description: p.description,
    quantity: p.quantity,

    createdById: p.createdById,
    createdBy: p.createdBy?.name ?? null,

    // 위치
    locationName: formatLocation(p.location),

    // 최근 입출고
    lastInDate: getLastLog(p.inventoryLogs, 'IN'),
    lastOutDate: getLastLog(p.inventoryLogs, 'OUT'),
  }));

  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};


/*상품 수정*/
export const updateProduct = async (
  id: number,
  data: UpdateProductDTO
) => {
  return prisma.product.update({
    where: { id },
    data,
  });
};

/*상품 삭제*/
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
  const lastIn = logs.find((l) => l.type === 'IN');
  const lastOut = logs.find((l) => l.type === 'OUT');

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
    // QR
    qrCode: product.qrCode,
    // 기본 정보
    productCode: product.productCode,
    description: product.description,
    quantity: product.quantity,
    createdAt: product.createdAt,
    // 카테고리
    category: product.category?.name || null,
    // 위치
    locationName: formatLocation(product.location),

    lastInDate,
    lastOutDate,
  };
};

/*qr 상품상세페이지 */
export const getProductByQRCode = async (qrCode: string) => {
  const product = await prisma.product.findUnique({
    where: { qrCode },
    include: productInclude,
  });

  if (!product) throw new Error('상품 없음');

  return buildDetailResponse(product); 
};


/* 상품 상세페이지 */
export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude, 
  });

  if (!product) return null;

  return buildDetailResponse(product); 
};
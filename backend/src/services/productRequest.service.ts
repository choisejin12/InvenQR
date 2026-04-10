import { InventoryType, RequestStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateProductRequestDTO } from '../types/productRequest.types';

/* 상품 등록 요청 생성 */
export const createProductRequest = async (
  userId: number,
  data: CreateProductRequestDTO,
) => {
  if (!data.name || !data.categoryId || !data.warehouseId) {
    throw new Error('필수 값이 누락되었습니다.');
  }

  if (!data.locationCode) {
    throw new Error('위치를 입력해주세요.');
  }

  const locationCode = data.locationCode.trim();

  return prisma.productRequest.create({
    data: {
      productCode: data.productCode ?? `PR-${Date.now()}`,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      categoryId: data.categoryId,
      warehouseId: data.warehouseId,
      locationCode,
      imageUrl: data.imageUrl,
      requestedById: userId,
    },
  });
};

const buildRequestWhere = ({
  status,
  userId,
}: {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  userId?: number;
}) => ({
  ...(status ? { status: status as RequestStatus } : {}),
  ...(userId ? { requestedById: userId } : {}),
});

const mapRequest = (request: any) => ({
  id: request.id,
  productCode: request.productCode,
  name: request.name,
  description: request.description,
  quantity: request.quantity,
  status: request.status,
  imageUrl: request.imageUrl ?? null,

  categoryId: request.categoryId,
  categoryName: request.category?.name ?? null,

  warehouseId: request.warehouseId,
  warehouseName: request.warehouse?.name ?? null,
  warehouseCode: request.warehouse?.code ?? null,
  locationCode: request.locationCode,
  locationName: request.warehouse
    ? `${request.warehouse.name} - ${request.locationCode}`
    : request.locationCode,

  requestedById: request.requestedById,
  requestedByName: request.requestedBy?.name ?? request.requestedBy?.email ?? null,
  requestedByEmail: request.requestedBy?.email ?? null,

  approvedById: request.approvedById,
  approvedByName: request.approvedBy?.name ?? request.approvedBy?.email ?? null,
  approvedByEmail: request.approvedBy?.email ?? null,

  createdAt: request.createdAt,
  approvedAt: request.approvedAt,
  rejectReason: request.rejectReason,
});

/* 관리자용 전체 요청 목록 조회 */
export const getProductRequests = async ({
  status,
  page = 1,
  limit = 10,
}: {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;
  const where = buildRequestWhere({ status });

  const total = await prisma.productRequest.count({ where });

  const requests = await prisma.productRequest.findMany({
    where,
    include: {
      requestedBy: {
        select: { id: true, email: true, name: true },
      },
      approvedBy: {
        select: { id: true, email: true, name: true },
      },
      category: true,
      warehouse: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data: requests.map(mapRequest),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* 요청자 본인의 요청 목록 조회 */
export const getMyProductRequests = async (
  userId: number,
  {
    status,
    page = 1,
    limit = 10,
  }: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    page?: number;
    limit?: number;
  },
) => {
  const skip = (page - 1) * limit;
  const where = buildRequestWhere({ status, userId });

  const total = await prisma.productRequest.count({ where });
  
  const requests = await prisma.productRequest.findMany({
    where,
    include: {
      requestedBy: {
        select: { id: true, email: true, name: true },
      },
      approvedBy: {
        select: { id: true, email: true, name: true },
      },
      category: true,
      warehouse: true,
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data: requests.map(mapRequest),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* 관리자 승인 시 요청 데이터를 Product 테이블로 옮깁니다. */
export const approveProductRequest = async (
  requestId: number,
  adminId: number,
) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.productRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('요청을 찾을 수 없습니다.');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('이미 처리된 요청입니다.');
    }

    const location = await tx.location.upsert({
      where: {
        warehouseId_code: {
          warehouseId: request.warehouseId,
          code: request.locationCode,
        },
      },
      update: {},
      create: {
        warehouseId: request.warehouseId,
        code: request.locationCode,
      },
    });


    const product = await tx.product.create({
      data: {
        productCode: request.productCode,
        name: request.name,
        description: request.description,
        quantity: request.quantity,
        categoryId: request.categoryId,
        locationId: location.id,
        warehouseId: request.warehouseId,     ///수정한부분
        qrCode: `QR-${Date.now()}`,
        imageUrl: request.imageUrl,
        createdById: adminId,
      },
    });

    if (request.quantity > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          userId: request.requestedById,
          locationId: location.id,
          warehouseId: request.warehouseId,  ///수정한부분
          type: InventoryType.IN,
          quantity: request.quantity,
          note: '초기 입고',
        },
      });
    }

    const updatedRequest = await tx.productRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: {
        requestedBy: {
          select: { id: true, email: true, name: true },
        },
        approvedBy: {
          select: { id: true, email: true, name: true },
        },
        category: true,
        warehouse: true,
      },
    });

    return {
      request: mapRequest(updatedRequest),
      product,
    };
  });
};

/* 관리자 거절 시 거절 사유를 함께 저장합니다. */
export const rejectProductRequest = async (
  requestId: number,
  adminId: number,
  reason: string,
) => {
  const trimmedReason = reason?.trim();

  if (!trimmedReason) {
    throw new Error('거절 사유를 입력해주세요.');
  }

  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error('요청을 찾을 수 없습니다.');
  }

  if (request.status !== RequestStatus.PENDING) {
    throw new Error('이미 처리된 요청입니다.');
  }

  const updatedRequest = await prisma.productRequest.update({
    where: { id: requestId },
    data: {
      status: RequestStatus.REJECTED,
      approvedById: adminId,
      rejectReason: trimmedReason,
      approvedAt: new Date(),
    },
    include: {
      requestedBy: {
        select: { id: true, email: true, name: true },
      },
      approvedBy: {
        select: { id: true, email: true, name: true },
      },
      category: true,
      warehouse: true,
    },
  });

  return mapRequest(updatedRequest);
};

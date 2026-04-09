import { PrismaClient, RequestStatus, InventoryType } from '@prisma/client';
import { CreateProductRequestDTO } from '../types/productRequest.types'

const prisma = new PrismaClient();

/*요청 생성*/
export const createProductRequest = async (
  userId: number,
  data: CreateProductRequestDTO
) => {
  if (!data.name || !data.categoryId || !data.warehouseId) {
    throw new Error('필수 값이 누락되었습니다.');
  }

  if (!data.locationCode) {
    throw new Error('위치를 입력해주세요.');
  }

  // locationCode 정리 (공백 제거)
  const locationCode = data.locationCode.trim();

  return prisma.productRequest.create({
    data: {
      productCode:data.productCode ?? `PR-${Date.now()}`,
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
}) => {
  return {
    ...(status ? { status: status as RequestStatus } : {}),
    ...(userId ? { requestedById: userId } : {}),
  };
};

const mapRequest = (req: any) => ({
  id: req.id,
  productCode: req.productCode,
  name: req.name,
  quantity: req.quantity,
  status: req.status,

  requestedBy: req.requestedBy.email,
  approvedBy: req.approvedBy?.email ?? null,

  createdAt: req.createdAt,
  approvedAt: req.approvedAt,
  rejectReason: req.rejectReason,

  locationName: req.location
    ? `${req.location.warehouse.name}${req.location.code}`
    : null,

  categoryName: req.category?.name ?? null,
});


/*전체 요청 리스트 조회*/
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
        select: { id: true, email: true },
      },
      approvedBy: {
        select: { id: true, email: true },
      },
      category: true,
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
    data: requests.map(mapRequest),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/*나의 요청 조회*/
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
  }
) => {
  const skip = (page - 1) * limit;

  const where = buildRequestWhere({
    status,
    userId,
  });

  const total = await prisma.productRequest.count({ where });

  const requests = await prisma.productRequest.findMany({
    where,
    include: {
      requestedBy: {
        select: { id: true, email: true },
      },
      approvedBy: {
        select: { id: true, email: true },
      },
      category: true,
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
    data: requests.map(mapRequest),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/*요청 승인*/
export const approveProductRequest = async (
  requestId: number,
  adminId: number
) => {
  return prisma.$transaction(async (tx) => {
    // 1. 요청 가져오기
    const request = await tx.productRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new Error('요청 없음');

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('이미 처리된 요청');
    }

    // location 생성 또는 조회
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


    // 2. Product 생성
    const product = await tx.product.create({
      data: {
        productCode: `P-${Date.now()}`, // 간단 생성 (추후 개선 가능)
        name: request.name,
        description: request.description,
        quantity: request.quantity,
        categoryId: request.categoryId,
        locationId: location.id,
        qrCode: `QR-${Date.now()}`, // QR 코드 값
        imageUrl: request.imageUrl,
      },
    });

    // 3. InventoryLog 생성 (초기 입고)
    if (request.quantity > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          userId: adminId,
          locationId: location.id,
          type: InventoryType.IN,
          quantity: request.quantity,
          note: '초기 입고',
        },
      });
    }

    // 4. 요청 상태 업데이트
    const updated = await tx.productRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
    });

    return { request: updated, product };
  });
};

/*요청 거절*/
export const rejectProductRequest = async (
  requestId: number,
  adminId: number,
  reason: string
) => {
  return prisma.productRequest.update({
    where: { id: requestId },
    data: {
      status: RequestStatus.REJECTED,
      approvedById: adminId,
      rejectReason: reason,
      approvedAt: new Date(),
    },
  });
};
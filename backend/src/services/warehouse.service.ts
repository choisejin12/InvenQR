import { PrismaClient } from '@prisma/client';
import {CreateWarehouseDTO,UpdateWarehouseDTO} from '../types/warehouse.types'
const prisma = new PrismaClient();

/*창고 목록 조회 (Admin)*/
export const getWarehouses = async () => {
  const warehouses = await prisma.warehouse.findMany({
    include: {
      locations: {
        include: {
          products: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return warehouses.map((w) => {
    // 전체 상품 수 계산
    const totalProducts = w.locations.reduce(
      (sum, loc) => sum + loc.products.length,
      0
    );

    return {
      id: w.id,
      name: w.name,
      code: w.code,

      // 위치 리스트
      locations: w.locations.map((loc) => ({
        id: loc.id,
        code: loc.code,
      })),

      // 현재 보유 상품 수
      totalProducts,
    };
  });
};


export const createWarehouse = async (data: CreateWarehouseDTO) => {
  return prisma.warehouse.create({
    data,
  });
};

export const updateWarehouse = async (
  id: number,
  data: UpdateWarehouseDTO
) => {
  return prisma.warehouse.update({
    where: { id },
    data,
  });
};

export const deleteWarehouse = async (id: number) => {
  // product 존재 여부 체크 
  const productExist = await prisma.product.findFirst({
    where: {
      location: {
        warehouseId: id,
      },
    },
  });

  if (productExist) {
    throw new Error('상품이 존재하는 창고는 삭제할 수 없습니다.');
  }

  // location은 자동 생성 구조라 삭제 가능
  await prisma.location.deleteMany({
    where: { warehouseId: id },
  });

  return prisma.warehouse.delete({
    where: { id },
  });
};
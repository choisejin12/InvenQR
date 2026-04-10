import prisma from '../config/prisma';
import { CreateWarehouseDTO, UpdateWarehouseDTO } from '../types/warehouse.types';

/* 창고 목록 조회 */
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

  return warehouses.map((warehouse) => {
    const totalProducts = warehouse.locations.reduce(
      (sum, location) => sum + location.products.length,
      0,
    );

    return {
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      locations: warehouse.locations.map((location) => ({
        id: location.id,
        code: location.code,
      })),
      totalProducts,
    };
  });
};

export const createWarehouse = async (data: CreateWarehouseDTO) => {
  return prisma.warehouse.create({
    data,
  });
};

export const updateWarehouse = async (id: number, data: UpdateWarehouseDTO) => {
  return prisma.warehouse.update({
    where: { id },
    data,
  });
};

export const deleteWarehouse = async (id: number) => {
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

  const productRequestExist = await prisma.productRequest.findFirst({
    where: {
      warehouseId: id,
    },
  });

  if (productRequestExist) {
    throw new Error('이 창고를 참조하는 상품 등록 요청이 있어 삭제할 수 없습니다.');
  }

  await prisma.location.deleteMany({
    where: { warehouseId: id },
  });

  return prisma.warehouse.delete({
    where: { id },
  });
};

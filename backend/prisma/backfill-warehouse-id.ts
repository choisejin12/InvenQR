import prisma from '../src/config/prisma';

async function main() {
  // 기존 Product 데이터는 location에 연결된 warehouseId를 기준으로 채웁니다.
  const products = await prisma.product.findMany({
    where: {
      warehouseId: null,
      locationId: { not: null },
    },
    include: {
      location: true,
    },
  });

  let updatedProductCount = 0;

  for (const product of products) {
    if (!product.location?.warehouseId) {
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        warehouseId: product.location.warehouseId,
      },
    });

    updatedProductCount += 1;
  }

  // 기존 InventoryLog 데이터도 location을 기준으로 warehouseId를 채웁니다.
  const inventoryLogs = await prisma.inventoryLog.findMany({
    where: {
      warehouseId: null,
    },
    include: {
      location: true,
    },
  });

  let updatedInventoryLogCount = 0;

  for (const log of inventoryLogs) {
    if (!log.location?.warehouseId) {
      continue;
    }

    await prisma.inventoryLog.update({
      where: { id: log.id },
      data: {
        warehouseId: log.location.warehouseId,
      },
    });

    updatedInventoryLogCount += 1;
  }

  console.log(
    `Backfilled ${updatedProductCount} products and ${updatedInventoryLogCount} inventory logs.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

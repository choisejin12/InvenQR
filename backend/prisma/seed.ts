import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryNames = [
  '전자기기',
  'PC 부품',
  '주변기기',
  '네트워크 장비',
  '산업 부품',
  '공구 / 장비',
  '사무용품',
  '포장 자재',
  '안전 장비',
  '기타',
];

const warehouses = [
  {
    name: '화성창고A',
    code: 'HW-A',
  },
  {
    name: '시흥창고B',
    code: 'SH-B',
  },
];

async function main() {
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const warehouse of warehouses) {
    await prisma.warehouse.upsert({
      where: { code: warehouse.code },
      update: {
        name: warehouse.name,
      },
      create: warehouse,
    });
  }

  console.log(`Seeded ${categoryNames.length} categories and ${warehouses.length} warehouses.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

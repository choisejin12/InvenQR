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

async function main() {
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seeded ${categoryNames.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

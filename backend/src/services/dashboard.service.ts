import prisma from '../config/prisma';

type WeeklyStat = {
  date: string;
  in: number;
  out: number;
};

export const getDashboard = async () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6); 

  const [
    totalProducts,
    requestCounts,
    totalRequests,
    weeklyLogs,
    recentLogs
  ] = await Promise.all([

    // 총 상품 수
    prisma.product.count(),

    // 요청 상태별 개수
    prisma.productRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    }),

    // 전체 요청 수
    prisma.productRequest.count(),

    // 최근 7일 로그
    prisma.inventoryLog.findMany({
      where: {
        createdAt: {
          gte: weekAgo
        }
      },
      select: {
        type: true,
        createdAt: true
      }
    }),

    // 최근 3개 로그
    prisma.inventoryLog.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        product: {
          select: {
            name: true,
            productCode: true
          }
        }
      }
    })
  ]);

  // 상태 가공
  const pendingRequests =
    requestCounts.find((r: { status: string; _count: { status: number } }) => r.status === 'PENDING')?._count.status ?? 0;

  const approvedRequests =
    requestCounts.find((r: { status: string; _count: { status: number } }) => r.status === 'APPROVED')?._count.status ?? 0;

  // 주간 통계
  const weeklyStats: WeeklyStat[] = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);

    const dayLogs = weeklyLogs.filter((log: { type: string; createdAt: Date }) => {
      const d = new Date(log.createdAt);
      return d.toDateString() === date.toDateString();
    });

    return {
      date: date.toISOString().slice(0, 10),
      in: dayLogs.filter((l: { type: string }) => l.type === 'IN').length,
      out: dayLogs.filter((l: { type: string }) => l.type === 'OUT').length
    };
  }).reverse();

  return {
    totalProducts,
    pendingRequests,
    approvedRequests,
    totalRequests,
    weeklyStats,
    recentLogs
  };
};
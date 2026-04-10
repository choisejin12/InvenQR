import prisma from '../config/prisma';

type WeeklyStat = {
  date: string;
  label: string;
  in: number;
  out: number;
};

const getDayLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date); //문자열로 변환

export const getDashboard = async () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6); //일주일전
  weekAgo.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    requestCounts,
    totalRequests,
    weeklyLogs,
    recentLogs,
  ] = await Promise.all([
    prisma.product.count(), //전체상품수

    prisma.productRequest.groupBy({
      by: ['status'], //어떤 기준으로 묶을지
      _count: {
        status: true, //status 컬럼 기준으로 개수
      },
    }),

    prisma.productRequest.count(),//전체요청수

    prisma.inventoryLog.findMany({
      where: {
        createdAt: {
          gte: weekAgo, //일주일 전부터 지금까지 데이터 createdAt >= weekAgo
        },
      },
      select: {
        type: true,
        createdAt: true,
      },
    }),
    /*SELECT type, createdAt
      FROM InventoryLog
      WHERE createdAt >= weekAgo;*/

    prisma.inventoryLog.findMany({
      take: 5,//5개만
      orderBy: {
        createdAt: 'desc', //ORDER BY createdAt DESC
      },
      include: { //join
        product: { //상품 이름 + 상품코드
          select: { 
            name: true,
            productCode: true,
          },
        },
        user: { //작업한 유저 정보
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const pendingRequests = //대기중갯수
    requestCounts.find((count) => count.status === 'PENDING')?._count.status ?? 0;

  const approvedRequests = //승인갯수
    requestCounts.find((count) => count.status === 'APPROVED')?._count.status ?? 0;

  const weeklyStats: WeeklyStat[] = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - index);
    date.setHours(0, 0, 0, 0);

    //해당 날짜 로그 필터링
    const dayLogs = weeklyLogs.filter((log) => {
      const target = new Date(log.createdAt);
      return target.toDateString() === date.toDateString();
    });

    return {
      date: date.toISOString().slice(0, 10), //ISO 형식 날짜
      label: getDayLabel(date),
      in: dayLogs.filter((log) => log.type === 'IN').length,
      out: dayLogs.filter((log) => log.type === 'OUT').length,
    };
  }).reverse(); //[6일전 → ... → 오늘]

  
  return {
    totalProducts,
    pendingRequests,
    approvedRequests,
    totalRequests,
    weeklyStats,
    recentLogs: recentLogs.map((log) => ({
      id: log.id,
      productName: log.product.name,
      productCode: log.product.productCode,
      requester: log.user.name || log.user.email,
      type: log.type,
      quantity: log.quantity,
      createdAt: log.createdAt,
    })),
  };
};

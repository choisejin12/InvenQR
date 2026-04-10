export type DashboardWeeklyStat = {
  date: string;
  label: string;
  in: number;
  out: number;
};

export type DashboardRecentLog = {
  id: number;
  productName: string;
  productCode: string;
  requester: string;
  type: 'IN' | 'OUT';
  quantity: number;
  createdAt: string;
};

export type DashboardResponse = {
  totalProducts: number;
  pendingRequests: number;
  approvedRequests: number;
  totalRequests: number;
  weeklyStats: DashboardWeeklyStat[];
  recentLogs: DashboardRecentLog[];
};

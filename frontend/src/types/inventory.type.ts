export type InventoryLogItem = {
  id: number;
  date: string;
  productId: number;
  productName: string;
  productCode: string;
  type: 'IN' | 'OUT';
  quantity: number;
  warehouse: string;
  locationCode: string;
  locationName: string;
  manager: string;
  note: string | null;
};

export type InventoryLogPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type InventoryLogListResponse = {
  data: InventoryLogItem[];
  pagination: InventoryLogPagination;
};

export type InventoryLogListParams = {
  categoryId?: number;
  warehouseId?: number;
  type?: 'IN' | 'OUT';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type ProductInventoryLogParams = {
  productId: number;
  page?: number;
  limit?: number;
};

// 입고/출고 모달에서 사용하는 공통 payload입니다.
// UI는 창고 선택 + 위치 코드 입력 방식이므로 warehouseId와 locationCode를 보냅니다.
export type StockMovementPayload = {
  productId: number;
  quantity: number;
  warehouseId: number;
  locationCode: string;
  processedAt: string;
  note?: string;
};

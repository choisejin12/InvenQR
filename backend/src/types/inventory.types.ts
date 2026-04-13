export type InventoryLogFilterDTO = {
  productId?: number;
  name?: string;
  categoryId?: number;
  warehouseId?: number;
  type?: 'IN' | 'OUT';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

// 입고/출고 폼은 "창고 선택 + 위치 코드 입력" 방식으로 동작하므로
// warehouseId와 locationCode를 기본값으로 받고,
// 기존 호출과의 호환을 위해 locationId도 선택적으로 남겨둡니다.
export type StockInDTO = {
  productId: number;
  quantity: number;
  warehouseId?: number;
  locationId?: number;
  locationCode?: string;
  note?: string;
  processedAt?: string;
};

export type StockOutDTO = {
  productId: number;
  quantity: number;
  warehouseId?: number;
  locationId?: number;
  locationCode?: string;
  note?: string;
  processedAt?: string;
};

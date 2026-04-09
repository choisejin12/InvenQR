export type InventoryLogFilterDTO = {
  productId?: number;
  name?:string;
  categoryId?: number;
  warehouseId?: number;
  type?: 'IN' | 'OUT';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type StockInDTO = {
  productId: number;
  quantity: number;
  locationId: number;
  note?: string;
  processedAt?: string;
};

export type StockOutDTO = {
  productId: number;
  quantity: number;
  locationId: number;
  note?: string;
  processedAt?: string;
};
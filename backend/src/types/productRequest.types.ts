export type CreateProductRequestDTO = {
  productCode: string;
  name: string;
  description?: string;
  quantity: number;
  categoryId: number;
  warehouseId: number;
  locationCode: string;
  imageUrl?: string;
};

export type RejectProductRequestDTO = {
  reason: string;
};
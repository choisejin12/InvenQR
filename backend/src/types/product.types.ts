export type CreateProductDTO = {
  productCode: string;
  name: string;
  description?: string;
  quantity: number;
  categoryId?: number;
  locationId?: number;
  warehouseId?: number;
  locationCode?: string;
  imageUrl?: string;
};

export type UpdateProductDTO = {
  name?: string;
  description?: string;
  quantity?: number;
  categoryId?: number;
  locationId?: number;
  warehouseId?: number;
  locationCode?: string;
  imageUrl?: string;
};

export type ProductFilterDTO = {
  search?: string;
  categoryId?: number;
  warehouseId?: number;
  minQty?: number;
  maxQty?: number;
  createdById?: number;
  name?: string;
};

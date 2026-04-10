export type ProductListParams = {
  search?: string;
  categoryId?: number;
  locationId?: number;
  page?: number;
  limit?: number;
};

export type ProductItem = {
  id: number;
  productCode: string;
  name: string;
  description: string | null;
  quantity: number;
  createdById?: number | null;
  createdBy?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  locationId?: number | null;
  locationName: string | null;
  lastInDate: string | null;
  lastOutDate: string | null;
  imageUrl?: string | null;
  warehouseName?: string | null;
  warehouseId?: number | null;
};

export type ProductPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductListResponse = {
  data: ProductItem[];
  pagination: ProductPagination;
};

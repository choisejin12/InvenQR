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
  locationCode?: string | null;
  locationName: string | null;
  lastInDate: string | null;
  lastOutDate: string | null;
  imageUrl?: string | null;
  warehouseName?: string | null;
  warehouseId?: number | null;
};

export type ProductDetailItem = {
  id: number;
  name: string;
  imageUrl: string | null;
  qrCode: string | null;
  productCode: string;
  description: string | null;
  quantity: number;
  createdAt: string;
  categoryId: number | null;
  categoryName: string | null;
  warehouseId: number | null;
  warehouseName: string | null;
  locationId: number | null;
  locationCode: string | null;
  locationName: string | null;
  createdById: number | null;
  createdBy: string | null;
  lastInDate: string | null;
  lastOutDate: string | null;
};

export type CreateProductPayload = {
  productCode: string;
  name: string;
  description?: string;
  quantity: number;
  categoryId?: number;
  warehouseId: number;
  locationCode: string;
  imageUrl?: string;
};

export type UpdateProductPayload = {
  id: number;
  productCode?: string;
  name?: string;
  description?: string;
  quantity?: number;
  categoryId?: number;
  warehouseId?: number;
  locationCode?: string;
  imageUrl?: string;
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

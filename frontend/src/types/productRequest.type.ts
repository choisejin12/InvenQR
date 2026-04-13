export type ProductRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CreateProductRequestPayload = {
  productCode: string;
  name: string;
  description?: string;
  quantity: number;
  categoryId: number;
  warehouseId: number;
  locationCode: string;
  imageUrl?: string;
};

export type ProductRequestItem = {
  id: number;
  productId?: number | null;
  productCode: string;
  name: string;
  description?: string | null;
  quantity: number;
  status: ProductRequestStatus;
  imageUrl?: string | null;

  categoryId: number;
  categoryName: string | null;

  warehouseId: number;
  warehouseName: string | null;
  warehouseCode: string | null;
  locationCode: string;
  locationName: string | null;

  requestedById: number;
  requestedByName: string | null;
  requestedByEmail: string | null;

  approvedById?: number | null;
  approvedByName?: string | null;
  approvedByEmail?: string | null;

  createdAt: string;
  approvedAt?: string | null;
  rejectReason?: string | null;
};

export type ProductRequestPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductRequestListResponse = {
  data: ProductRequestItem[];
  pagination: ProductRequestPagination;
};

export type RejectProductRequestPayload = {
  reason: string;
};

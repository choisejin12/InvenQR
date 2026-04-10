export type WarehouseLocation = {
  id: number;
  code: string;
};

export type WarehouseItem = {
  id: number;
  name: string;
  code: string;
  locations: WarehouseLocation[];
  totalProducts: number;
};

export type CreateWarehousePayload = {
  name: string;
  code: string;
};

export type UpdateWarehousePayload = {
  id: number;
  name: string;
  code: string;
};

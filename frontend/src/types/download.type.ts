export type DownloadLogItem = {
  id: number;
  type: 'PRODUCTS' | 'INVENTORY';
  fileName: string;
  fileSize: number;
  user: string;
  createdAt: string;
};

export type DownloadLogResponse = {
  data: DownloadLogItem[];
};

export type DownloadType = 'PRODUCTS' | 'INVENTORY';

export type DownloadLogDTO = {
  id: number;
  type: DownloadType;
  fileName: string;
  fileSize: number;
  user: string;
  createdAt: Date;
};
import type { AxiosError } from 'axios';
import axios from './axios';
import type { DownloadLogResponse } from '../types/download.type';

const normalizeDownloadError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  return new Error(
    axiosError.response?.data?.message || 'CSV 다운로드 처리 중 문제가 발생했습니다.',
  );
};

const getFileNameFromDisposition = (value?: string) => {
  if (!value) {
    return null;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const fileNameMatch = value.match(/filename="?([^"]+)"?/i);
  return fileNameMatch?.[1] ?? null;
};

const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.URL.revokeObjectURL(url);
};

const requestCsvDownload = async (path: '/download/products' | '/download/inventory') => {
  try {
    const response = await axios.get<Blob>(path, {
      responseType: 'blob',
    });

    const fileName =
      getFileNameFromDisposition(response.headers['content-disposition']) || 'download.csv';

    triggerBlobDownload(response.data, fileName);
    return fileName;
  } catch (error) {
    throw normalizeDownloadError(error);
  }
};

export const downloadProductsCSVAPI = () => requestCsvDownload('/download/products');

export const downloadInventoryCSVAPI = () => requestCsvDownload('/download/inventory');

export const getDownloadLogsAPI = async (): Promise<DownloadLogResponse> => {
  const response = await axios.get<DownloadLogResponse>('/download/logs');
  return response.data;
};

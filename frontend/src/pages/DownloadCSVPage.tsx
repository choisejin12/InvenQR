import { useMemo, useState } from 'react';
import {
  FiArchive,
  FiDownload,
  FiFileText,
  FiHardDrive,
  FiRefreshCcw,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { downloadInventoryCSVAPI, downloadProductsCSVAPI } from '../api/downloadAPI';
import { useDownloadLogs } from '../hooks/useDownloadLogs';
import type { DownloadLogItem } from '../types/download.type';

type DownloadKind = 'PRODUCTS' | 'INVENTORY' | null;

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getDownloadTypeLabel = (type: DownloadLogItem['type']) =>
  type === 'PRODUCTS' ? '전체 제품 목록' : '입출고 기록';

const downloadCards = [
  {
    type: 'PRODUCTS' as const,
    title: '전체 제품 목록 다운로드',
    description: '전체 제품 목록 CSV 파일을 다운로드합니다.',
  },
  {
    type: 'INVENTORY' as const,
    title: '입출고 기록 다운로드',
    description: '입출고 기록 CSV 파일을 다운로드합니다.',
  },
];

const DownloadCSVPage = () => {
  // 어떤 파일을 다운로드 중인지 기억해 두면 버튼 중복 클릭을 막을 수 있습니다.
  const [downloadingType, setDownloadingType] = useState<DownloadKind>(null);
  const { data, isLoading, isError, refetch, isFetching } = useDownloadLogs(true);

  const logs = data?.data ?? [];

  const summary = useMemo(
    () => ({
      total: logs.length,
      productCount: logs.filter((log) => log.type === 'PRODUCTS').length,
      inventoryCount: logs.filter((log) => log.type === 'INVENTORY').length,
    }),
    [logs],
  );

  const handleDownload = async (type: Exclude<DownloadKind, null>) => {
    try {
      setDownloadingType(type);

      const fileName =
        type === 'PRODUCTS'
          ? await downloadProductsCSVAPI()
          : await downloadInventoryCSVAPI();

      toast.success(`${fileName} 다운로드를 시작했습니다.`);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'CSV 다운로드에 실패했습니다.');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8">
        <p className="text-sm font-medium text-blue-100">데이터 관리 · CSV 다운로드</p>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">필요한 데이터를 CSV로 바로 내려받으세요</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
          전체 제품 목록과 입출고 기록을 클릭 한 번으로 다운로드하고, 누가 어떤 파일을
          내려받았는지도 아래 기록에서 함께 확인할 수 있습니다.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Total Downloads</p>
            <p className="mt-3 text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Product CSV</p>
            <p className="mt-3 text-2xl font-bold">{summary.productCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Inventory CSV</p>
            <p className="mt-3 text-2xl font-bold">{summary.inventoryCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="rounded-[24px] border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-5 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-22 w-22 items-center justify-center rounded-[22px] bg-white text-[#2F6FBB] shadow-md">
              <FiArchive size={42} />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900">CSV 다운로드</h2>
              <div className="mt-3 h-px w-full bg-slate-200" />
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                제품 데이터와 입출고 데이터를 CSV 파일로 다운로드할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {downloadCards.map((card) => {
            const isDownloading = downloadingType === card.type;

            return (
              <button
                key={card.type}
                type="button"
                onClick={() => handleDownload(card.type)}
                disabled={downloadingType !== null}
                className="group rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <FiDownload />
                      {card.type === 'PRODUCTS' ? 'PRODUCT CSV' : 'INVENTORY CSV'}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{card.description}</p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-3 text-[#2F6FBB] transition group-hover:bg-blue-100">
                    <FiFileText size={24} />
                  </div>
                </div>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6FBB]">
                  {isDownloading ? '다운로드 준비 중...' : '클릭해서 CSV 다운로드'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">다운로드 기록</h2>
            <p className="mt-1 text-sm text-slate-500">
              날짜 / 종류 / 파일명 / 파일 크기 / 다운로드한 사람을 확인할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiRefreshCcw className={isFetching ? 'animate-spin' : ''} />
            새로고침
          </button>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center px-6 py-12 text-sm text-slate-500">
            다운로드 기록을 불러오는 중입니다...
          </div>
        ) : isError ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="rounded-full bg-rose-50 p-4 text-rose-500">
              <FiArchive size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">다운로드 기록을 불러오지 못했습니다.</p>
              <p className="mt-1 text-sm text-slate-500">API 연결 상태를 확인해주세요.</p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <FiArchive size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">아직 다운로드 기록이 없습니다.</p>
              <p className="mt-1 text-sm text-slate-500">위 카드에서 CSV를 내려받으면 기록이 쌓입니다.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">날짜</th>
                    <th className="px-6 py-4 font-semibold">종류</th>
                    <th className="px-6 py-4 font-semibold">다운로드한 파일 이름</th>
                    <th className="px-6 py-4 font-semibold">파일 크기</th>
                    <th className="px-6 py-4 font-semibold">다운받은 사람</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-slate-100 text-sm text-slate-700">
                      <td className="px-6 py-4">{formatDateTime(log.createdAt)}</td>
                      <td className="px-6 py-4">{getDownloadTypeLabel(log.type)}</td>
                      <td className="px-6 py-4 font-semibold text-[#2F6FBB]">{log.fileName}</td>
                      <td className="px-6 py-4">{formatFileSize(log.fileSize)}</td>
                      <td className="px-6 py-4">{log.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 sm:p-6 lg:hidden">
              {logs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                >
                  <p className="text-sm font-medium text-slate-500">{formatDateTime(log.createdAt)}</p>
                  <h3 className="mt-2 text-lg font-bold text-[#2F6FBB]">{log.fileName}</h3>
                  <p className="mt-1 text-sm text-slate-700">{getDownloadTypeLabel(log.type)}</p>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="flex items-center gap-2 text-xs text-slate-400">
                        <FiHardDrive />
                        파일 크기
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-700">
                        {formatFileSize(log.fileSize)}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="flex items-center gap-2 text-xs text-slate-400">
                        <FiUser />
                        다운받은 사람
                      </dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.user}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default DownloadCSVPage;

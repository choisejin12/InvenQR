import { useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiInbox, FiXCircle } from 'react-icons/fi';
import { useMyProductRequests } from '../hooks/useMyProductRequests';
import type {
  ProductRequestItem,
  ProductRequestStatus,
} from '../types/productRequest.type';

type FilterTab = ProductRequestStatus | 'ALL';

const filterTabs: { label: string; value: FilterTab }[] = [
  { label: '전체', value: 'ALL' },
  { label: '대기중', value: 'PENDING' },
  { label: '승인완료', value: 'APPROVED' },
  { label: '거절됨', value: 'REJECTED' },
];

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
};

//상태에따른디자인변경
const getStatusTone = (status: ProductRequestStatus) => {
  if (status === 'APPROVED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status === 'REJECTED') {
    return 'bg-rose-50 text-rose-600 border-rose-200';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

//이미지 가져오기
const getPreviewImage = (request: ProductRequestItem) => {
  if (request.imageUrl) {
    return request.imageUrl;
  }
  return 'https://placehold.co/160x160/e2e8f0/64748b?text=No+Image';
};


const RequestProductPage = () => {

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL'); // 사용자가 보고 싶은 상태만 골라서 보기 위한 탭 상태

  const { data, isLoading, isError, refetch } = useMyProductRequests('ALL');
  const requests = data?.data ?? [];

  const requestCounts = useMemo(
    () => ({
      ALL: requests.length,
      PENDING: requests.filter((request) => request.status === 'PENDING').length,
      APPROVED: requests.filter((request) => request.status === 'APPROVED').length,
      REJECTED: requests.filter((request) => request.status === 'REJECTED').length,
    }),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    if (activeTab === 'ALL') {
      return requests;
    }

    return requests.filter((request) => request.status === activeTab);
  }, [activeTab, requests]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 px-6 py-7 text-white shadow-xl sm:px-8">
        <p className="text-sm font-medium text-emerald-100">요청관리</p>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">내가 요청한 상품 등록 내역을 확인하세요</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
          상품 등록 요청 상태와 관리자 처리 결과를 한 화면에서 확인할 수 있습니다. 거절된 요청은 사유까지 함께 표시됩니다.
        </p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label} ({requestCounts[tab.value]})
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
            요청 목록을 불러오는 중입니다...
          </div>
        ) : isError ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <p className="font-semibold text-slate-900">요청 목록을 불러오지 못했습니다.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FiInbox size={20} />
            </div>
            <p className="mt-4 font-semibold text-slate-900">표시할 요청이 없습니다.</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <article
              key={request.id}
              className="overflow-hidden  border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                  <img
                    src={getPreviewImage(request)}
                    alt={request.name}
                    className="h-24 w-24 rounded-2xl border border-slate-200 object-cover sm:h-28 sm:w-28"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 sm:text-lg">{request.name}</h2>
                      <span className="text-sm text-slate-500">{request.productCode}</span>
                    </div>

                    <p className="mt-1 text-sm text-slate-600">{request.description || '설명 없음'}</p>

                    <div className="mt-3 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold">카테고리:</span> {request.categoryName || '-'}
                      </p>
                      <p>
                        <span className="font-semibold">창고:</span> {request.warehouseName || '-'}
                      </p>
                      <p>
                        <span className="font-semibold">위치:</span> {request.locationCode}
                      </p>
                      <p>
                        <span className="font-semibold">요청 수량:</span> {request.quantity}개
                      </p>
                    </div>

                    {request.rejectReason && (
                      <div className="mt-3  text-sm text-rose-700">
                        <span className="font-semibold">거절 사유:</span> {request.rejectReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex min-w-[220px] flex-col items-stretch gap-3 lg:items-end">


                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(request.status)}`}
                  >
                    {request.status === 'PENDING' && <FiClock size={14} />}
                    {request.status === 'APPROVED' && <FiCheckCircle size={14} />}
                    {request.status === 'REJECTED' && <FiXCircle size={14} />}
                    {request.status}
                  </span>

                  <div className="text-sm text-slate-500">
                    요청일: {formatDate(request.createdAt)}
                    {request.approvedAt ? ` / 처리일: ${formatDate(request.approvedAt)}` : ''}
                  </div>

                  {request.approvedByName && (
                    <p className="text-sm text-slate-500">처리 관리자: {request.approvedByName}</p>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default RequestProductPage;

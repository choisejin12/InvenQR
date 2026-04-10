import { useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import RejectReasonModal from '../../components/request/RejectReasonModal';
import { useAdminProductRequests } from '../../hooks/useAdminProductRequests';
import { useApproveProductRequest } from '../../hooks/useApproveProductRequest';
import { useRejectProductRequest } from '../../hooks/useRejectProductRequest';
import type {
  ProductRequestItem,
  ProductRequestStatus,
} from '../../types/productRequest.type';

type FilterTab = ProductRequestStatus | 'ALL';

const filterTabs: { label: string; value: FilterTab }[] = [
  { label: '모두', value: 'ALL' },
  { label: 'PENDING', value: 'PENDING' },
  { label: 'APPROVED', value: 'APPROVED' },
  { label: 'REJECTED', value: 'REJECTED' },
];

const getStatusTone = (status: ProductRequestStatus) => {
  if (status === 'APPROVED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (status === 'REJECTED') {
    return 'bg-rose-50 text-rose-600 border-rose-200';
  }

  return 'bg-amber-50 text-amber-700 border-amber-200';
};

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

const getPreviewImage = (request: ProductRequestItem) => {
  if (request.imageUrl) {
    return request.imageUrl;
  }

  return 'https://placehold.co/160x160/e2e8f0/64748b?text=No+Image';
};

const AdminRequestProductPage = () => {
  // 현재 어떤 상태 탭을 보고 있는지 저장
  const [activeTab, setActiveTab] = useState<FilterTab>('PENDING');

  // 거절 모달이 어느 요청을 대상으로 열렸는지 저장
  const [selectedRequest, setSelectedRequest] = useState<ProductRequestItem | null>(null);

  const { data, isLoading, isError, refetch } = useAdminProductRequests('ALL');
  const approveProductRequest = useApproveProductRequest();
  const rejectProductRequest = useRejectProductRequest();

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

  // 현재 탭에 맞는 요청만 골라서 렌더링
  const filteredRequests = useMemo(() => {
    if (activeTab === 'ALL') {
      return requests;
    }

    return requests.filter((request) => request.status === activeTab);
  }, [activeTab, requests]);

  const handleApprove = async (requestId: number) => {
    try {
      await approveProductRequest.mutateAsync(requestId);
      toast.success('상품 요청이 승인되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '상품 승인 중 문제가 발생했습니다.');
    }
  };

  const handleReject = async ({ reason }: { reason: string }) => {
    if (!selectedRequest) {
      return;
    }

    try {
      await rejectProductRequest.mutateAsync({
        requestId: selectedRequest.id,
        reason,
      });
      toast.success('상품 요청이 거절되었습니다.');
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '상품 거절 중 문제가 발생했습니다.');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8">
          <p className="text-sm font-medium text-blue-100">ADMIN · 제품 승인 요청 관리</p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">사용자 상품 등록 요청을 검토하고 처리하세요</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
            관리자는 요청 정보를 검토한 뒤 승인하면 상품 테이블에 등록되고, 거절하면 사유가 저장되어 요청자도 확인할 수 있습니다.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Pending</p>
              <p className="mt-3 text-2xl font-bold">{requestCounts.PENDING}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Approved</p>
              <p className="mt-3 text-2xl font-bold">{requestCounts.APPROVED}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Rejected</p>
              <p className="mt-3 text-2xl font-bold">{requestCounts.REJECTED}</p>
            </div>
          </div>
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
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
              승인 요청 목록을 불러오는 중입니다...
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
              <p className="font-semibold text-slate-900">현재 탭에 표시할 요청이 없습니다.</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const isPending = request.status === 'PENDING';
              const mutationLoading =
                approveProductRequest.isPending || rejectProductRequest.isPending;

              return (
                <article
                  key={request.id}
                  className="overflow-hidden  border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
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
                          <span className="rounded-lg bg-[#FF8181] px-2 py-1 text-xs font-bold text-white">
                            {request.categoryName || '-'}
                          </span>
                          <h2 className="text-base font-bold text-[#4177D4] sm:text-lg">{request.name}</h2>
                          <span className="text-sm text-slate-500">{request.productCode}</span>
                        </div>

                        <p className="mt-1 text-sm text-slate-600">{request.description || '설명 없음'}</p>

                        <div className="mt-3 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
                          <p>
                            <span className="font-semibold">창고:</span> {request.warehouseName || '-'}
                          </p>
                          <p>
                            <span className="font-semibold">위치:</span> {request.locationCode}
                          </p>
                          <p>
                            <span className="font-semibold">재고 수량:</span> {request.quantity}개
                          </p>
                        </div>

                        {request.rejectReason && (
                          <div className="mt-3 text-sm text-rose-700">
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

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>요청자: {request.requestedByName || request.requestedByEmail || '-'}</span>
                        <span className="hidden text-slate-300 sm:inline">|</span>
                        <span>요청일: {formatDate(request.createdAt)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={!isPending || mutationLoading}
                          onClick={() => handleApprove(request.id)}
                          className=" bg-blue-600 px-5 py-3 md:w-32.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          disabled={!isPending || mutationLoading}
                          onClick={() => setSelectedRequest(request)}
                          className=" bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      <RejectReasonModal
        isOpen={!!selectedRequest}
        isSubmitting={rejectProductRequest.isPending}
        onClose={() => setSelectedRequest(null)}
        onSubmit={handleReject}
      />
    </>
  );
};

export default AdminRequestProductPage;

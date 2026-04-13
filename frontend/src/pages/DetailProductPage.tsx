import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  FiAlertCircle,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiCalendar,
  FiGrid,
  FiPackage,
  FiRefreshCcw,
  FiUser,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import StockMovementModal from '../components/product/StockMovementModal';
import { useProductDetail } from '../hooks/useProductDetail';
import { useProductInventoryLogs } from '../hooks/useProductInventoryLogs';
import { useStockIn } from '../hooks/useStockIn';
import { useStockOut } from '../hooks/useStockOut';
import { useWarehouses } from '../hooks/useWarehouses';

const formatDate = (value?: string | null) => {
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

const getSignedQuantity = (type: 'IN' | 'OUT', quantity: number) =>
  `${type === 'IN' ? '+' : '-'}${quantity}`;

const DetailProductPage = () => {
  // URL의 :productId 값을 읽어와 어떤 상품을 보여줄지 결정
  const { productId } = useParams();
  const navigate = useNavigate();

  // 입고/출고 모달은 하나만 열리도록 모드 값으로 제어
  const [movementMode, setMovementMode] = useState<'IN' | 'OUT' | null>(null);

  // 하단 입출고 기록은 페이지 단위로 조회
  const [logPage, setLogPage] = useState(1);

  const parsedProductId = Number(productId);
  const isValidProductId = Number.isFinite(parsedProductId) && parsedProductId > 0;

  const { data: product, isLoading, isError, refetch, isFetching } = useProductDetail(
    parsedProductId,
    isValidProductId,
  );
  const {
    data: logResponse,
    isLoading: isLogLoading,
    isError: isLogError,
    refetch: refetchLogs,
  } = useProductInventoryLogs(parsedProductId, logPage, 8, isValidProductId);
  const { data: warehouses = [] } = useWarehouses(true);

  const stockIn = useStockIn();
  const stockOut = useStockOut();

  const logs = logResponse?.data ?? [];
  const pagination = logResponse?.pagination;
  const isSubmitting = stockIn.isPending || stockOut.isPending;
  const [qrImageUrl, setQrImageUrl] = useState('');

  // QR 코드는 문자열 값을 이미지 data URL로 변환해서 렌더링
  // 이렇게 하면 라이브러리 import 호환 문제 없이 항상 img로 보여줄수있음
  useEffect(() => {
    const qrValue = product?.qrCode || (product ? `PRODUCT-${product.productCode}` : '');

    if (!qrValue) {
      setQrImageUrl('');
      return;
    }

    let isMounted = true;

    QRCode.toDataURL(qrValue, {
      width: 152,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((url: string) => {
        if (isMounted) {
          setQrImageUrl(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrImageUrl('');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product]);

  // 상세 카드의 상태 배지는 수량에 따라 색을 다르게
  const stockTone = useMemo(() => {
    if (!product) {
      return 'bg-slate-100 text-slate-600';
    }

    if (product.quantity <= 0) {
      return 'bg-rose-100 text-rose-600';
    }

    if (product.quantity <= 10) {
      return 'bg-amber-100 text-amber-700';
    }

    return 'bg-emerald-100 text-emerald-700';
  }, [product]);

  const handleMovementSubmit = async (values: {
    quantity: number;
    warehouseId: number;
    locationCode: string;
    processedAt: string;
    note: string;
  }) => {
    if (!product || !movementMode) {
      return;
    }

    const payload = {
      productId: product.id,
      quantity: Number(values.quantity),
      warehouseId: Number(values.warehouseId),
      locationCode: values.locationCode.trim().toUpperCase(),
      processedAt: values.processedAt,
      note: values.note.trim() || undefined,
    };

    try {
      if (movementMode === 'IN') {
        await stockIn.mutateAsync(payload);
        toast.success('입고 처리가 완료되었습니다.');
      } else {
        await stockOut.mutateAsync(payload);
        toast.success('출고 처리가 완료되었습니다.');
      }

      setMovementMode(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '입출고 처리 중 문제가 발생했습니다.');
    }
  };

  if (!isValidProductId) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="font-semibold text-slate-900">잘못된 상품 경로입니다.</p>
        <button
          type="button"
          onClick={() => navigate('/product')}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          상품 목록으로 이동
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
        상품 상세 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
        <p className="font-semibold text-slate-900">상품 상세 정보를 불러오지 못했습니다.</p>
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => navigate('/product')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8">
          <p className="text-sm font-medium text-blue-100">상품 관리 · 상품 상세페이지</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
                상품 정보, QR 코드, 최근 입출고 기록을 한 화면에서 확인하고 바로 입고 또는
                출고 처리를 진행할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                refetch();
                refetchLogs();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <FiRefreshCcw className={isFetching ? 'animate-spin' : ''} />
              새로고침
            </button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[1.15/1] bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white text-slate-400">
                    <div className="text-center">
                      <FiPackage className="mx-auto" size={40} />
                      <p className="mt-3 text-sm font-semibold">등록된 상품 이미지가 없습니다.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 px-4 py-4">
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      {qrImageUrl ? (
                        <img
                          src={qrImageUrl}
                          alt={`${product.name} QR 코드`}
                          className="h-[76px] w-[76px]"
                        />
                      ) : (
                        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-400">
                          QR
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">QR 코드</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.qrCode || `PRODUCT-${product.productCode}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
                  <span className="rounded-lg bg-[#78A866] px-3 py-1 text-xs font-semibold text-white">
                    {product.categoryName || '미분류'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{product.description || '설명이 없습니다.'}</p>
              </div>

              <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${stockTone}`}>
                재고 수량 {product.quantity}개
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">코드</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{product.productCode}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">창고</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{product.warehouseName || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">위치</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{product.locationCode || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiCalendar />
                  등록일
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">{formatDate(product.createdAt)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiGrid />
                  최근 입고일
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">{formatDate(product.lastInDate)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiGrid />
                  최근 출고일
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">{formatDate(product.lastOutDate)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiUser />
                  처리 담당
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">{product.createdBy || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <FiAlertCircle />
                  상세 위치명
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">{product.locationName || '-'}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMovementMode('IN')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#68A95A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#68A95A]/20 transition hover:bg-[#588F4C]"
              >
                <FiArrowDownCircle />
                입고 처리
              </button>
              <button
                type="button"
                onClick={() => setMovementMode('OUT')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E26666] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E26666]/20 transition hover:bg-[#CF5555]"
              >
                <FiArrowUpCircle />
                출고 처리
              </button>
            </div>
          </article>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm mb-10">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">입출고 기록</h2>
                <p className="mt-1 text-sm text-slate-500">
                  최근 처리 내역을 확인하고 창고, 담당자, 비고를 함께 볼 수 있습니다.
                </p>
              </div>

              {isLogError && (
                <button
                  type="button"
                  onClick={() => refetchLogs()}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  로그 다시 불러오기
                </button>
              )}
            </div>
          </div>

          {isLogLoading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              입출고 기록을 불러오는 중입니다...
            </div>
          ) : isLogError ? (
            <div className="px-6 py-12 text-center">
              <p className="font-semibold text-slate-900">입출고 기록을 불러오지 못했습니다.</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-semibold text-slate-900">아직 등록된 입출고 기록이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold">날짜</th>
                      <th className="px-6 py-4 font-semibold">타입</th>
                      <th className="px-6 py-4 font-semibold">수량</th>
                      <th className="px-6 py-4 font-semibold">창고</th>
                      <th className="px-6 py-4 font-semibold">처리자</th>
                      <th className="px-6 py-4 font-semibold">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-6 py-4">{formatDate(log.date)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold text-white ${
                              log.type === 'IN' ? 'bg-[#316AC5]' : 'bg-[#E26666]'
                            }`}
                          >
                            {log.type === 'IN' ? '입고' : '출고'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {getSignedQuantity(log.type, log.quantity)}
                        </td>
                        <td className="px-6 py-4">{log.warehouse}</td>
                        <td className="px-6 py-4">{log.manager}</td>
                        <td className="px-6 py-4 text-slate-500">{log.note || '-'}</td>
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
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{formatDate(log.date)}</p>
                        <p className="mt-1 text-xs text-slate-500">{log.locationName}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold text-white ${
                          log.type === 'IN' ? 'bg-[#316AC5]' : 'bg-[#E26666]'
                        }`}
                      >
                        {log.type === 'IN' ? '입고' : '출고'}
                      </span>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">수량</dt>
                        <dd className="mt-1 font-semibold text-slate-700">
                          {getSignedQuantity(log.type, log.quantity)}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">창고</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{log.warehouse}</dd>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">처리자</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{log.manager}</dd>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">위치</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{log.locationCode}</dd>
                      </div>
                      <div className="col-span-2 rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">비고</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{log.note || '-'}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>

              {!!pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-5">
                  {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setLogPage(page)}
                      className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                        logPage === page
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <StockMovementModal
        mode={movementMode ?? 'IN'}
        isOpen={movementMode !== null}
        isSubmitting={isSubmitting}
        productName={product.name}
        initialWarehouseId={product.warehouseId}
        initialLocationCode={product.locationCode}
        warehouses={warehouses}
        onClose={() => setMovementMode(null)}
        onSubmit={handleMovementSubmit}
      />
    </>
  );
};

export default DetailProductPage;

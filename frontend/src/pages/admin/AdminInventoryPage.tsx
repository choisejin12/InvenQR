import { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiFilter, FiPackage, FiRefreshCcw } from 'react-icons/fi';
import { useCategories } from '../../hooks/useCategories';
import { useInventoryLogs } from '../../hooks/useInventoryLogs';
import { useWarehouses } from '../../hooks/useWarehouses';

type InventoryFilter = 'ALL' | 'IN' | 'OUT';

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

const getSignedQuantity = (type: 'IN' | 'OUT', quantity: number) =>
  `${type === 'IN' ? '+' : '-'}${quantity}`;

const getTypeBadgeClassName = (type: 'IN' | 'OUT') =>
  type === 'IN'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
    : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100';

const AdminInventoryPage = () => {
  // 관리자 필터는 API와 직접 연결합니다.
  // 값이 바뀌면 React Query가 새 조건으로 자동 재조회합니다.
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<InventoryFilter>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const { data: warehouses = [] } = useWarehouses(true);
  const { data: categories = [] } = useCategories(true);
  const { data, isLoading, isError, refetch, isFetching } = useInventoryLogs({
    warehouseId: warehouseFilter === 'ALL' ? undefined : Number(warehouseFilter),
    categoryId: categoryFilter === 'ALL' ? undefined : Number(categoryFilter),
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 12,
  });

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  // 필터가 바뀌면 항상 1페이지부터 다시 보는 편이 UX가 자연스럽습니다.
  useEffect(() => {
    setPage(1);
  }, [warehouseFilter, categoryFilter, typeFilter, startDate, endDate]);

  const summary = useMemo(
    () => ({
      total: pagination?.total ?? 0,
      inCount: logs.filter((log) => log.type === 'IN').length,
      outCount: logs.filter((log) => log.type === 'OUT').length,
    }),
    [logs, pagination?.total],
  );

  const handleResetFilters = () => {
    setWarehouseFilter('ALL');
    setCategoryFilter('ALL');
    setTypeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8">
        <p className="text-sm font-medium text-blue-100">관리자 · 입출고 기록 조회</p>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">입출고 기록을 한눈에 관리하세요</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
          날짜, 창고, 카테고리, 입출고 타입으로 기록을 좁혀 보면서 어떤 제품이 언제 어떻게
          이동했는지 빠르게 확인할 수 있습니다.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Total Logs</p>
            <p className="mt-3 text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Current In</p>
            <p className="mt-3 text-2xl font-bold">{summary.inCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Current Out</p>
            <p className="mt-3 text-2xl font-bold">{summary.outCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <FiFilter />
              관리자 필터
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">조건별 입출고 기록 조회</h2>
            <p className="mt-1 text-sm text-slate-500">
              창고와 카테고리, 타입, 날짜 범위를 조합해서 필요한 기록만 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              필터 초기화
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FiRefreshCcw className={isFetching ? 'animate-spin' : ''} />
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">창고</span>
            <select
              value={warehouseFilter}
              onChange={(event) => setWarehouseFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">전체 창고</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">전체 카테고리</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">타입</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as InventoryFilter)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">전체 타입</option>
              <option value="IN">입고</option>
              <option value="OUT">출고</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">시작 날짜</span>
            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">종료 날짜</span>
            <div className="relative">
              <FiCalendar className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">입출고 기록</h2>
          <p className="mt-1 text-sm text-slate-500">
            날짜 / 창고 / 제품 / 타입 / 수량 / 담당자 / 비고를 한 번에 확인할 수 있습니다.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center px-6 py-12 text-sm text-slate-500">
            입출고 기록을 불러오는 중입니다...
          </div>
        ) : isError ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="rounded-full bg-rose-50 p-4 text-rose-500">
              <FiPackage size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">입출고 기록을 불러오지 못했습니다.</p>
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
              <FiPackage size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">조건에 맞는 입출고 기록이 없습니다.</p>
              <p className="mt-1 text-sm text-slate-500">필터 조건을 조금 넓혀서 다시 확인해보세요.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">날짜</th>
                    <th className="px-6 py-4 font-semibold">창고</th>
                    <th className="px-6 py-4 font-semibold">제품명(코드)</th>
                    <th className="px-6 py-4 font-semibold">타입</th>
                    <th className="px-6 py-4 font-semibold">수량</th>
                    <th className="px-6 py-4 font-semibold">담당자</th>
                    <th className="px-6 py-4 font-semibold">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-slate-100 text-sm text-slate-700">
                      <td className="px-6 py-4">{formatDateTime(log.date)}</td>
                      <td className="px-6 py-4">{log.warehouse}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#2F6FBB]">{log.productName}</p>
                        <p className="mt-1 text-slate-500">{log.productCode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeBadgeClassName(log.type)}`}
                        >
                          {log.type === 'IN' ? '입고' : '출고'}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-base font-bold ${
                          log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {getSignedQuantity(log.type, log.quantity)}
                      </td>
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{formatDateTime(log.date)}</p>
                      <h3 className="mt-2 text-xl font-bold text-[#2F6FBB]">{log.productName}</h3>
                      <p className="mt-1 text-sm text-slate-500">{log.productCode}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeBadgeClassName(log.type)}`}
                    >
                      {log.type === 'IN' ? '입고' : '출고'}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">창고</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.warehouse}</dd>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">담당자</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.manager}</dd>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">위치</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.locationCode}</dd>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">수량</dt>
                      <dd
                        className={`mt-1 font-bold ${
                          log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {getSignedQuantity(log.type, log.quantity)}
                      </dd>
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
                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                        page === pageNumber
                          ? 'bg-[#2F6FBB] text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminInventoryPage;

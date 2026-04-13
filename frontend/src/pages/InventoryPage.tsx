import { useMemo, useState } from 'react';
import { FiFilter, FiPackage, FiRefreshCcw, FiSearch } from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories';
import { useInventoryLogs } from '../hooks/useInventoryLogs';
import { useWarehouses } from '../hooks/useWarehouses';
import type { InventoryLogItem } from '../types/inventory.type';

type InventoryFilter = 'ALL' | 'IN' | 'OUT';

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

const getTypeBadgeClassName = (type: 'IN' | 'OUT') =>
  type === 'IN' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-600';

const getFilteredLogs = (logs: InventoryLogItem[], keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return logs;
  }

  return logs.filter((log) => {
    return (
      log.productCode.toLowerCase().includes(normalizedKeyword) ||
      log.productName.toLowerCase().includes(normalizedKeyword) ||
      log.locationCode.toLowerCase().includes(normalizedKeyword) ||
      log.locationName.toLowerCase().includes(normalizedKeyword) ||
      log.warehouse.toLowerCase().includes(normalizedKeyword) ||
      log.manager.toLowerCase().includes(normalizedKeyword) ||
      (log.note ?? '').toLowerCase().includes(normalizedKeyword)
    );
  });
};

const InventoryPage = () => {
  // 필터 UI 상태입니다. 카테고리/창고/입출고 타입을 바꾸면 API 재조회가 일어납니다.
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<InventoryFilter>('ALL');

  const { data: categories = [] } = useCategories(true);
  const { data: warehouses = [] } = useWarehouses(true);
  const { data, isLoading, isError, refetch, isFetching } = useInventoryLogs({
    categoryId: categoryFilter === 'ALL' ? undefined : Number(categoryFilter),
    warehouseId: warehouseFilter === 'ALL' ? undefined : Number(warehouseFilter),
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    page: 1,
    limit: 1000,
  });

  const logs = data?.data ?? [];

  // 검색창은 입력할 때마다 프론트에서 빠르게 필터링해서 UX를 부드럽게 만듭니다.
  const filteredLogs = useMemo(() => getFilteredLogs(logs, keyword), [logs, keyword]);

  const summary = useMemo(() => {
    return {
      total: filteredLogs.length,
      inCount: filteredLogs.filter((log) => log.type === 'IN').length,
      outCount: filteredLogs.filter((log) => log.type === 'OUT').length,
    };
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8">
        <p className="text-sm font-medium text-blue-100">상품 관리 · 입출고 기록</p>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">입출고 기록을 한눈에 확인하세요</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
          카테고리, 창고, 입출고 상태별로 기록을 빠르게 필터링하고 필요한 기록을 바로 찾을 수
          있습니다.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Total Logs</p>
            <p className="mt-3 text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Stock In</p>
            <p className="mt-3 text-2xl font-bold">{summary.inCount}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-100">Stock Out</p>
            <p className="mt-3 text-2xl font-bold">{summary.outCount}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <FiFilter />
              입출고 필터
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">조건별 기록 조회</h2>
            <p className="mt-1 text-sm text-slate-500">
              카테고리, 창고, 입출고 타입, 검색어로 기록을 빠르게 좁혀볼 수 있습니다.
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

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">검색</span>
            <FiSearch className="pointer-events-none absolute left-4 top-[46px] text-slate-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="상품코드, 상품명, 위치, 비고 검색"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">전체</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">창고</span>
            <select
              value={warehouseFilter}
              onChange={(event) => setWarehouseFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">전체</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">입출고 상태</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as InventoryFilter)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">전체</option>
              <option value="IN">입고</option>
              <option value="OUT">출고</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">입출고 기록</h2>
          <p className="mt-1 text-sm text-slate-500">
            현재 조건에 맞는 기록 {filteredLogs.length}건
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
        ) : filteredLogs.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="rounded-full bg-slate-100 p-4 text-slate-500">
              <FiPackage size={24} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">조건에 맞는 입출고 기록이 없습니다.</p>
              <p className="mt-1 text-sm text-slate-500">필터나 검색어를 다시 조정해보세요.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">상품코드</th>
                    <th className="px-6 py-4 font-semibold">상품명</th>
                    <th className="px-6 py-4 font-semibold">입출고</th>
                    <th className="px-6 py-4 font-semibold">수량</th>
                    <th className="px-6 py-4 font-semibold">위치</th>
                    <th className="px-6 py-4 font-semibold">입출고일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t border-slate-100 text-sm text-slate-700">
                      <td className="px-6 py-4 font-semibold text-slate-900">{log.productCode}</td>
                      <td className="px-6 py-4">{log.productName}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeBadgeClassName(log.type)}`}
                        >
                          {log.type === 'IN' ? '입고' : '출고'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{log.quantity}</td>
                      <td className="px-6 py-4">{log.locationCode}</td>
                      <td className="px-6 py-4">{formatDate(log.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 sm:p-6 lg:hidden">
              {filteredLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                        {log.productCode}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{log.productName}</h3>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeBadgeClassName(log.type)}`}
                    >
                      {log.type === 'IN' ? '입고' : '출고'}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">수량</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.quantity}</dd>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">위치</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.locationCode}</dd>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">창고</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.warehouse}</dd>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">처리일</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{formatDate(log.date)}</dd>
                    </div>
                    <div className="col-span-2 rounded-xl bg-white px-3 py-3">
                      <dt className="text-xs text-slate-400">비고</dt>
                      <dd className="mt-1 font-semibold text-slate-700">{log.note || '-'}</dd>
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

export default InventoryPage;

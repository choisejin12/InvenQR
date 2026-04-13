import { useMemo, useState } from 'react';
import { FiFilter, FiPackage, FiPlus, FiRefreshCcw, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ProductRequestModal from '../components/product/ProductRequestModal';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useWarehouses } from '../hooks/useWarehouses';
import type { CategoryItem } from '../types/category.type';
import type { ProductItem } from '../types/product.type';

type StockFilter = 'ALL' | 'IN_STOCK' | 'EMPTY';

//날짜 포맷
const formatDate = (value: string | null) => {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
};

//카테고리 선택
const getCategoryOptions = (categories: CategoryItem[]) => {
  return categories
    .map((category) => ({ value: category.id, label: category.name })) //select 옵션 형태로 구조 변환
    .sort((a, b) => a.label.localeCompare(b.label, 'ko')); //한국어 기준 정렬
};

//창고 선택 
const getLocationOptions = (products: ProductItem[]) => {
  const map = new Map<string, string>();

  products.forEach((product) => {
    if (product.warehouseName) {
      map.set(product.warehouseName, product.warehouseName); //창고 중복제거
    }
  });

  return Array.from(map.entries()) //배열로 변환
    .map(([value, label]) => ({ value, label })) //select 옵션 형태로 구조 변환
    .sort((a, b) => a.label.localeCompare(b.label, 'ko')); //한국어 기준 정렬
};

const ProductPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<StockFilter>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useProducts({
    page: 1,
    limit: 1000,
  });
  const {
    data: warehouses = [],
    isError: isWarehouseError,
  } = useWarehouses(isModalOpen);
  const { data: categories = [], isError: isCategoryError } = useCategories(true);

  const products = data?.data ?? [];

  const summary = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockCount = products.filter((product) => product.quantity > 0 && product.quantity <= 10).length;

    return {
      totalProducts,
      totalStock,
      lowStockCount,
    };
  }, [products]);

  const categoryOptions = useMemo(() => getCategoryOptions(categories), [categories]);
  const locationOptions = useMemo(() => getLocationOptions(products), [products]);

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
  
    return products.filter((product) => {
     const matchesKeyword =
        !normalizedKeyword ||
        product.productCode.toLowerCase().includes(normalizedKeyword) ||
        product.name.toLowerCase().includes(normalizedKeyword) ||
        (product.description ?? '').toLowerCase().includes(normalizedKeyword) ||
        (product.warehouseName ?? '').toLowerCase().includes(normalizedKeyword);

      const matchesCategory =
        categoryFilter === 'ALL' ||
        String(product.categoryId ?? '') === categoryFilter ||
        product.categoryName === categoryFilter;

      const matchesLocation =
        locationFilter === 'ALL' || (product.warehouseName ?? '') === locationFilter;

        

      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'IN_STOCK' && product.quantity > 0) ||
        (stockFilter === 'EMPTY' && product.quantity === 0);

      return matchesKeyword && matchesCategory && matchesLocation && matchesStock;
    });
   
  }, [categoryFilter, keyword, locationFilter, products, stockFilter]);

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] lg:items-end">
            <div>
              <p className="text-sm font-medium text-emerald-100">상품 관리 · 전체 상품</p>
              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">오프라인 자산을 온라인 재고로 관리하세요</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100/85 sm:text-base">
                승인 완료된 전체 상품을 한 번에 확인하고, 필터링과 상품 등록 요청을 빠르게 처리할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 z-0">
              <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Total Product</p>
                <p className="mt-3 text-2xl font-bold">{summary.totalProducts}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Total Stock</p>
                <p className="mt-3 text-2xl font-bold">{summary.totalStock}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Low Stock</p>
                <p className="mt-3 text-2xl font-bold">{summary.lowStockCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <FiFilter />
                재고 필터
              </div>
              <h2 className="mt-3 text-xl font-bold text-slate-900">조건별 상품 조회</h2>
              <p className="mt-1 text-sm text-slate-500">
                검색어, 카테고리, 위치, 재고 상태로 빠르게 상품을 찾을 수 있습니다.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <FiPlus />
                상품 등록
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FiRefreshCcw className={isFetching ? 'animate-spin' : ''} />
                새로고침
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">검색</span>
              <FiSearch className="pointer-events-none absolute left-4 top-[46px] text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="상품코드, 상품명, 설명, 위치 검색"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">카테고리</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="ALL">전체</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">창고</span>
              <select
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="ALL">전체</option>
                {locationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">재고 상태</span>
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value as StockFilter)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="ALL">전체</option>
                <option value="IN_STOCK">재고 있음</option>
                <option value="EMPTY">품절</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm mb-8">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">전체 상품 리스트</h2>
              <p className="mt-1 text-sm text-slate-500">현재 조건에 맞는 상품 {filteredProducts.length}개</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center px-6 py-12 text-sm text-slate-500">
              상품 목록을 불러오는 중입니다...
            </div>
          ) : isError ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="rounded-full bg-rose-50 p-4 text-rose-500">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">상품 목록을 불러오지 못했습니다.</p>
                <p className="mt-1 text-sm text-slate-500">API 연결 상태와 로그인 권한을 확인해주세요.</p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                다시 시도
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-500">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">조건에 맞는 상품이 없습니다.</p>
                <p className="mt-1 text-sm text-slate-500">필터를 조정하거나 새 상품 등록 요청을 진행해보세요.</p>
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
                      <th className="px-6 py-4 font-semibold">설명</th>
                      <th className="px-6 py-4 font-semibold">수량</th>
                      <th className="px-6 py-4 font-semibold">위치</th>
                      <th className="px-6 py-4 font-semibold">최근입고일</th>
                      <th className="px-6 py-4 font-semibold">최근출고일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="cursor-pointer border-t border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-900">{product.productCode}</td>
                        <td className="px-6 py-4">{product.name}</td>
                        <td className="px-6 py-4 text-slate-500">{product.description || '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              product.quantity > 10
                                ? 'bg-emerald-50 text-emerald-700'
                                : product.quantity > 0
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">{product.locationName || '-'}</td>
                        <td className="px-6 py-4">{formatDate(product.lastInDate)}</td>
                        <td className="px-6 py-4">{formatDate(product.lastOutDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 sm:p-6 lg:hidden">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          {product.productCode}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{product.name}</h3>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          product.quantity > 10
                            ? 'bg-emerald-50 text-emerald-700'
                            : product.quantity > 0
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {product.quantity}개
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">{product.description || '설명 없음'}</p>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">위치</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{product.locationName || '-'}</dd>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">등록자</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{product.createdBy || '-'}</dd>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">최근입고일</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{formatDate(product.lastInDate)}</dd>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">최근출고일</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{formatDate(product.lastOutDate)}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <ProductRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        categoryLoadFailed={isCategoryError}
        warehouses={warehouses}
        warehouseLoadFailed={isWarehouseError}
      />
    </>
  );
};

export default ProductPage;

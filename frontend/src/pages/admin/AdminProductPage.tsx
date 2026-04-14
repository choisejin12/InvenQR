import { useMemo, useState } from 'react';
import { FiEdit2, FiPackage, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AdminProductFormModal from '../../components/admin/AdminProductFormModal';
import { useCategories } from '../../hooks/useCategories';
import { useCreateProduct } from '../../hooks/useCreateProduct';
import { useDeleteProduct } from '../../hooks/useDeleteProduct';
import { useProducts } from '../../hooks/useProducts';
import { useUpdateProduct } from '../../hooks/useUpdateProduct';
import { useWarehouses } from '../../hooks/useWarehouses';
import type {
  CreateProductPayload,
  ProductItem,
  UpdateProductPayload,
} from '../../types/product.type';

const AdminProductPage = () => {
  // 검색어는 상단 입력창과 연결되어 바로 필터링
  const [keyword, setKeyword] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useProducts({
    page: 1,
    limit: 1000,
  });
  const { data: categories = [] } = useCategories(true);
  const { data: warehouses = [] } = useWarehouses(true);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = data?.data ?? [];

  // 검색은 상품명, 상품코드, 위치, 등록자 기준으로 한 번에 필터링
  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedKeyword) ||
        product.productCode.toLowerCase().includes(normalizedKeyword) ||
        (product.locationName ?? '').toLowerCase().includes(normalizedKeyword) ||
        (product.createdBy ?? '').toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [keyword, products]);

  const handleCreate = async (payload: CreateProductPayload | UpdateProductPayload) => {
    try {
      await createProduct.mutateAsync(payload as CreateProductPayload);
      toast.success('상품이 추가되었습니다.');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '상품 추가에 실패했습니다.');
    }
  };

  const handleUpdate = async (payload: CreateProductPayload | UpdateProductPayload) => {
    try {
      await updateProduct.mutateAsync(payload as UpdateProductPayload);
      toast.success('상품이 수정되었습니다.');
      setEditingProduct(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '상품 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (product: ProductItem) => {
    const confirmed = window.confirm(`${product.name} 상품을 삭제하시겠습니까?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('상품이 삭제되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '상품 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8">
          <p className="text-sm font-medium text-blue-100">관리자 · 전체 제품 관리</p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">전체 제품을 조회하고 관리하세요</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
            관리자는 등록 요청 없이 바로 상품을 추가할 수 있고, 제품 정보 수정과 삭제도 한
            화면에서 처리할 수 있습니다.
          </p>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="상품명 검색"
              />
            </label>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#435D88] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#435D88]/20 transition hover:bg-[#364E76]"
            >
              <FiPlus />
              상품 추가
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
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
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-500">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">조회된 상품이 없습니다.</p>
                <p className="mt-1 text-sm text-slate-500">검색어를 바꾸거나 상품을 추가해보세요.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold">상품명</th>
                      <th className="px-6 py-4 font-semibold">상품코드</th>
                      <th className="px-6 py-4 font-semibold">창고 및 위치</th>
                      <th className="px-6 py-4 font-semibold">재고</th>
                      <th className="px-6 py-4 font-semibold">등록자</th>
                      <th className="px-6 py-4 font-semibold">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="cursor-pointer border-t border-slate-100 text-sm text-slate-700" >
                        <td className="px-6 py-4 font-semibold text-[#2F6FBB]">{product.name}</td>
                        <td className="px-6 py-4">{product.productCode}</td>
                        <td className="px-6 py-4">{product.locationName || '-'}</td>
                        <td className="px-6 py-4">{product.quantity}개</td>
                        <td className="px-6 py-4">{product.createdBy || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(product)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                              <FiEdit2 size={14} />
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#D76060] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#C14D4D]"
                            >
                              <FiTrash2 size={14} />
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 sm:p-6 lg:hidden">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#2F6FBB]">{product.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{product.productCode}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{product.quantity}개</p>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <p>{product.locationName || '-'}</p>
                      <p>{product.createdBy || '-'}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(product)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        <FiEdit2 size={14} />
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#D76060] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#C14D4D]"
                      >
                        <FiTrash2 size={14} />
                        삭제
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <AdminProductFormModal
        isOpen={isCreateModalOpen}
        isSubmitting={createProduct.isPending}
        mode="create"
        product={null}
        categories={categories}
        warehouses={warehouses}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />

      <AdminProductFormModal
        isOpen={!!editingProduct}
        isSubmitting={updateProduct.isPending}
        mode="edit"
        product={editingProduct}
        categories={categories}
        warehouses={warehouses}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleUpdate}
      />
    </>
  );
};

export default AdminProductPage;

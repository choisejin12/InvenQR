import { useMemo, useState, type ReactNode } from 'react';
import { FiArchive, FiBox, FiDownload, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import WarehouseFormModal from '../../components/admin/WarehouseFormModal';
import { useCreateWarehouse } from '../../hooks/useCreateWarehouse';
import { useDeleteWarehouse } from '../../hooks/useDeleteWarehouse';
import { useUpdateWarehouse } from '../../hooks/useUpdateWarehouse';
import { useWarehouses } from '../../hooks/useWarehouses';
import type { WarehouseItem } from '../../types/warehouse.type';

type ShortcutCard = {
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
};

const shortcutCards: ShortcutCard[] = [
  {
    title: '전체 제품 관리',
    description: '모든 상품 목록 및 재고관리',
    path: '/admin/product',
    icon: <FiBox size={30} />,
  },
  {
    title: '입출고 기록 조회',
    description: '입출고 내역 확인',
    path: '/admin/inventorylog',
    icon: <FiArchive size={30} />,
  },
  {
    title: 'CSV 다운로드',
    description: '상품 데이터 파일 다운로드',
    path: '/csv',
    icon: <FiDownload size={30} />,
  },
  {
    title: '창고정보 관리',
    description: '창고 정보 추가 / 수정 / 삭제',
    path: '/admin',
    icon: <FiArchive size={30} />,
  },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { data: warehouses = [], isLoading, isError, refetch } = useWarehouses(true);
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null);

  const isSubmitting =
    createWarehouse.isPending || updateWarehouse.isPending || deleteWarehouse.isPending;

  const totalStoredProducts = useMemo(
    () => warehouses.reduce((sum, warehouse) => sum + warehouse.totalProducts, 0),
    [warehouses],
  );

  const openCreateModal = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (warehouse: WarehouseItem) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleSubmitWarehouse = async (values: { name: string; code: string }) => {
    try {
      if (editingWarehouse) {
        await updateWarehouse.mutateAsync({
          id: editingWarehouse.id,
          name: values.name.trim(),
          code: values.code.trim(),
        });
        toast.success('창고 정보가 수정되었습니다.');
      } else {
        await createWarehouse.mutateAsync({
          name: values.name.trim(),
          code: values.code.trim(),
        });
        toast.success('창고가 추가되었습니다.');
      }

      closeModal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '창고 저장 중 문제가 발생했습니다.');
    }
  };

  const handleDeleteWarehouse = async (warehouse: WarehouseItem) => {
    const confirmed = window.confirm(
      `${warehouse.name} 창고를 삭제하시겠습니까?\n보유 상품 또는 등록 요청이 있으면 삭제할 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWarehouse.mutateAsync(warehouse.id);
      toast.success('창고가 삭제되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '창고 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 px-6 py-7 text-white shadow-xl sm:px-8">
          <p className="text-sm font-medium text-blue-100">ADMIN</p>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">창고 정보와 관리 메뉴를 한 화면에서 확인하세요</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100/85 sm:text-base">
            관리자 전용 화면에서 상품 관리, 입출고 기록, CSV 다운로드, 창고 정보 관리로 빠르게 이동할 수 있습니다.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Warehouse</p>
              <p className="mt-3 text-2xl font-bold">{warehouses.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Stored Product</p>
              <p className="mt-3 text-2xl font-bold">{totalStoredProducts}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Locations</p>
              <p className="mt-3 text-2xl font-bold">
                {warehouses.reduce((sum, warehouse) => sum + warehouse.locations.length, 0)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {shortcutCards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => navigate(card.path)}
              className="group rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-4 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  {card.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{card.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                </div>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">창고 목록</h2>
              <p className="mt-1 text-sm text-slate-500">현재 등록된 창고 정보와 보유 상품 수를 확인할 수 있습니다.</p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              <FiPlus />
              창고 추가
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center px-6 py-12 text-sm text-slate-500">
              창고 목록을 불러오는 중입니다...
            </div>
          ) : isError ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <p className="font-semibold text-slate-900">창고 목록을 불러오지 못했습니다.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                다시 시도
              </button>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <p className="font-semibold text-slate-900">등록된 창고가 아직 없습니다.</p>
              <p className="text-sm text-slate-500">창고 추가 버튼으로 첫 창고를 등록해보세요.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold">창고명</th>
                      <th className="px-6 py-4 font-semibold">위치</th>
                      <th className="px-6 py-4 font-semibold">보유 상품</th>
                      <th className="px-6 py-4 font-semibold">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map((warehouse) => (
                      <tr key={warehouse.id} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-blue-700">{warehouse.name}</td>
                        <td className="px-6 py-4">{warehouse.code}</td>
                        <td className="px-6 py-4">{warehouse.totalProducts} 품목</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(warehouse)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <FiEdit2 size={14} />
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWarehouse(warehouse)}
                              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
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
                {warehouses.map((warehouse) => (
                  <article
                    key={warehouse.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Warehouse</p>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{warehouse.name}</h3>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {warehouse.totalProducts} 품목
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm">
                      <div className="rounded-xl bg-white px-3 py-3">
                        <dt className="text-xs text-slate-400">위치</dt>
                        <dd className="mt-1 font-semibold text-slate-700">{warehouse.code}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(warehouse)}
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWarehouse(warehouse)}
                        className="flex-1 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
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

      <WarehouseFormModal
        isOpen={isModalOpen}
        mode={editingWarehouse ? 'edit' : 'create'}
        initialWarehouse={editingWarehouse}
        isSubmitting={createWarehouse.isPending || updateWarehouse.isPending}
        onClose={closeModal}
        onSubmit={handleSubmitWarehouse}
      />
    </>
  );
};

export default AdminPage;

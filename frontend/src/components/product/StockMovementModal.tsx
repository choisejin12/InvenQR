import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiCalendar, FiMapPin, FiX } from 'react-icons/fi';
import type { WarehouseItem } from '../../types/warehouse.type';

type StockMovementMode = 'IN' | 'OUT';

type StockMovementFormValues = {
  quantity: number;
  warehouseId: number;
  locationCode: string;
  processedAt: string;
  note: string;
};

type StockMovementModalProps = {
  mode: StockMovementMode;
  isOpen: boolean;
  isSubmitting: boolean;
  productName: string;
  initialWarehouseId?: number | null;
  initialLocationCode?: string | null;
  warehouses: WarehouseItem[];
  onClose: () => void;
  onSubmit: (values: StockMovementFormValues) => Promise<void>;
};

const getToday = () => new Date().toISOString().slice(0, 10);

const StockMovementModal = ({
  mode,
  isOpen,
  isSubmitting,
  productName,
  initialWarehouseId,
  initialLocationCode,
  warehouses,
  onClose,
  onSubmit,
}: StockMovementModalProps) => {
  const isStockIn = mode === 'IN';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockMovementFormValues>({
    defaultValues: {
      quantity: 1,
      warehouseId: initialWarehouseId ?? undefined,
      locationCode: initialLocationCode ?? '',
      processedAt: getToday(),
      note: '',
    },
  });

  // 모달이 열릴 때마다 현재 상품 정보 기준으로 기본값을 다시 세팅합니다.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset({
      quantity: 1,
      warehouseId: initialWarehouseId ?? undefined,
      locationCode: initialLocationCode ?? '',
      processedAt: getToday(),
      note: '',
    });
  }, [initialLocationCode, initialWarehouseId, isOpen, reset]);

  // 모달이 열려 있는 동안 배경 스크롤과 ESC 닫기를 제어합니다.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isStockIn ? '입고 등록' : '출고 등록'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{productName}의 수량 이동을 기록합니다.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed"
            aria-label="모달 닫기"
          >
            <FiX size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[calc(90vh-88px)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6"
        >
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                수량 <span className="text-rose-500">*</span>
              </span>
              <input
                type="number"
                {...register('quantity', {
                  required: '수량을 입력해주세요.',
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: '수량은 1개 이상이어야 합니다.',
                  },
                })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="예: 5"
              />
              {errors.quantity && (
                <p className="mt-2 text-xs text-rose-500">{errors.quantity.message}</p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                {isStockIn ? '입고처' : '출고처'} <span className="text-rose-500">*</span>
              </span>
              <div className="relative">
                <FiMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  {...register('warehouseId', {
                    required: '창고를 선택해주세요.',
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">창고 선택</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.warehouseId && (
                <p className="mt-2 text-xs text-rose-500">{errors.warehouseId.message}</p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                위치 <span className="text-rose-500">*</span>
              </span>
              <input
                {...register('locationCode', {
                  required: '위치를 입력해주세요.',
                })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="예: J102"
              />
              {errors.locationCode && (
                <p className="mt-2 text-xs text-rose-500">{errors.locationCode.message}</p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                {isStockIn ? '입고날짜' : '출고날짜'} <span className="text-rose-500">*</span>
              </span>
              <div className="relative">
                <FiCalendar className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  {...register('processedAt', {
                    required: '처리 날짜를 입력해주세요.',
                  })}
                  className="w-full rounded-xl border border-slate-200 px-11 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              {errors.processedAt && (
                <p className="mt-2 text-xs text-rose-500">{errors.processedAt.message}</p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">비고</span>
              <textarea
                {...register('note')}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                placeholder="예: 거래처 요청으로 긴급 출고"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-9 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-xl px-9 py-3 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed ${
                isStockIn
                  ? 'bg-[#4D8B43] shadow-[#4D8B43]/20 hover:bg-[#3E7235] disabled:bg-[#A9C7A3]'
                  : 'bg-[#E26666] shadow-[#E26666]/20 hover:bg-[#CF5555] disabled:bg-[#F0ADAD]'
              }`}
            >
              {isSubmitting ? '처리 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import type { WarehouseItem } from '../../types/warehouse.type';

type WarehouseFormValues = {
  name: string;
  code: string;
};

type WarehouseFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialWarehouse?: WarehouseItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: WarehouseFormValues) => void;
};

const WarehouseFormModal = ({
  isOpen,
  mode,
  initialWarehouse,
  isSubmitting,
  onClose,
  onSubmit,
}: WarehouseFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    defaultValues: {
      name: '',
      code: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 모달이 열릴 때마다 수정 대상 값 또는 빈 값을 폼에 다시 넣기
    reset({
      name: initialWarehouse?.name ?? '',
      code: initialWarehouse?.code ?? '',
    });
  }, [initialWarehouse, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'create' ? '창고 추가' : '창고 정보 수정'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              창고명과 위치 코드를 입력하면 바로 목록에 반영됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="창고 모달 닫기"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">창고명</span>
            <input
              {...register('name', { required: '창고명을 입력해주세요.' })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="예: 서울 1창고"
            />
            {errors.name && <p className="mt-2 text-xs text-rose-500">{errors.name.message}</p>}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">위치</span>
            <input
              {...register('code', { required: '위치 코드를 입력해주세요.' })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="예: 서울시 강남구"
            />
            {errors.code && <p className="mt-2 text-xs text-rose-500">{errors.code.message}</p>}
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? '저장 중...' : mode === 'create' ? '창고 추가' : '수정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseFormModal;

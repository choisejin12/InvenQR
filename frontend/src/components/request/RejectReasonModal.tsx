import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX } from 'react-icons/fi';

type RejectReasonFormValues = {
  reason: string;
};

type RejectReasonModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: RejectReasonFormValues) => void;
};

const RejectReasonModal = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: RejectReasonModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectReasonFormValues>({
    defaultValues: {
      reason: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 모달이 열릴 때마다 이전 입력값을 지워서 새 거절 사유를 깔끔하게 입력하게 
    reset({ reason: '' });
  }, [isOpen, reset]);

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
      <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">요청 거절</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="거절 사유 모달 닫기"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">거절 사유</span>
            <textarea
              {...register('reason', { required: '거절 사유를 입력해주세요.' })}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              placeholder="예: 동일 상품이 이미 등록되어 있습니다."
            />
            {errors.reason && <p className="mt-2 text-xs text-rose-500">{errors.reason.message}</p>}
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
            >
              {isSubmitting ? '거절 중...' : '거절'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectReasonModal;

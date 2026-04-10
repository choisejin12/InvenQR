import { useEffect, useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiImage, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCreateProductRequest } from '../../hooks/useCreateProductRequest';
import type { CategoryItem } from '../../types/category.type';
import type { WarehouseItem } from '../../types/warehouse.type';

type ProductRequestFormValues = {
  productCode: string;
  name: string;
  description: string;
  categoryId: number;
  warehouseId: number;
  locationCode: string;
  quantity: number;
};

type ProductRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  categoryLoadFailed: boolean;
  warehouses: WarehouseItem[];
  warehouseLoadFailed: boolean;
};

type SelectOption = {
  value: number;
  label: string;
};

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('이미지를 읽는 중 문제가 발생했습니다.'));
    reader.readAsDataURL(file);
  });

const buildCategoryOptions = (categories: CategoryItem[]): SelectOption[] =>
  categories
    .map((category) => ({ value: category.id, label: category.name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'));

const ProductRequestModal = ({
  isOpen,
  onClose,
  categories,
  categoryLoadFailed,
  warehouses,
  warehouseLoadFailed,
}: ProductRequestModalProps) => {
  const inputId = useId();
  const [previewImage, setPreviewImage] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const createProductRequest = useCreateProductRequest();

  const categoryOptions = useMemo(() => buildCategoryOptions(categories), [categories]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductRequestFormValues>({
    defaultValues: {
      productCode: '',
      name: '',
      description: '',
      categoryId: undefined,
      warehouseId: undefined,
      locationCode: '',
      quantity: 0,
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedWarehouseId = watch('warehouseId');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !createProductRequest.isPending) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [createProductRequest.isPending, isOpen, onClose]);

  const closeAndReset = () => {
    reset();
    setPreviewImage('');
    setImageDataUrl('');
    setImageFileName('');
    onClose();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      toast.error('이미지 파일은 5MB 이하만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setPreviewImage(base64);
      setImageDataUrl(base64);
      setImageFileName(file.name);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createProductRequest.mutateAsync({
        productCode: values.productCode.trim(),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        categoryId: Number(values.categoryId),
        warehouseId: Number(values.warehouseId),
        locationCode: values.locationCode.trim().toUpperCase(),
        quantity: Number(values.quantity),
        imageUrl: imageDataUrl || undefined,
      });

      toast.success('상품 등록 요청이 접수되었습니다.');
      closeAndReset();
    } catch {
      toast.error('상품 등록 요청 중 문제가 발생했습니다.');
    }
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">상품 등록 요청</h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              등록 요청은 관리자 승인 후 상품 목록에 반영됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={closeAndReset}
            disabled={createProductRequest.isPending}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed"
            aria-label="모달 닫기"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="max-h-[calc(90vh-88px)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_300px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">상품코드</span>
                <input
                  {...register('productCode', { required: '상품코드를 입력해주세요.' })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="예: AL2313"
                />
                {errors.productCode && (
                  <p className="mt-2 text-xs text-rose-500">{errors.productCode.message}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">상품명</span>
                <input
                  {...register('name', { required: '상품명을 입력해주세요.' })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="예: 로지텍 무선마우스"
                />
                {errors.name && <p className="mt-2 text-xs text-rose-500">{errors.name.message}</p>}
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">설명</span>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="상품 특징, 규격, 용도를 입력하세요."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">카테고리</span>
                {categoryOptions.length > 0 ? (
                  <select
                    {...register('categoryId', {
                      required: '카테고리를 선택해주세요.',
                      valueAsNumber: true,
                    })}
                    value={selectedCategoryId ?? ''}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      카테고리 선택
                    </option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    {...register('categoryId', {
                      required: '카테고리 ID를 입력해주세요.',
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="카테고리 ID 입력"
                  />
                )}
                {errors.categoryId && (
                  <p className="mt-2 text-xs text-rose-500">{errors.categoryId.message}</p>
                )}
                {categoryLoadFailed && (
                  <p className="mt-2 text-xs text-amber-600">
                    카테고리 목록을 불러오지 못해 직접 ID 입력 모드가 표시될 수 있습니다.
                  </p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">창고</span>
                {warehouses.length > 0 ? (
                  <select
                    {...register('warehouseId', {
                      required: '창고를 선택해주세요.',
                      valueAsNumber: true,
                    })}
                    value={selectedWarehouseId ?? ''}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      창고 선택
                    </option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    {...register('warehouseId', {
                      required: '창고 ID를 입력해주세요.',
                      valueAsNumber: true,
                    })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="창고 ID 입력"
                  />
                )}
                {warehouseLoadFailed && (
                  <p className="mt-2 text-xs text-amber-600">
                    창고 목록을 불러오지 못해 직접 ID 입력 모드가 표시될 수 있습니다.
                  </p>
                )}
                {errors.warehouseId && (
                  <p className="mt-2 text-xs text-rose-500">{errors.warehouseId.message}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">위치</span>
                <input
                  {...register('locationCode', { required: '위치를 입력해주세요.' })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="예: G105"
                />
                {errors.locationCode && (
                  <p className="mt-2 text-xs text-rose-500">{errors.locationCode.message}</p>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">재고 수량</span>
                <input
                  type="number"
                  {...register('quantity', {
                    required: '재고 수량을 입력해주세요.',
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: '재고 수량은 0 이상이어야 합니다.',
                    },
                  })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="예: 27"
                />
                {errors.quantity && (
                  <p className="mt-2 text-xs text-rose-500">{errors.quantity.message}</p>
                )}
              </label>
            </div>

            <div className="space-y-3">
              <span className="block text-sm font-semibold text-slate-700">이미지</span>
              <label
                htmlFor={inputId}
                className="group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="상품 미리보기"
                    className="h-52 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <div className="rounded-full bg-white p-4 shadow-sm">
                      <FiImage size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">이미지 업로드</p>
                      <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP 파일 가능</p>
                    </div>
                  </div>
                )}
              </label>
              <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              <div className="rounded-2xl px-4 py-3 text-xs text-slate-600">
                {imageFileName ? `${imageFileName} 선택됨` : '등록 이미지가 없으면 빈 상태로 요청됩니다.'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeAndReset}
              disabled={createProductRequest.isPending}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={createProductRequest.isPending}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {createProductRequest.isPending ? '요청 중...' : '등록 요청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductRequestModal;

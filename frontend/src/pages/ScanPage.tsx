import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiCamera, FiCheckCircle, FiImage, FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProductByQRCode } from '../hooks/useProductByQRCode';

const ScanPage = () => {
  const navigate = useNavigate();
  const baseId = useId().replace(/:/g, '');
  const scannerId = `${baseId}-scanner`;
  const imageDecoderId = `${baseId}-image-decoder`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handledCodeRef = useRef<string>('');

  // 실제 스캐너는 버튼을 눌렀을 때만 모달에서 실행되도록 분리
  const [manualCode, setManualCode] = useState('');
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isManualPanelOpen, setIsManualPanelOpen] = useState(false);
  const [isScannerReady, setIsScannerReady] = useState(false);
  const [isStartingScanner, setIsStartingScanner] = useState(false);
  const [isDecodingImage, setIsDecodingImage] = useState(false);
  const productByQRCode = useProductByQRCode();

  const moveToProductDetail = async (rawCode: string) => {
    const qrCode = rawCode.trim();

    if (!qrCode || productByQRCode.isPending) {
      return;
    }

    try {
      const product = await productByQRCode.mutateAsync(qrCode);
      toast.success(`${product.name} 상품 상세로 이동합니다.`);
      setIsScannerModalOpen(false);
      setIsManualPanelOpen(false);
      navigate(`/product/${product.id}`);
    } catch (error) {
      handledCodeRef.current = '';
      toast.error(error instanceof Error ? error.message : '상품 정보를 찾지 못했습니다.');
    }
  };

  // 스캐너 모달이 열려 있을 때만 카메라를 실행
  useEffect(() => {
    if (!isScannerModalOpen) {
      return undefined;
    }

    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;
    let isMounted = true;

    const startScanner = async () => {
      try {
        setIsStartingScanner(true);

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          async (decodedText) => {
            if (handledCodeRef.current === decodedText) {
              return;
            }

            handledCodeRef.current = decodedText;
            await moveToProductDetail(decodedText);
          },
          () => {
          },
        );

        if (isMounted) {
          setIsScannerReady(true);
        }
      } catch {
        if (isMounted) {
          toast.info('카메라 권한이 없으면 아래의 직접 입력 기능을 이용해주세요.');
        }
      } finally {
        if (isMounted) {
          setIsStartingScanner(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      setIsScannerReady(false);
      handledCodeRef.current = '';

      const currentScanner = scannerRef.current;
      scannerRef.current = null;

      if (!currentScanner) {
        return;
      }

      if (currentScanner.isScanning) {
        currentScanner
          .stop()
          .catch(() => undefined)
          .finally(() => {
            currentScanner.clear();
          });
        return;
      }

      currentScanner.clear();
    };
  }, [isScannerModalOpen, scannerId]);

  const handleImageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      return;
    }

    // 이미지 해석은 카메라 모달과 별개의 숨김 DOM 노드를 사용
    const scanner = new Html5Qrcode(imageDecoderId);

    try {
      setIsDecodingImage(true);
      const decodedText = await scanner.scanFile(file, true);
      await moveToProductDetail(decodedText);
    } catch {
      toast.error('이미지에서 QR 코드를 찾지 못했습니다.');
    } finally {
      setIsDecodingImage(false);
      scanner.clear();
      event.target.value = '';
    }
  };

  return (
<>
  <div className="space-y-6">
    <section className="rounded-[28px] border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-7 sm:py-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-400">QR 스캔</p>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
          QR 스캔
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
          상품의 QR코드를 스캔하여 입출고 및 창고 정보를 빠르게 확인하세요.
        </p>
      </div>

      <div className="mt-6 sm:mt-8">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] bg-[#EEF2FF] w-full">
          <img
            src="/InvenQR Scan.png"
            alt="QR 스캔 안내 배경"
            className="hidden md:block h-[420px] w-full object-cover object-center  lg:h-[620px]"
          />
          <img
            src="/InvenQR Scan-m.png"
            alt="QR 스캔 안내 배경"
            className="md:hidden h-[420px] w-full object-cover object-center sm:h-[520px]"
          />
          
          <div className="absolute md:right-40 md:top-20 top-2 ml-3 md:ml-0 text-[11px] md:text-[14px]">
            <p className="font-semibold text-amber-600">💡TIP</p>
            <p>QR코드가 인식되지 않으면</p>
            <p>QR 문자열을 직접 입력해주세요.</p>
          </div>

          <div className="absolute right-9 bottom-4 md:right-20 md:bottom-50 space-y-3  sm:w-[280px] lg:w-[320px]">
            <button
              type="button"
              onClick={() => {
                setIsManualPanelOpen(false);
                setIsScannerModalOpen(true);
              }}
              className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-[#4B77D0] px-4 py-4 text-left text-white shadow-lg shadow-[#4B77D0]/20 transition hover:bg-[#3F68BA] sm:gap-4 sm:rounded-[20px] sm:px-5 sm:py-5"
            >
              <span className="rounded-2xl border border-white/30 p-2 sm:p-3">
                <FiCamera size={24} />
              </span>
              <span className="text-base font-bold sm:text-lg lg:text-xl backdrop-blur ">
                QR 스캔하기
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDecodingImage}
              className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-[#4B77D0] px-4 py-4 text-left text-white shadow-lg shadow-[#4B77D0]/20 transition hover:bg-[#3F68BA] disabled:cursor-not-allowed disabled:bg-[#8FA9E1] sm:gap-4 sm:rounded-[20px] sm:px-5 sm:py-5"
            >
              <span className="rounded-2xl border border-white/30 p-2 sm:p-3">
                <FiImage size={24} />
              </span>
              <span className="text-base font-bold sm:text-lg lg:text-xl">
                {isDecodingImage ? '이미지 분석 중...' : '이미지 파일 업로드'}
              </span>
            </button>

            <p
              className="pt-1 text-center text-xs text-white md:text-slate-500 cursor-pointer sm:text-sm"
              onClick={() => setIsManualPanelOpen((prev) => !prev)}
            >
              코드 직접 입력하기
            </p>
          </div>
        </div>
      </div>
    </section>

    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleImageFileUpload}
    />
    <div id={imageDecoderId} className="hidden" />

    {isManualPanelOpen && (
      <section className="rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <FiSearch size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              QR 코드 직접 입력
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              카메라 사용이 어렵다면 QR 문자열을 그대로 입력해서 상품 상세 페이지로
              이동할 수 있습니다.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await moveToProductDetail(manualCode);
          }}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              QR 문자열
            </span>
            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="예: QR-1712748210000"
            />
          </label>

          <button
            type="submit"
            disabled={productByQRCode.isPending}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {productByQRCode.isPending ? '조회 중...' : '상품 상세로 이동'}
          </button>
        </form>
      </section>
    )}
  </div>

  {isScannerModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] sm:rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-4 sm:px-7">
          <div className="pr-4">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              QR 스캔하기
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              카메라에 상품 QR 코드를 비추면 상세 페이지로 자동 이동합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsScannerModalOpen(false)}
            className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="모달 닫기"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-7">
          <div className="overflow-hidden rounded-[20px] sm:rounded-[24px] border border-slate-200 bg-slate-950 p-2 sm:p-3">
            <div
              id={scannerId}
              className="min-h-[260px] w-full overflow-hidden rounded-[16px] sm:rounded-[18px] bg-black sm:min-h-[380px]"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${
                isScannerReady
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <FiCheckCircle size={14} />
              {isScannerReady
                ? '스캐너 준비 완료'
                : isStartingScanner
                  ? '카메라 연결 중'
                  : '직접 입력 기능도 사용 가능'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )}
</>
  );
};

export default ScanPage;

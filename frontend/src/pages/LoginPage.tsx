import { useForm } from 'react-hook-form';
import { FaLock, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLogin } from '../hooks/useLogin';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../store/userSlice';
import type { LoginRequest } from '../types/auth.type';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutate } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginRequest>({ mode: 'onChange' });

  const onSubmit = ({ email, password }: LoginRequest) => {
    mutate(
      { email, password },
      {
        onSuccess: (user) => {
          dispatch(setUser(user));
          toast.success('로그인되었습니다.');
          navigate('/');
          reset();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다.');
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F6F8] px-4">
      <div className="flex w-full max-w-300 items-center justify-center md:justify-between">
        <div className="hidden w-1/4 md:block" />

        <div className="w-full max-w-100 rounded-lg bg-white p-6 shadow-md md:max-w-125 md:p-10">
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="logo" className="h-8 md:h-10" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="flex items-center border border-[#F0F3F5] bg-gray-50 px-3 py-2 md:h-14.5">
                <FaUser className="mr-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: '이메일을 입력해주세요.',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: '올바른 이메일 형식이 아닙니다.',
                    },
                  })}
                  placeholder="이메일"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              {errors.email && (
                <div>
                  <span className="absolute mt-0.75 text-xs text-red-500">{errors.email.message}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center border border-[#F0F3F5] bg-gray-50 px-3 py-2 md:h-14.5">
                <FaLock className="mr-4 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  {...register('password', {
                    required: '비밀번호를 입력해주세요.',
                    minLength: {
                      value: 6,
                      message: '최소 6자 이상 입력해주세요.',
                    },
                  })}
                  placeholder="비밀번호"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              {errors.password && (
                <div>
                  <span className="absolute mt-0.75 text-xs text-red-500">
                    {errors.password.message}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-700 py-2 text-white transition hover:bg-blue-800"
            >
              로그인
            </button>

            <p className="text-center text-sm text-gray-500">
              계정이 없다면{' '}
              <a href="/register" className="font-semibold text-black hover:underline">
                회원가입
              </a>
            </p>
          </form>
        </div>

        <div className="hidden w-1/4 md:block" />
      </div>
    </div>
  );
};

export default LoginPage;

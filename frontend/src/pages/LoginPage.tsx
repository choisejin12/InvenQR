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
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center px-4">
      <div className="w-full max-w-300 flex justify-center md:justify-between items-center">
        <div className="hidden md:block w-1/4" />

        <div className="w-full max-w-100 md:max-w-125 bg-white rounded-lg shadow-md p-6 md:p-10">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="logo" className="h-8 md:h-10" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="flex items-center border border-[#F0F3F5] px-3 py-2 bg-gray-50 md:h-14.5">
                <FaUser className="text-gray-400 mr-4" />
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
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              {errors.email && (
                <div>
                  <span className="absolute mt-0.75 text-red-500 text-xs">{errors.email.message}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center border border-[#F0F3F5] px-3 py-2 bg-gray-50 md:h-14.5">
                <FaLock className="text-gray-400 mr-4" />
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
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              {errors.password && (
                <div>
                  <span className="absolute mt-0.75 text-red-500 text-xs">
                    {errors.password.message}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
            >
              로그인
            </button>

            <p className="text-center text-sm text-gray-500">
              계정이 없다면{' '}
              <a href="/register" className="font-semibold hover:underline text-black">
                회원가입
              </a>
            </p>
          </form>
        </div>

        <div className="hidden md:block w-1/4" />
      </div>
    </div>
  );
};

export default LoginPage;

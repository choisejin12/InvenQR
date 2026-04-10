import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {useRegister} from '../hooks/useRegister'
import { useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import type {RegisterRequest} from '../types/auth.type';


export default function RegisterPage() {

  const userEmail = {
    required : "필수 필드입니다.",
    pattern: {
      value: /\S+@\S+\.\S+/,
      message: "올바른 이메일 형식이 아닙니다.",
    }
  }

  const userPassword = {
    required : "필수 필드입니다.",
    minLength: {
      value : 6,
      message: "최소 6자 이상 입력해주세요.",
    }
  }

  const userName = {
    required : "필수 필드입니다."
  }

  const navigate = useNavigate();

  const { mutate } = useRegister();

  const {
      register, 
      handleSubmit, 
      watch, 
      formState: { errors }, 
  } = useForm<RegisterRequest>({ mode: 'onChange' }) 

  const watchedPassword  = watch("password");


  const onSubmit = (formValues: RegisterRequest) => { 
    mutate(formValues, {
      onSuccess: () => {
        toast("InvenQR 멤버가 되신 걸 환영합니다 !");
        navigate('/login');
      },
    onError: (err: any) => {
        toast.error(err?.message || "회원가입 실패");
      },
    });
  }

  const confirmPasswordValidation = {
    required: "필수 필드입니다.",
    validate: (value: string) =>
      value === watchedPassword || "비밀번호가 일치하지 않습니다.",
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center px-4">
      <div className="w-full max-w-300 flex justify-center md:justify-between items-center">

        {/* 좌측 여백 (PC용) */}
        <div className="hidden md:block w-1/4"></div>

        {/* 카드 */}
        <div className="w-full max-w-100 md:max-w-125 bg-white rounded-lg shadow-md p-6 md:p-10">
          
          {/* 로고 */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="logo" className="h-8 md:h-10" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* 이름 */}
            <div>
              <div className="flex items-center border border-[#F0F3F5] px-3 py-2 bg-gray-50 md:h-14.5">
                <FaUser className="text-gray-400 mr-4" />
                <input
                  type="text"
                  id="name"
                  {...register('name', userName)}
                  placeholder="이름"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              {
                  errors?.name &&
                  <div>
                    <span className='absolute mt-0.75 text-red-500 text-xs '>
                      {errors.name.message}
                    </span>
                  </div>
              }
            </div>

            {/* 아이디 */}
            <div>
              <div className="flex items-center border border-[#F0F3F5] px-3 py-2 bg-gray-50 md:h-14.5">
                <FaUser className="text-gray-400 mr-4" />
                <input
                  type="email"
                  id="email"
                  {...register('email', userEmail)}
                  placeholder="이메일"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              {
                  errors?.email &&
                  <div>
                    <span className='absolute mt-0.75 text-red-500 text-xs'>
                      {errors.email.message}
                    </span>
                  </div>
              }
            </div>         
 
            {/* 비밀번호 */}
            <div>
              <div className="flex items-center border border-[#F0F3F5] px-3 py-2 bg-gray-50 md:h-14.5">
                <FaLock className="text-gray-400 mr-4" />
                <input
                  type="password"
                  id="password"
                  {...register('password', userPassword)}
                  placeholder="비밀번호"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              {
                  errors?.password &&
                  <div>
                    <span className='absolute mt-0.75 text-red-500 text-xs'>
                      {errors.password.message}
                    </span>
                  </div>
              }
            </div>


            {/* 비밀번호 확인 */}
            <div>
              <div className="flex items-center border border-[#F0F3F5] px-3 py-2 bg-gray-50 md:h-14.5">
                <FaLock className="text-gray-400 mr-4" />
                <input
                  type="password"
                  {...register("confirmPassword", confirmPasswordValidation)}
                  placeholder="비밀번호 확인"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
              {errors?.confirmPassword && (
                <span className="absolute mt-0.75 text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* 버튼 */}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
            >
              회원가입
            </button>

            {/* 로그인 이동 */}
            <p className="text-center text-sm text-gray-500">
              아이디가 있다면?{' '}
              <a href="/login" className='font-semibold hover:underline text-black'>
                로그인
              </a>
            </p>
          </form>
        </div>

        {/* 우측 여백 */}
        <div className="hidden md:block w-1/4"></div>
      </div>
    </div>
  );
}

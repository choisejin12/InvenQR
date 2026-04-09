import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import {  useNavigate } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";

type Props = {
  onMenuClick: () => void;
};

function Header({ onMenuClick }: Props) {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="w-full h-20 md:h-25 bg-white flex items-center justify-between px-6">
      
      {/* 🔵 로고 */}
      <div className="flex items-center gap-2">
        <div className="text-xl font-bold">
            <img src="/logo.png" alt="logo" className="h-8 md:h-10" />
        </div>
      </div>

      
      {/* 🔵 우측 메뉴 */}
      <div className="flex items-center gap-1 md:gap-4 text-sm font-semibold">
        <Link to="/login" className="hover:underline text-[12px] md:text-sm">
          로그인
        </Link>
        <span>|</span>
        <Link to="/register" className="hover:underline  text-[12px] md:text-sm">
          회원가입
        </Link>
        <span>|</span>
        <button className=' text-[12px] md:text-sm'onClick={handleLogout}>로그아웃</button>
      </div>

      <button className="md:hidden" onClick={onMenuClick}>
        <GiHamburgerMenu size={22} />
      </button>
    </div>
  );
}

export default Header;
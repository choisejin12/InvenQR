import { useDispatch } from 'react-redux';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/userSlice';
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store';


type Props = {
  onMenuClick: () => void;
};

function Header({ onMenuClick }: Props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userAuth = useSelector((state: RootState) => state.user.isAuth); // 리덕스에서 유저 정보 가져오기

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-20 w-full items-center justify-between bg-white px-6 md:h-25">
      <div className="flex items-center gap-2">
        <div className='cursor-pointer' onClick={()=>navigate('/')}>
          <img src="/logo.png" alt="logo" className="h-8 md:h-10" />
        </div>
      </div>

      {userAuth ? (
        <div className="flex items-center gap-1 text-sm font-semibold md:gap-4">
          <button className="text-[12px] md:text-sm" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

      ) : (
        <div className="flex items-center gap-1 text-sm font-semibold md:gap-4">
          <Link to="/login" className="text-[12px] hover:underline md:text-sm">
            로그인
          </Link>
          <span>|</span>
          <Link to="/register" className="text-[12px] hover:underline md:text-sm">
            회원가입
          </Link>
          <span>|</span>
          <button className="text-[12px] md:text-sm" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

      )}



      <button className="md:hidden" onClick={onMenuClick}>
        <GiHamburgerMenu size={22} />
      </button>
    </div>
  );
}

export default Header;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { FaChartSimple } from "react-icons/fa6";
import { AiFillProduct } from "react-icons/ai";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { MdAdminPanelSettings } from "react-icons/md";
import { LuNotepadText } from "react-icons/lu";
import { FaCaretRight } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";

type MenuItem = {
  title: string;
  path?: string;
  children?: { title: string; path: string }[];
  icon?: any;
};

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const menuList: MenuItem[] = [
  { title: "대시보드", path: "/", icon: <FaChartSimple /> },
  {
    title: "상품관리",
    children: [
      { title: "전체 상품", path: "/product" },
      { title: "입출고 기록", path: "/inventory" },
      { title: "CSV 다운로드", path: "/csv" },
    ],
    icon: <AiFillProduct />,
  },
  { title: "QR 스캔", path: "/scan", icon: <MdOutlineQrCodeScanner /> },
  { title: "내요청", path: "/requestproduct", icon: <LuNotepadText /> },
  {
    title: "관리자",
    path: "/admin",
    children: [
      { title: "창고 정보 관리", path: "/admin" },
      { title: "전체 제품 관리", path: "/admin/product" },
      { title: "입출고 기록 관리", path: "/admin/inventorylog" },
      { title: "상품 승인 요청 관리", path: "/admin/requestproduct" },
    ],
    icon: <MdAdminPanelSettings />,
  },
];

function Nav({ open, setOpen }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();

  /** ✅ 현재 경로 기반 자동 open */
  useEffect(() => {
    for (const menu of menuList) {
      if (menu.children) {
        const match = menu.children.find((sub) =>
          location.pathname.startsWith(sub.path)
        );
        if (match) {
          setOpenMenu(menu.title);
          return;
        }
      }
    }
  }, [location.pathname]);

  const toggleMenu = (title: string) => {
    setOpenMenu((prev) => (prev === title ? null : title));
  };

  return (
    <>
      {/* 🔵 사이드바 */}
      <div
        className={`
        fixed md:static  md:top-0 left-0 h-[calc(100%-56px)] md:h-full w-64 bg-[#2f3e4d]
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}
      >
        {/* 메뉴 */}
        <div className="p-2 space-y-2 mt-5">
          {menuList.map((menu) => {
            const isOpen = openMenu === menu.title;

            return (
              <div key={menu.title}>
                {/* 🔵 단일 메뉴 */}
                {menu.path && !menu.children ? (
                  <Link
                    to={menu.path}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-2 rounded text-white hover:bg-[#3e4f60] flex flex-row ${
                      location.pathname === menu.path
                        ? "bg-[#3e4f60]"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2 text-[20px]">
                        {menu.icon}
                        {menu.title}
                      </div>
                      <FaCaretRight/>
                    </div>

                  </Link>
                ) : (
                  <>
                    {/* 🔵 부모 메뉴 (클릭하면 펼침) */}
                    <div
                      onClick={() => toggleMenu(menu.title)}
                      className="flex flex-row px-3 py-2 text-white text-sm cursor-pointer"
                    >
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2 text-[20px]">
                          {menu.icon}
                          {menu.title}
                        </div>
                          {
                          openMenu ? (<FaCaretDown/>): (<FaCaretRight/>)
                          }
                      </div>
                    </div>

                    {/* 🔵 하위 메뉴 (애니메이션 적용) */}
                    <div
                      className={`
                        ml-3 space-y-1 overflow-hidden transition-all duration-300
                        ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                      `}
                    >
                      {menu.children?.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setOpen(false)}
                          className={`block px-3 py-2 rounded text-sm text-white hover:bg-[#3e4f60] ml-2 ${
                            location.pathname === sub.path
                              ? "bg-[#3e4f60]"
                              : ""
                          }`}
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
    </>
  );
}

export default Nav;
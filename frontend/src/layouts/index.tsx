// layouts/MainLayout.tsx
import Header from "../components/Header";
import Nav from "./sections/Navitems";
import { Outlet } from "react-router-dom";
import { useState } from "react";

function MainLayout() {
    const [open, setOpen] = useState(false);



  return (
    <div className="flex flex-col h-screen">
      
      {/* 🔵 상단 헤더 */}
      <Header onMenuClick={() => setOpen((prev) => !prev)} />

      {/* 🔵 아래 영역 (Nav + Content) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 사이드바 */}
        <Nav open={open} setOpen={setOpen} />

        {/* 메인 */}
        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default MainLayout;
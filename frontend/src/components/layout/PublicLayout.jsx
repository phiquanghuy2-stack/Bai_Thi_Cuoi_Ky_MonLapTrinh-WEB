import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, UserCircle2, LayoutDashboard, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

const PublicLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboardRedirect = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/tenant/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#222222]">
      {/* Header HVA HOMESTAY phong cách Airbnb */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Left: Logo HVA HOMESTAY */}
          <div className="flex items-center gap-5">
            <BrandLogo to="/" />
            <span className="hidden xl:inline-block pl-5 border-l border-neutral-200 text-xs italic text-neutral-500 font-serif">
              “Hiên nhà đón gió ngàn phương, Về đây rũ mỏi, An tường giấc say.”
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-500">
            <Link
              to="/"
              className={`flex items-center gap-2 py-2 border-b-2 transition-colors ${
                location.pathname === '/'
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent hover:text-neutral-800'
              }`}
            >
              <span className="text-lg">🏡</span>
              Phòng & Homestay
            </Link>
            <a
              href="/#electricity-tiers"
              className="flex items-center gap-2 py-2 border-b-2 border-transparent hover:text-neutral-800 transition-colors"
            >
              <span className="text-lg">⚡</span>
              Điện bậc thang
            </a>
            <Link
              to="/login"
              className="flex items-center gap-2 py-2 border-b-2 border-transparent hover:text-neutral-800 transition-colors"
            >
              <span className="text-lg">🛎️</span>
              Cổng cư dân
            </Link>
          </nav>

          {/* Right: Menu User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleDashboardRedirect}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FA5252]" />
                {user?.role === 'admin' ? 'Quản trị HVA Homestay' : 'Phòng của tôi'}
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
              >
                Dành cho Chủ trọ
              </Link>
            )}

            <div className="hidden sm:flex p-2.5 rounded-full hover:bg-neutral-100 text-neutral-700 cursor-pointer">
              <Globe className="w-4 h-4" />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDashboardRedirect}
                  className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full border border-neutral-300 hover:shadow-md transition-all bg-white"
                >
                  <Menu className="w-4 h-4 text-neutral-600" />
                  <div className="w-7 h-7 rounded-full bg-[#FA5252] text-white text-xs font-bold flex items-center justify-center">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-2 rounded-full border border-neutral-200 hover:bg-rose-50 text-neutral-600 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2.5 pl-3.5 pr-2 py-1.5 rounded-full border border-neutral-300 hover:shadow-md transition-all bg-white"
              >
                <Menu className="w-4 h-4 text-neutral-700" />
                <span className="text-xs font-bold text-neutral-800">Đăng nhập</span>
                <UserCircle2 className="w-7 h-7 text-neutral-500 fill-neutral-200" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer HVA HOMESTAY */}
      <footer className="bg-[#F7F7F7] border-t border-neutral-200 text-neutral-600 mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs sm:text-sm">
          <div className="space-y-3">
            <BrandLogo to="/" />
            <p className="font-serif italic text-neutral-700 text-sm leading-relaxed pt-1">
              “Hiên nhà đón gió ngàn phương,
              <br />
              Về đây rũ mỏi,
              <br />
              An tường giấc say.”
            </p>
            <p className="text-neutral-500 leading-relaxed text-xs">
              Hệ thống quản lý phòng trọ & căn hộ dịch vụ HVA HOMESTAY. Minh bạch chỉ số điện bậc
              thang, xuất hóa đơn PDF và hợp đồng điện tử.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900">Khu vực HVA Homestay</h4>
            <ul className="space-y-2 text-neutral-500 text-xs">
              <li>HVA Homestay Quận Cầu Giấy, Hà Nội</li>
              <li>HVA Homestay Quận Đống Đa, Hà Nội</li>
              <li>HVA Homestay Quận Sơn Trà, Đà Nẵng</li>
              <li>HVA Homestay Mỹ An, Ngũ Hành Sơn</li>
              <li>HVA Homestay Quận Bình Thạnh, TP.HCM</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900">Quy chuẩn minh bạch</h4>
            <ul className="space-y-2 text-neutral-500 text-xs">
              <li>Tính tiền điện đúng 6 bậc thang EVN</li>
              <li>Hợp đồng tự động cập nhật trạng thái phòng</li>
              <li>Hóa đơn PDF lưu trữ hàng tháng</li>
              <li>Tiếp nhận sửa chữa có hình ảnh đính kèm</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-neutral-900">Liên hệ HVA HOMESTAY</h4>
            <ul className="space-y-2 text-neutral-500 text-xs">
              <li>Hotline Chủ nhà: 0988.888.888</li>
              <li>Email: contact@hvahomestay.vn</li>
              <li>Trụ sở: Cầu Giấy, Hà Nội</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 py-5">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
            <p>© {new Date().getFullYear()} HVA HOMESTAY · Hiên nhà đón gió ngàn phương, Về đây rũ mỏi, An tường giấc say.</p>
            <p className="font-semibold text-neutral-700">🇻🇳 Tiếng Việt (VN) · ₫ VND</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

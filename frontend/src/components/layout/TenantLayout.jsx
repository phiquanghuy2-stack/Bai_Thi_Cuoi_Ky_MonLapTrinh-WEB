import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Wrench, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

const TenantLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/tenant/dashboard',
      label: 'Tổng quan phòng thuê',
      subtitle: 'Hợp đồng & Trạng thái',
      icon: LayoutDashboard,
    },
    {
      to: '/tenant/invoices',
      label: 'Hóa đơn của tôi',
      subtitle: 'Điện bậc thang & Xuất PDF',
      icon: FileText,
    },
    {
      to: '/tenant/repairs',
      label: 'Yêu cầu sửa chữa',
      subtitle: 'Báo hỏng kèm hình ảnh',
      icon: Wrench,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F7F7] text-[#222222]">
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen">
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-neutral-100">
            <BrandLogo to="/" size="sm" />
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Người thuê
            </span>
          </div>

          <div className="p-4">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FA5252]">
                Cư dân HVA Homestay
              </p>
              <p className="text-sm font-extrabold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 font-medium">
                {user?.activeContract?.room
                  ? `Đang thuê: Phòng ${user.activeContract.room.roomNumber}`
                  : 'Chưa có hợp đồng hiệu lực'}
              </p>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#FA5252] text-white shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="leading-tight">
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] opacity-80 block">{item.subtitle}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-neutral-200 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700"
          >
            <Home className="w-4 h-4 text-[#FA5252]" />
            Về trang chủ HVA Homestay
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-700 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TenantLayout;

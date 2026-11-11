import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TableProperties,
  DoorOpen,
  FileSignature,
  Wrench,
  Users,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard Thống kê',
      subtitle: 'Biểu đồ 12 tháng & Phòng nợ',
      icon: BarChart3,
    },
    {
      to: '/admin/utility-sheet',
      label: 'Bảng Nhập Điện Nước',
      subtitle: 'Inline Error & Tính bậc thang',
      icon: TableProperties,
    },
    {
      to: '/admin/rooms',
      label: 'Quản lý Phòng trọ',
      subtitle: 'Địa điểm, giá & hình ảnh',
      icon: DoorOpen,
    },
    {
      to: '/admin/contracts',
      label: 'Quản lý Hợp đồng',
      subtitle: 'Chốt chặn & Kết thúc HĐ',
      icon: FileSignature,
    },
    {
      to: '/admin/repairs',
      label: 'Duyệt Sửa chữa',
      subtitle: 'Xử lý sự cố cư dân',
      icon: Wrench,
    },
    {
      to: '/admin/tenants',
      label: 'Quản lý Người thuê',
      subtitle: 'Danh sách khách thuê',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F7F7] text-[#222222]">
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col justify-between shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-neutral-100">
            <BrandLogo to="/admin/dashboard" size="sm" />
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-[#FA5252] border border-rose-200">
              Chủ trọ
            </span>
          </div>

          <div className="p-4">
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FA5252] text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FA5252]">
                  Chủ nhà HVA Homestay
                </p>
                <p className="text-xs font-bold text-neutral-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all ${
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors"
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

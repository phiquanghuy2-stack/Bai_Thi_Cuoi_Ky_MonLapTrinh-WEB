import React, { useState } from 'react';
import { UserPlus, Search, Trash2 } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import axiosClient from '../../api/axiosClient';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';

const AdminTenantsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  const {
    data: tenants,
    pagination,
    loading,
    refetch,
  } = useFetch('/users', {
    role: 'tenant',
    search: debouncedSearch,
    page,
    limit: 8,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!formData.email.trim()) errs.email = 'Vui lòng nhập email';
    if (!formData.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    return errs;
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await axiosClient.post('/users', {
        ...formData,
        role: 'tenant',
      });
      setBanner({ type: 'success', message: 'Tạo tài khoản người thuê mới thành công!' });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      refetch();
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.response?.data?.message || 'Không thể tạo người thuê!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setDeleting(true);
    try {
      await axiosClient.delete(`/users/${tenantToDelete._id}`);
      setBanner({ type: 'success', message: 'Đã xóa người thuê thành công!' });
      setTenantToDelete(null);
      refetch();
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.response?.data?.message || 'Không thể xóa người thuê!',
      });
      setTenantToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Quản Lý Người Thuê (Tenants)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tìm kiếm bằng toán tử $regex theo tên, email, số điện thoại và phân trang Server-side
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setErrors({});
            setIsModalOpen(true);
          }}
        >
          <UserPlus className="w-4 h-4" />
          Thêm Người Thuê
        </Button>
      </div>

      <AlertBanner
        type={banner.type}
        message={banner.message}
        onClose={() => setBanner({ type: '', message: '' })}
      />

      <div className="max-w-md">
        <InputField
          name="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo tên, email hoặc số điện thoại..."
          icon={Search}
        />
      </div>

      {loading ? (
        <Spinner label="Đang tải danh sách người thuê..." />
      ) : !tenants || tenants.length === 0 ? (
        <EmptyState title="Không tìm thấy người thuê nào" />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">Họ và tên</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Số điện thoại</th>
                  <th className="py-3.5 px-4">Phòng đang thuê</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tenants.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-bold">{t.name}</td>
                    <td className="py-3.5 px-4">{t.email}</td>
                    <td className="py-3.5 px-4">{t.phone}</td>
                    <td className="py-3.5 px-4">
                      {t.activeContract?.room ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold">
                          Phòng {t.activeContract.room.roomNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa thuê phòng</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setTenantToDelete(t)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="p-4">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Tài Khoản Người Thuê Mới"
      >
        <form onSubmit={handleCreateTenant} noValidate className="space-y-4">
          <InputField
            label="Họ và tên"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            error={errors.name}
            required
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            error={errors.email}
            required
          />
          <InputField
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            error={errors.phone}
            required
          />
          <InputField
            label="Mật khẩu khởi tạo"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
            error={errors.password}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(tenantToDelete)}
        onClose={() => setTenantToDelete(null)}
        onConfirm={handleDeleteTenant}
        title="Xóa người thuê"
        message={`Bạn có chắc chắn muốn xóa tài khoản của "${tenantToDelete?.name}"?`}
        confirmText="Xóa"
        loading={deleting}
      />
    </div>
  );
};

export default AdminTenantsPage;

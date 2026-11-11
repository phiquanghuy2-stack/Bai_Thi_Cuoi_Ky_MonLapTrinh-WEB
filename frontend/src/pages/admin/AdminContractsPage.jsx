import React, { useState } from 'react';
import { Plus, Ban, ShieldCheck } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SelectField from '../../components/common/SelectField';
import InputField from '../../components/common/InputField';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminContractsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const {
    data: contracts,
    loading,
    refetch: refetchContracts,
  } = useFetch('/contracts', { status: statusFilter, limit: 50 });

  const { data: allRooms, refetch: refetchRooms } = useFetch('/rooms', { all: 'true' });
  const { data: allTenants } = useFetch('/users', { role: 'tenant', all: 'true' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    room: '',
    tenant: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .slice(0, 10),
    deposit: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [contractToTerminate, setContractToTerminate] = useState(null);
  const [terminating, setTerminating] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });

  const validate = () => {
    const errs = {};
    if (!formData.room) errs.room = 'Vui lòng chọn phòng trọ';
    if (!formData.tenant) errs.tenant = 'Vui lòng chọn người thuê';
    if (!formData.startDate) errs.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.endDate) errs.endDate = 'Vui lòng chọn ngày kết thúc';
    else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    return errs;
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosClient.post('/contracts', {
        ...formData,
        deposit: Number(formData.deposit) || 0,
      });

      setBanner({
        type: 'success',
        message: res.data.message,
      });
      setIsModalOpen(false);
      refetchContracts();
      refetchRooms();
    } catch (err) {
      setBanner({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Không thể tạo hợp đồng (Phòng đang có hợp đồng Hiệu lực)!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTerminateContract = async () => {
    if (!contractToTerminate) return;
    setTerminating(true);
    try {
      const res = await axiosClient.patch(`/contracts/${contractToTerminate._id}/terminate`);
      setBanner({
        type: 'success',
        message: res.data.message,
      });
      setContractToTerminate(null);
      refetchContracts();
      refetchRooms();
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi kết thúc hợp đồng!',
      });
      setContractToTerminate(null);
    } finally {
      setTerminating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Quản Lý Hợp Đồng Thuê Phòng
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chốt chặn tạo trùng hợp đồng trên phòng đang Hiệu lực & Tự động đổi trạng thái Phòng khi
            kết thúc hợp đồng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Hiệu lực">Đang Hiệu lực</option>
            <option value="Đã kết thúc">Đã kết thúc</option>
          </select>

          <Button
            variant="primary"
            onClick={() => {
              setFormErrors({});
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Lập Hợp Đồng Mới
          </Button>
        </div>
      </div>

      <AlertBanner
        type={banner.type}
        message={banner.message}
        onClose={() => setBanner({ type: '', message: '' })}
      />

      {loading ? (
        <Spinner label="Đang tải danh sách hợp đồng..." />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          title="Chưa có hợp đồng nào"
          description="Nhấn Lập Hợp Đồng Mới để gán người thuê vào phòng trống."
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">Phòng</th>
                  <th className="py-3.5 px-4">Người thuê</th>
                  <th className="py-3.5 px-4">Thời hạn</th>
                  <th className="py-3.5 px-4">Tiền cọc</th>
                  <th className="py-3.5 px-4">Trạng thái HĐ</th>
                  <th className="py-3.5 px-4">TT Phòng</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {contracts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-extrabold text-blue-600 dark:text-blue-400">
                      Phòng {c.room?.roomNumber}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {formatCurrency(c.room?.price)}/tháng
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold">{c.tenant?.name}</p>
                      <p className="text-xs text-slate-400">
                        {c.tenant?.phone} • {c.tenant?.email}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {formatDate(c.startDate)} → {formatDate(c.endDate)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {formatCurrency(c.deposit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {c.room?.status && <StatusBadge status={c.room.status} />}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status === 'Hiệu lực' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setContractToTerminate(c)}
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Kết thúc hợp đồng
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Đã thanh lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lập Hợp Đồng Thuê Phòng Mới"
      >
        <form onSubmit={handleCreateContract} noValidate className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Quy tắc chốt chặn:</strong> Hệ thống hiển thị toàn bộ phòng để bạn có thể kiểm
              thử. Nếu chọn phòng đang có hợp đồng <strong>Hiệu lực</strong>, API sẽ chặn và trả lỗi
              400 ngay lập tức. Khi tạo thành công vào phòng Trống, phòng sẽ tự động chuyển sang{' '}
              <strong>Đang thuê</strong>.
            </span>
          </div>

          <SelectField
            label="Chọn phòng trọ"
            name="room"
            value={formData.room}
            onChange={(e) => {
              const selectedRoom = (allRooms || []).find((r) => r._id === e.target.value);
              setFormData((p) => ({
                ...p,
                room: e.target.value,
                deposit: selectedRoom ? selectedRoom.price : p.deposit,
              }));
              setFormErrors((p) => ({ ...p, room: '' }));
            }}
            placeholder="-- Chọn phòng --"
            error={formErrors.room}
            required
            options={(allRooms || []).map((r) => ({
              value: r._id,
              label: `Phòng ${r.roomNumber} - ${formatCurrency(r.price)} (${r.status})`,
            }))}
          />

          <SelectField
            label="Chọn người thuê (Tenant)"
            name="tenant"
            value={formData.tenant}
            onChange={(e) => {
              setFormData((p) => ({ ...p, tenant: e.target.value }));
              setFormErrors((p) => ({ ...p, tenant: '' }));
            }}
            placeholder="-- Chọn người thuê --"
            error={formErrors.tenant}
            required
            options={(allTenants || []).map((t) => ({
              value: t._id,
              label: `${t.name} (${t.phone} - ${t.email})`,
            }))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
              error={formErrors.startDate}
              required
            />
            <InputField
              label="Ngày kết thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
              error={formErrors.endDate}
              required
            />
          </div>

          <InputField
            label="Tiền đặt cọc (VNĐ)"
            name="deposit"
            type="number"
            value={formData.deposit}
            onChange={(e) => setFormData((p) => ({ ...p, deposit: e.target.value }))}
            placeholder="3200000"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Tạo Hợp Đồng
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(contractToTerminate)}
        onClose={() => setContractToTerminate(null)}
        onConfirm={handleTerminateContract}
        title="Kết thúc hợp đồng thuê phòng"
        message={`Khi kết thúc hợp đồng của ${contractToTerminate?.tenant?.name}, trạng thái Hợp đồng sẽ chuyển thành "Đã kết thúc" và Phòng ${contractToTerminate?.room?.roomNumber} sẽ TỰ ĐỘNG chuyển về trạng thái "Trống". Bạn có chắc chắn?`}
        confirmText="Kết thúc hợp đồng"
        loading={terminating}
      />
    </div>
  );
};

export default AdminContractsPage;

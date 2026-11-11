import React, { useState } from 'react';
import { Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SelectField from '../../components/common/SelectField';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';
import { formatDate } from '../../utils/formatters';

const AdminRepairsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const {
    data: requests,
    loading,
    refetch,
  } = useFetch('/repair-requests', { status: statusFilter, limit: 50 });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [nextStatus, setNextStatus] = useState('Đang xử lý');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });

  const openUpdateModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setNextStatus(reqItem.status);
    setAdminNote(reqItem.adminNote || '');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setUpdating(true);
    try {
      const res = await axiosClient.patch(`/repair-requests/${selectedRequest._id}/status`, {
        status: nextStatus,
        adminNote,
      });
      setBanner({
        type: 'success',
        message: res.data.message,
      });
      setSelectedRequest(null);
      refetch();
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.response?.data?.message || 'Không thể cập nhật trạng thái sửa chữa!',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Duyệt Yêu Cầu Sửa Chữa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xem báo hỏng kèm hình ảnh từ Người thuê và cập nhật tiến độ xử lý
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Mới">Mới</option>
          <option value="Đang xử lý">Đang xử lý</option>
          <option value="Xong">Xong</option>
        </select>
      </div>

      <AlertBanner
        type={banner.type}
        message={banner.message}
        onClose={() => setBanner({ type: '', message: '' })}
      />

      {loading ? (
        <Spinner label="Đang tải danh sách yêu cầu sửa chữa..." />
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          title="Không có yêu cầu sửa chữa nào"
          description="Hiện không có yêu cầu nào khớp với trạng thái đã chọn."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      Phòng {item.room?.roomNumber} • Người gửi: {item.tenant?.name} (
                      {item.tenant?.phone})
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Ngày gửi: {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {item.images && item.images.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mb-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Ảnh thực tế đính kèm ({item.images.length}
                      ):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.images.map((img, idx) => (
                        <a
                          key={`${item._id}-${idx}`}
                          href={getImageUrl(img)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                          <img
                            src={getImageUrl(img)}
                            alt="Minh họa sự cố"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {item.adminNote && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <strong>Ghi chú xử lý:</strong> {item.adminNote}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => openUpdateModal(item)}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Duyệt / Cập nhật tiến độ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={`Cập nhật sửa chữa - Phòng ${selectedRequest?.room?.roomNumber || ''}`}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <SelectField
            label="Trạng thái xử lý"
            name="status"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value)}
            options={[
              { value: 'Mới', label: 'Mới tiếp nhận' },
              { value: 'Đang xử lý', label: 'Đang xử lý' },
              { value: 'Xong', label: 'Đã hoàn thành (Xong)' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phản hồi / Ghi chú cho người thuê
            </label>
            <textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="VD: Đã hẹn thợ điện lạnh 14h chiều nay qua kiểm tra..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={updating}>
              Lưu trạng thái
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRepairsPage;

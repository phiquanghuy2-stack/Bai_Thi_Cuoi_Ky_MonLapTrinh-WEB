import React, { useState } from 'react';
import { Wrench, Send, Image as ImageIcon } from 'lucide-react';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import { useFetch } from '../../hooks/useFetch';
import InputField from '../../components/common/InputField';
import ImageUploader from '../../components/common/ImageUploader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import AlertBanner from '../../components/common/AlertBanner';
import { formatDate } from '../../utils/formatters';

const TenantRepairsPage = () => {
  const { data: requests, loading, refetch } = useFetch('/repair-requests');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!formData.title.trim()) {
      nextErrors.title = 'Vui lòng nhập tiêu đề sự cố cần sửa chữa';
    } else if (formData.title.trim().length < 5) {
      nextErrors.title = 'Tiêu đề sự cố phải từ 5 ký tự trở lên';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Vui lòng mô tả chi tiết tình trạng hư hỏng';
    } else if (formData.description.trim().length < 10) {
      nextErrors.description = 'Mô tả chi tiết phải có ít nhất 10 ký tự';
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      files.forEach((file) => {
        payload.append('images', file);
      });

      await axiosClient.post('/repair-requests', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ title: '', description: '' });
      setFiles([]);
      setErrors({});
      setFeedback({
        type: 'success',
        message: 'Đã gửi yêu cầu sửa chữa kèm hình ảnh thành công!',
      });
      refetch();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Không thể gửi yêu cầu sửa chữa!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Yêu Cầu Sửa Chữa & Báo Hỏng
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gửi yêu cầu sửa chữa thiết bị kèm hình ảnh thực tế (Upload qua Multer) để Chủ trọ xử lý
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form gửi yêu cầu sửa chữa */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            Tạo Yêu Cầu Sửa Chữa Mới
          </h3>

          <AlertBanner
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback({ type: '', message: '' })}
          />

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <InputField
              label="Tiêu đề sự cố"
              name="title"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="VD: Điều hòa không lạnh, rò nước bồn rửa..."
              error={errors.title}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mô tả chi tiết <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Mô tả rõ vị trí hỏng và thời gian bạn có mặt ở phòng để thợ ghé sửa..."
                className={`w-full rounded-lg border px-3.5 py-2 text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 ${
                  errors.description
                    ? 'border-rose-500 focus:ring-rose-200'
                    : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Hình ảnh minh họa (Multer Upload)
              </label>
              <ImageUploader files={files} onChange={setFiles} maxFiles={5} />
            </div>

            <Button type="submit" variant="primary" className="w-full" loading={submitting}>
              <Send className="w-4 h-4" />
              Gửi Yêu Cầu Sửa Chữa
            </Button>
          </form>
        </div>

        {/* Danh sách lịch sử yêu cầu */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Lịch Sử Yêu Cầu Đã Gửi ({(requests || []).length})
          </h3>

          {loading ? (
            <Spinner label="Đang tải danh sách yêu cầu..." />
          ) : !requests || requests.length === 0 ? (
            <EmptyState
              title="Chưa có yêu cầu sửa chữa nào"
              description="Khi thiết bị trong phòng gặp sự cố, bạn có thể gửi yêu cầu kèm ảnh tại đây."
            />
          ) : (
            <div className="space-y-4">
              {requests.map((reqItem) => (
                <div
                  key={reqItem._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Phòng {reqItem.room?.roomNumber} • Ngày gửi: {formatDate(reqItem.createdAt)}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {reqItem.title}
                      </h4>
                    </div>
                    <StatusBadge status={reqItem.status} />
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {reqItem.description}
                  </p>

                  {reqItem.images && reqItem.images.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" /> Hình ảnh đính kèm:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {reqItem.images.map((imgUrl, idx) => (
                          <a
                            key={`${reqItem._id}-img-${idx}`}
                            href={getImageUrl(imgUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 block"
                          >
                            <img
                              src={getImageUrl(imgUrl)}
                              alt="Ảnh báo hỏng"
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {reqItem.adminNote && (
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-slate-700 dark:text-slate-200">
                      <strong>Phản hồi từ Chủ trọ:</strong> {reqItem.adminNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantRepairsPage;

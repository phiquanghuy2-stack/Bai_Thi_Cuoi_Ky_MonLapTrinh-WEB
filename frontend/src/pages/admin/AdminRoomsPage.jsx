import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import { fetchRooms, deleteRoomThunk } from '../../store/slices/roomSlice';
import { useDebounce } from '../../hooks/useDebounce';
import axiosClient from '../../api/axiosClient';
import RoomFilterBar from '../../components/rooms/RoomFilterBar';
import RoomCard from '../../components/rooms/RoomCard';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import InputField from '../../components/common/InputField';
import SelectField from '../../components/common/SelectField';
import ImageUploader from '../../components/common/ImageUploader';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import AlertBanner from '../../components/common/AlertBanner';

const INITIAL_FILTERS = {
  search: '',
  location: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  minArea: '',
};

const INITIAL_FORM = {
  roomNumber: '',
  title: '',
  location: 'Quận Cầu Giấy, Hà Nội',
  address: '',
  category: 'Studio',
  price: '',
  area: '',
  status: 'Trống',
  description: '',
  lastElecIndex: 0,
  lastWaterIndex: 0,
};

const AdminRoomsPage = () => {
  const dispatch = useDispatch();
  const { items: rooms, pagination, loading } = useSelector((state) => state.rooms);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebounce(filters, 350);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });

  const loadRooms = useCallback(() => {
    dispatch(
      fetchRooms({
        ...debouncedFilters,
        page,
        limit: 8,
      })
    );
  }, [dispatch, debouncedFilters, page]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData(INITIAL_FORM);
    setFiles([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      title: room.title || '',
      location: room.location || 'Quận Cầu Giấy, Hà Nội',
      address: room.address || '',
      category: room.category || 'Studio',
      price: room.price,
      area: room.area,
      status: room.status,
      description: room.description || '',
      lastElecIndex: room.lastElecIndex || 0,
      lastWaterIndex: room.lastWaterIndex || 0,
    });
    setFiles([]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!String(formData.roomNumber).trim()) {
      errs.roomNumber = 'Vui lòng nhập mã/số phòng';
    }
    if (!String(formData.location).trim()) {
      errs.location = 'Vui lòng nhập địa điểm / khu vực';
    }
    if (formData.price === '' || Number(formData.price) <= 0) {
      errs.price = 'Giá thuê phải lớn hơn 0';
    }
    if (formData.area === '' || Number(formData.area) <= 0) {
      errs.area = 'Diện tích phải lớn hơn 0';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('roomNumber', String(formData.roomNumber).trim());
      payload.append('title', formData.title);
      payload.append('location', formData.location);
      payload.append('address', formData.address);
      payload.append('category', formData.category);
      payload.append('price', Number(formData.price));
      payload.append('area', Number(formData.area));
      payload.append('status', formData.status);
      payload.append('description', formData.description);
      payload.append('lastElecIndex', Number(formData.lastElecIndex) || 0);
      payload.append('lastWaterIndex', Number(formData.lastWaterIndex) || 0);
      files.forEach((f) => payload.append('images', f));

      if (editingRoom) {
        await axiosClient.put(`/rooms/${editingRoom._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setBanner({
          type: 'success',
          message: `Cập nhật phòng ${formData.roomNumber} thành công!`,
        });
      } else {
        await axiosClient.post('/rooms', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setBanner({
          type: 'success',
          message: `Thêm phòng ${formData.roomNumber} thành công!`,
        });
      }

      setIsModalOpen(false);
      loadRooms();
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu phòng!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteRoomThunk(roomToDelete._id)).unwrap();
      setBanner({
        type: 'success',
        message: `Đã xóa phòng ${roomToDelete.roomNumber} thành công!`,
      });
      setRoomToDelete(null);
      loadRooms();
    } catch (errMsg) {
      setBanner({ type: 'error', message: String(errMsg) });
      setRoomToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#222222]">
            Quản Lý Danh Sách Phòng Trọ
          </h1>
          <p className="text-xs text-neutral-500">
            Lọc theo địa điểm, trạng thái và tự động đồng bộ khi Hợp đồng thay đổi hiệu lực
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Thêm Phòng Mới
        </Button>
      </div>

      <AlertBanner
        type={banner.type}
        message={banner.message}
        onClose={() => setBanner({ type: '', message: '' })}
      />

      <RoomFilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onReset={() => {
          setFilters(INITIAL_FILTERS);
          setPage(1);
        }}
        showStatusFilter
      />

      {loading ? (
        <Spinner label="Đang tải danh sách phòng..." />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Không có phòng trọ nào"
          description="Hãy thêm phòng mới hoặc đặt lại bộ lọc địa điểm."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                isAdmin
                onEdit={openEditModal}
                onDelete={(r) => setRoomToDelete(r)}
              />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? `Cập nhật Phòng ${editingRoom.roomNumber}` : 'Thêm Phòng Trọ Mới'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Mã / Số phòng"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={(e) => setFormData((p) => ({ ...p, roomNumber: e.target.value }))}
              placeholder="VD: P105"
              error={formErrors.roomNumber}
              required
            />
            <SelectField
              label="Loại hình không gian"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              options={[
                { value: 'Studio', label: 'Căn hộ Studio' },
                { value: 'Duplex', label: 'Gác lửng Duplex' },
                { value: 'Ban công', label: 'Phòng có Ban công' },
                { value: 'Full nội thất', label: 'Full nội thất cao cấp' },
              ]}
            />
          </div>

          <InputField
            label="Tiêu đề hiển thị (Phong cách Airbnb)"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            placeholder="VD: Studio Bắc Âu ngập tràn nắng tại Cầu Giấy"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Địa điểm / Khu vực (Dùng để lọc)"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              placeholder="VD: Quận Cầu Giấy, Hà Nội"
              error={formErrors.location}
              required
            />
            <SelectField
              label="Trạng thái"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              options={[
                { value: 'Trống', label: 'Trống' },
                { value: 'Đang thuê', label: 'Đang thuê' },
                { value: 'Đang sửa', label: 'Đang sửa' },
              ]}
            />
          </div>

          <InputField
            label="Địa chỉ chi tiết"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
            placeholder="VD: Ngõ 76 Duy Tân, Cầu Giấy, Hà Nội"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Giá thuê (VNĐ/tháng)"
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
              placeholder="3200000"
              error={formErrors.price}
              required
            />
            <InputField
              label="Diện tích (m²)"
              name="area"
              type="number"
              value={formData.area}
              onChange={(e) => setFormData((p) => ({ ...p, area: e.target.value }))}
              placeholder="25"
              error={formErrors.area}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Chỉ số điện hiện tại"
              name="lastElecIndex"
              type="number"
              value={formData.lastElecIndex}
              onChange={(e) => setFormData((p) => ({ ...p, lastElecIndex: e.target.value }))}
            />
            <InputField
              label="Chỉ số nước hiện tại"
              name="lastWaterIndex"
              type="number"
              value={formData.lastWaterIndex}
              onChange={(e) => setFormData((p) => ({ ...p, lastWaterIndex: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Mô tả chi tiết phòng
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Ảnh phòng (Multer Local Upload)
            </label>
            <ImageUploader files={files} onChange={setFiles} maxFiles={5} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingRoom ? 'Lưu thay đổi' : 'Tạo phòng'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(roomToDelete)}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng ${roomToDelete?.roomNumber}?`}
        confirmText="Xóa phòng"
        loading={deleting}
      />
    </div>
  );
};

export default AdminRoomsPage;

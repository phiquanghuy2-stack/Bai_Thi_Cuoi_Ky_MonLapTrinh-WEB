import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Share2,
  Heart,
  MapPin,
  ShieldCheck,
  Zap,
  Droplets,
  Wifi,
  Wind,
  Lock,
  CheckCircle2,
  Grid,
  PhoneCall,
  Calendar,
  Sparkles,
  UserCheck,
  Home,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import RoomCard from '../../components/rooms/RoomCard';
import {
  formatCurrency,
  ELECTRICITY_TIERS,
  WATER_UNIT_PRICE,
  DEFAULT_SERVICE_FEE,
  calculateTieredElectricityPreview,
  getRoomFallbackImage,
} from '../../utils/formatters';
import { getImageUrl } from '../../api/axiosClient';

const DEFAULT_GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
];

/**
 * Trang Chi Tiết Phòng chuẩn Airbnb:
 * - Bento Grid 5 ảnh + Modal xem toàn bộ ảnh
 * - Đầy đủ thông số phòng (Mã phòng, Địa điểm, Địa chỉ cụ thể, Tầng, Diện tích, Chỉ số điện/nước, Trạng thái, Tiện nghi)
 * - Công cụ ước tính tiền điện bậc thang & tổng chi phí hàng tháng trực quan
 * - Khung đặt lịch xem phòng / giữ phòng Sticky bên phải giống Airbnb
 */
const RoomDetailPage = () => {
  const { id } = useParams();
  const { data: room, loading, error } = useFetch(`/rooms/${id}`);

  const [liked, setLiked] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // State cho bộ ước tính chi phí hàng tháng ngay trên trang chi tiết phòng
  const [estimatedKwh, setEstimatedKwh] = useState(120);
  const [estimatedWaterM3, setEstimatedWaterM3] = useState(5);
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().slice(0, 10));
  const [leaseMonths, setLeaseMonths] = useState(12);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (loading) return <Spinner label="Đang tải đầy đủ thông tin phòng..." />;

  if (error || !room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 font-bold text-lg">{error || 'Không tìm thấy phòng trọ!'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // Chuẩn bị đủ 5 ảnh cho Bento Grid chuẩn Airbnb
  const rawImages =
    room.images && room.images.length > 0
      ? room.images.map((img) => getImageUrl(img))
      : [getRoomFallbackImage(room.roomNumber)];

  const galleryImages = Array.from({ length: 5 }, (_, idx) => {
    return rawImages[idx] || DEFAULT_GALLERY_FALLBACKS[idx % DEFAULT_GALLERY_FALLBACKS.length];
  });

  const { totalElecAmount, breakdown } = calculateTieredElectricityPreview(0, estimatedKwh);
  const estimatedWaterCost = estimatedWaterM3 * WATER_UNIT_PRICE;
  const estimatedMonthlyTotal =
    Number(room.price || 0) + totalElecAmount + estimatedWaterCost + DEFAULT_SERVICE_FEE;

  const amenitiesList =
    room.amenities && room.amenities.length > 0
      ? room.amenities
      : [
          'Wifi 6 tốc độ cao riêng biệt',
          'Điều hòa Inverter 2 chiều',
          'Khóa vân tay 2 lớp an ninh',
          'Máy giặt lồng ngang riêng',
          'Kệ bếp đá & Bếp từ âm',
          'Bình nóng lạnh Ariston 30L',
          'Cửa sổ / Ban công thoáng gió',
          'Camera an ninh 24/7 & PCCC',
        ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
      {/* 1. Thanh điều hướng & Tiêu đề chuẩn Airbnb */}
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách phòng
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-[#FF385C] text-xs font-extrabold">
                Mã phòng: {room.roomNumber}
              </span>
              <StatusBadge status={room.status} />
              <span className="text-xs font-semibold text-neutral-500">
                Loại hình: {room.category || 'Studio cao cấp'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight mt-2">
              {room.title || `Căn hộ dịch vụ Phòng ${room.roomNumber} tại ${room.location || 'Cầu Giấy'}`}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-700 font-semibold mt-1.5">
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#222222]" />
                {room.rating || '4.96'}
              </span>
              <span>·</span>
              <span className="underline">Được khách thuê yêu thích</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-neutral-600">
                <MapPin className="w-3.5 h-3.5 text-[#FF385C]" />
                {room.address || room.location || 'Quận Cầu Giấy, Hà Nội'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-neutral-100 text-xs font-bold text-neutral-800 underline"
            >
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </button>
            <button
              type="button"
              onClick={() => setLiked((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-neutral-100 text-xs font-bold text-neutral-800 underline"
            >
              <Heart
                className={`w-4 h-4 ${liked ? 'fill-[#FF385C] text-[#FF385C]' : ''}`}
              />
              {liked ? 'Đã lưu' : 'Lưu phòng'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bento Grid 5 Ảnh chuẩn Airbnb */}
      <div className="relative rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] sm:h-[440px]">
        <div
          onClick={() => setShowAllPhotos(true)}
          className="md:col-span-2 h-full overflow-hidden cursor-pointer relative group"
        >
          <img
            src={galleryImages[0]}
            alt={`Phòng ${room.roomNumber} - Ảnh chính`}
            className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-300"
          />
        </div>

        <div className="hidden md:grid md:col-span-2 grid-cols-2 grid-rows-2 gap-2 h-full">
          {galleryImages.slice(1, 5).map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setShowAllPhotos(true)}
              className="overflow-hidden cursor-pointer relative group h-full"
            >
              <img
                src={imgUrl}
                alt={`Không gian phòng ${room.roomNumber} - ${idx + 2}`}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAllPhotos(true)}
          className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white border border-neutral-900 text-neutral-900 text-xs font-bold shadow-md flex items-center gap-2 hover:bg-neutral-100 transition-colors"
        >
          <Grid className="w-4 h-4" />
          Hiển thị tất cả ảnh
        </button>
      </div>

      {/* 3. Bố cục 2 Cột chuẩn Airbnb: Thông tin chi tiết (Trái) & Khung giữ phòng Sticky (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-2">
        {/* CỘT TRÁI (7/12): Toàn bộ thông tin chi tiết của phòng */}
        <div className="lg:col-span-7 space-y-8 divide-y divide-neutral-200">
          {/* Thông số tổng quan & Chủ nhà */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#222222]">
                Toàn bộ căn hộ {room.category || 'Studio'} tại {room.location || 'Cầu Giấy'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Diện tích <strong>{room.area} m²</strong> · Tầng <strong>{room.floor || 2}</strong> ·
                Tối đa <strong>{room.maxGuests || 2} người ở</strong> · WC khép kín riêng
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF385C] to-[#E61E4D] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
              HVA
            </div>
          </div>

          {/* 3 Điểm nổi bật kiểu Airbnb */}
          <div className="pt-6 space-y-5">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-[#FF385C] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#222222]">
                  Được khách thuê yêu thích tại {room.location || 'Hà Nội'}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Một trong những phòng được đánh giá cao nhất nhờ thiết kế thoáng sáng, an ninh vân
                  tay và cách âm tốt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#222222]">
                  Điện nước tính chuẩn bậc thang nhà nước (Đồng hồ riêng)
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Chỉ số bàn giao hiện tại: Điện <strong>{room.lastElecIndex || 0} kWh</strong> ·
                  Nước <strong>{room.lastWaterIndex || 0} m³</strong>. Không thu giá kinh doanh.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <UserCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#222222]">
                  Quản lý bởi Chủ nhà siêu cấp (Superhost)
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Hỗ trợ xử lý yêu cầu sửa chữa trực tuyến qua hệ thống trong vòng 2 giờ.
                </p>
              </div>
            </div>
          </div>

          {/* Bảng thông số kỹ thuật chi tiết của phòng */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-extrabold text-[#222222]">
              Thông tin chi tiết phòng {room.roomNumber}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/70">
                <span className="text-[11px] text-neutral-500 block">Mã định danh phòng</span>
                <span className="text-sm font-extrabold text-neutral-900">
                  Phòng {room.roomNumber}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/70">
                <span className="text-[11px] text-neutral-500 block">Giá thuê cố định</span>
                <span className="text-sm font-extrabold text-[#FF385C]">
                  {formatCurrency(room.price)}/tháng
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/70">
                <span className="text-[11px] text-neutral-500 block">Diện tích sử dụng</span>
                <span className="text-sm font-extrabold text-neutral-900">{room.area} m²</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/70">
                <span className="text-[11px] text-neutral-500 block">Khu vực / Quận</span>
                <span className="text-sm font-bold text-neutral-900">
                  {room.location || 'Quận Cầu Giấy'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/70">
                <span className="text-[11px] text-neutral-500 block">Chỉ số điện bàn giao</span>
                <span className="text-sm font-bold font-mono text-neutral-900">
                  {room.lastElecIndex || 0} kWh
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/70">
                <span className="text-[11px] text-neutral-500 block">Chỉ số nước bàn giao</span>
                <span className="text-sm font-bold font-mono text-neutral-900">
                  {room.lastWaterIndex || 0} m³
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-700 leading-relaxed pt-2">{room.description}</p>
          </div>

          {/* Tiện nghi có sẵn trong phòng */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-extrabold text-[#222222]">
              Phòng này có những tiện nghi gì cho bạn
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {amenitiesList.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200/80 bg-white text-xs sm:text-sm font-medium text-neutral-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FF385C] shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Công cụ tính thử tiền điện bậc thang & tổng chi phí hàng tháng */}
          <div className="pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#222222]">
                Bảng ước tính chi phí điện bậc thang hàng tháng
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Kéo thanh trượt số kWh điện dự kiến sử dụng để xem cách hệ thống tính tiền theo 6
                bậc thang nhà nước:
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F7F7] border border-neutral-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>Sản lượng điện dự kiến:</span>
                    <span className="text-[#FF385C] font-mono">{estimatedKwh} kWh/tháng</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="450"
                    step="10"
                    value={estimatedKwh}
                    onChange={(e) => setEstimatedKwh(Number(e.target.value))}
                    className="w-full accent-[#FF385C] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>Số khối nước dự kiến:</span>
                    <span className="text-cyan-600 font-mono">{estimatedWaterM3} m³/tháng</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={estimatedWaterM3}
                    onChange={(e) => setEstimatedWaterM3(Number(e.target.value))}
                    className="w-full accent-[#FF385C] cursor-pointer"
                  />
                </div>
              </div>

              {/* Bảng tách từng bậc */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600">
                    <tr>
                      <th className="py-2 px-3">Bậc thang</th>
                      <th className="py-2 px-3 text-right">Số kWh</th>
                      <th className="py-2 px-3 text-right">Đơn giá</th>
                      <th className="py-2 px-3 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {breakdown.map((b) => (
                      <tr key={b.tier}>
                        <td className="py-2 px-3 font-medium">{b.label}</td>
                        <td className="py-2 px-3 text-right font-mono">{b.kwh} kWh</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {formatCurrency(b.unitPrice)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold font-mono">
                          {formatCurrency(b.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Địa chỉ cụ thể */}
          <div className="pt-6 space-y-2">
            <h3 className="text-lg font-extrabold text-[#222222]">Nơi bạn sẽ sinh sống</h3>
            <p className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF385C]" />
              {room.address || `${room.location || 'Quận Cầu Giấy, Hà Nội'}`}
            </p>
            <p className="text-xs text-neutral-500">
              Khu dân trí cao, gần trường đại học, siêu thị, điểm xe buýt và trục đường chính.
            </p>
          </div>
        </div>

        {/* CỘT PHẢI (5/12): Khung Đặt lịch xem phòng / Báo giá Sticky chuẩn Airbnb */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.1)] space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-[#222222]">
                  {formatCurrency(room.price)}
                </span>
                <span className="text-xs text-neutral-500"> / tháng</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#222222]" />
                {room.rating || '4.96'} · <StatusBadge status={room.status} />
              </span>
            </div>

            {/* Khung chọn Ngày nhận phòng & Thời hạn hợp đồng giống hộp Check-in/Check-out của Airbnb */}
            <div className="rounded-2xl border border-neutral-300 overflow-hidden divide-y divide-neutral-300 text-xs">
              <div className="grid grid-cols-2 divide-x divide-neutral-300">
                <div className="p-3">
                  <label className="block text-[10px] font-extrabold uppercase text-neutral-800">
                    Ngày dọn vào
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full mt-1 text-xs font-medium text-neutral-700 focus:outline-none"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-extrabold uppercase text-neutral-800">
                    Thời hạn thuê
                  </label>
                  <select
                    value={leaseMonths}
                    onChange={(e) => setLeaseMonths(Number(e.target.value))}
                    className="w-full mt-1 text-xs font-semibold text-neutral-800 focus:outline-none bg-transparent"
                  >
                    <option value={6}>Hợp đồng 6 tháng</option>
                    <option value={12}>Hợp đồng 12 tháng</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-neutral-50 flex items-center justify-between">
                <span className="font-bold text-neutral-700">Số người ở tối đa:</span>
                <span className="font-bold text-neutral-900">{room.maxGuests || 2} cư dân</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setBookingSuccess(false);
                setBookingModalOpen(true);
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF385C] via-[#E61E4D] to-[#D70466] hover:brightness-105 text-white font-bold text-sm shadow-md transition-transform active:scale-[0.99]"
            >
              Đặt lịch xem phòng & Giữ chỗ ngay
            </button>

            <a
              href="tel:0988888888"
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-900 text-neutral-900 hover:bg-neutral-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-[#FF385C]" />
              Gọi trực tiếp Chủ trọ: 0988.888.888
            </a>

            <p className="text-center text-xs text-neutral-500">
              Bạn chưa bị trừ tiền ở bước này
            </p>

            {/* Chi tiết bảng tính dự kiến hàng tháng */}
            <div className="pt-4 border-t border-neutral-200 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600">
                <span className="underline">Tiền thuê phòng cố định</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {formatCurrency(room.price)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span className="underline">
                  Tiền điện bậc thang (~{estimatedKwh} kWh)
                </span>
                <span className="font-mono font-semibold text-neutral-900">
                  {formatCurrency(totalElecAmount)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span className="underline">
                  Tiền nước sinh hoạt (~{estimatedWaterM3} m³)
                </span>
                <span className="font-mono font-semibold text-neutral-900">
                  {formatCurrency(estimatedWaterCost)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span className="underline">Phí dịch vụ (Wifi, rác, vệ sinh)</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {formatCurrency(DEFAULT_SERVICE_FEE)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex justify-between font-extrabold text-base text-[#222222]">
                <span>Tổng dự kiến / tháng</span>
                <span className="font-mono text-[#FF385C]">
                  {formatCurrency(estimatedMonthlyTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Các phòng trống tương tự */}
      {room.similarRooms && room.similarRooms.length > 0 && (
        <div className="pt-10 border-t border-neutral-200 space-y-5">
          <h3 className="text-xl font-extrabold text-[#222222]">
            Các phòng đang trống khác bạn có thể thích
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {room.similarRooms.map((simRoom) => (
              <RoomCard key={simRoom._id} room={simRoom} isAdmin={false} />
            ))}
          </div>
        </div>
      )}

      {/* Modal Xem tất cả ảnh */}
      <Modal
        isOpen={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
        title={`Bộ sưu tập hình ảnh Phòng ${room.roomNumber} - ${room.location || ''}`}
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {galleryImages.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`Ảnh ${idx + 1}`}
              className="w-full h-64 object-cover rounded-2xl border border-neutral-200"
            />
          ))}
        </div>
      </Modal>

      {/* Modal Đặt lịch xem phòng */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Đặt lịch xem Phòng ${room.roomNumber} (${room.location || 'Cầu Giấy'})`}
      >
        {bookingSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-extrabold text-neutral-900">
              Đã ghi nhận lịch hẹn xem phòng {room.roomNumber}!
            </h4>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Chủ nhà sẽ liên hệ với bạn qua số điện thoại <strong>{visitorPhone}</strong> để đón
              bạn xem phòng vào ngày <strong>{moveInDate}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Họ và tên của bạn *
              </label>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Số điện thoại liên hệ *
              </label>
              <input
                type="tel"
                required
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white font-bold text-sm"
            >
              Xác nhận đặt lịch hẹn
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default RoomDetailPage;

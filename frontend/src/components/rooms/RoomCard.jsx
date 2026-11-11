import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Edit3, Trash2, User } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatCurrency, getRoomFallbackImage } from '../../utils/formatters';
import { getImageUrl } from '../../api/axiosClient';

/**
 * Thẻ Phòng chuẩn giao diện Airbnb (Ảnh bo góc vuông vức, nhãn "Được khách yêu thích", nút Tim, Sao đánh giá & Địa điểm)
 */
const RoomCard = ({ room, isAdmin = false, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  const coverImage =
    room.images && room.images.length > 0
      ? getImageUrl(room.images[0])
      : getRoomFallbackImage(room.roomNumber);

  const handleCardClick = () => {
    navigate(`/rooms/${room._id}`);
  };

  return (
    <div className="group flex flex-col justify-between cursor-pointer select-none">
      <div onClick={handleCardClick}>
        {/* Khung ảnh chuẩn Airbnb */}
        <div className="relative aspect-[20/19] w-full rounded-2xl overflow-hidden bg-neutral-200 mb-3">
          <img
            src={coverImage}
            alt={`Phòng ${room.roomNumber}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Top-left: Nhãn "Được khách yêu thích" (Guest favorite) chuẩn Airbnb */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {room.isGuestFavorite !== false ? (
              <span className="px-3 py-1 rounded-full bg-white/95 text-neutral-900 text-[11px] font-extrabold tracking-tight shadow-md">
                Được khách yêu thích
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-white/95 text-neutral-900 text-[11px] font-bold shadow-md">
                Phòng {room.roomNumber}
              </span>
            )}
            {isAdmin && <StatusBadge status={room.status} />}
          </div>

          {/* Top-right: Nút Trái tim yêu thích */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLiked((prev) => !prev);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full transition-transform active:scale-90 hover:scale-110"
            title="Lưu vào danh sách yêu thích"
          >
            <Heart
              className={`w-6 h-6 stroke-white stroke-[2] drop-shadow-md ${
                liked ? 'fill-[#FF385C] stroke-[#FF385C]' : 'fill-black/45'
              }`}
            />
          </button>

          {/* Chấm tròn báo bộ sưu tập nhiều ảnh */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        </div>

        {/* Thông tin dưới ảnh chuẩn bố cục Airbnb */}
        <div className="space-y-0.5 text-sm">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-[#222222] truncate leading-snug">
              Phòng {room.roomNumber} tại {room.location || 'Quận Cầu Giấy, Hà Nội'}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#222222] shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
              {room.rating || '4.95'}
            </span>
          </div>

          <p className="text-neutral-500 text-xs truncate">
            {room.title || room.description}
          </p>

          <p className="text-neutral-500 text-xs">
            Diện tích {room.area} m² · Tầng {room.floor || 2} ·{' '}
            <span className="text-emerald-700 font-semibold">{room.status}</span>
          </p>

          <div className="pt-1 flex items-baseline gap-1">
            <span className="font-extrabold text-[#222222] underline decoration-neutral-300 underline-offset-2">
              {formatCurrency(room.price)}
            </span>
            <span className="text-xs text-neutral-500">/ tháng · Điện bậc thang</span>
          </div>

          {isAdmin && room.activeContract?.tenant && (
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-1.5 text-xs text-neutral-700">
              <User className="w-3.5 h-3.5 text-[#FF385C] shrink-0" />
              <span className="truncate">
                Khách thuê: <strong>{room.activeContract.tenant.name}</strong> (
                {room.activeContract.tenant.phone})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nút quản trị nếu là Admin */}
      {isAdmin && (
        <div className="pt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(room);
            }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Sửa phòng
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(room);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoomCard;

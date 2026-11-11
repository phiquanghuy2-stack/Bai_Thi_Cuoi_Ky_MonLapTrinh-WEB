import React from 'react';
import { Search, MapPin, RotateCcw } from 'lucide-react';

const POPULAR_LOCATIONS = [
  { label: 'Tất cả địa điểm', value: '' },
  { label: 'Cầu Giấy, Hà Nội', value: 'Cầu Giấy' },
  { label: 'Đống Đa, Hà Nội', value: 'Đống Đa' },
  { label: 'Tây Hồ, Hà Nội', value: 'Tây Hồ' },
  { label: 'Thanh Xuân, Hà Nội', value: 'Thanh Xuân' },
  { label: 'Sơn Trà, Đà Nẵng', value: 'Sơn Trà' },
  { label: 'Mỹ An, Đà Nẵng', value: 'Mỹ An' },
  { label: 'Bình Thạnh, TP.HCM', value: 'Bình Thạnh' },
];

/**
 * Thanh tìm kiếm & lọc dạng viên thuốc (Pill Search Bar) chuẩn giao diện Airbnb
 * Tích hợp bộ lọc Địa điểm (Where), Khoảng giá, Diện tích và Trạng thái
 */
const RoomFilterBar = ({
  filters,
  onChange,
  onReset,
  showStatusFilter = false,
}) => {
  const handleInput = (e) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value,
    });
  };

  const handleSelectLocationChip = (locValue) => {
    onChange({
      ...filters,
      location: locValue,
    });
  };

  const hasActiveFilter = Boolean(
    filters.location ||
      filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minArea ||
      filters.status
  );

  return (
    <div className="space-y-4">
      {/* Airbnb Pill Search Bar */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl sm:rounded-full border border-neutral-300 shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-shadow p-2 sm:p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 items-center divide-y sm:divide-y-0 sm:divide-x divide-neutral-200">
          {/* 1. Địa điểm (Where) */}
          <div className="lg:col-span-4 px-5 py-2.5 rounded-full hover:bg-neutral-100/80 transition-colors">
            <label className="block text-[11px] font-extrabold tracking-tight text-neutral-900">
              Địa điểm
            </label>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF385C] shrink-0" />
              <input
                type="text"
                name="location"
                value={filters.location || ''}
                onChange={handleInput}
                placeholder="Tìm khu vực, quận, đường phố..."
                className="w-full bg-transparent text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* 2. Khoảng giá thuê */}
          <div className="lg:col-span-3 px-4 py-2.5 hover:bg-neutral-100/80 transition-colors">
            <label className="block text-[11px] font-extrabold tracking-tight text-neutral-900">
              Khoảng giá (VNĐ/tháng)
            </label>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice || ''}
                onChange={handleInput}
                placeholder="Từ 2tr"
                className="w-1/2 bg-transparent text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none font-medium"
              />
              <span className="text-neutral-300">-</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice || ''}
                onChange={handleInput}
                placeholder="Đến 5tr"
                className="w-1/2 bg-transparent text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* 3. Diện tích & Trạng thái */}
          <div className="lg:col-span-2 px-4 py-2.5 hover:bg-neutral-100/80 transition-colors">
            <label className="block text-[11px] font-extrabold tracking-tight text-neutral-900">
              {showStatusFilter ? 'Trạng thái' : 'Diện tích tối thiểu'}
            </label>
            {showStatusFilter ? (
              <select
                name="status"
                value={filters.status || ''}
                onChange={handleInput}
                className="w-full bg-transparent text-xs sm:text-sm text-neutral-800 focus:outline-none font-medium mt-0.5"
              >
                <option value="">Tất cả phòng</option>
                <option value="Trống">Phòng Trống</option>
                <option value="Đang thuê">Đang thuê</option>
                <option value="Đang sửa">Đang sửa</option>
              </select>
            ) : (
              <input
                type="number"
                name="minArea"
                value={filters.minArea || ''}
                onChange={handleInput}
                placeholder="VD: 25 m²"
                className="w-full bg-transparent text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none font-medium mt-0.5"
              />
            )}
          </div>

          {/* 4. Từ khóa / Số phòng + Nút Kính lúp Đỏ Airbnb */}
          <div className="lg:col-span-3 pl-4 pr-1.5 py-1.5 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <label className="block text-[11px] font-extrabold tracking-tight text-neutral-900">
                Mã phòng / Tiện ích
              </label>
              <input
                type="text"
                name="search"
                value={filters.search || ''}
                onChange={handleInput}
                placeholder="P103, ban công..."
                className="w-full bg-transparent text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none font-medium mt-0.5"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={onReset}
                  title="Xóa bộ lọc"
                  className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                className="w-11 h-11 rounded-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] hover:brightness-105 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Các nút chọn nhanh Địa điểm (Tìm ở đâu lọc ở đó) */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {POPULAR_LOCATIONS.map((loc) => {
          const isSelected = (filters.location || '') === loc.value;
          return (
            <button
              key={loc.label}
              type="button"
              onClick={() => handleSelectLocationChip(loc.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
              <MapPin
                className={`w-3 h-3 ${isSelected ? 'text-[#FF385C]' : 'text-neutral-400'}`}
              />
              {loc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoomFilterBar;

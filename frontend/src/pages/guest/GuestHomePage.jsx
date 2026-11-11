import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, Zap, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { fetchRooms } from '../../store/slices/roomSlice';
import { useDebounce } from '../../hooks/useDebounce';
import RoomFilterBar from '../../components/rooms/RoomFilterBar';
import RoomCard from '../../components/rooms/RoomCard';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ELECTRICITY_TIERS, formatCurrency } from '../../utils/formatters';

const CATEGORIES = [
  { id: 'All', label: 'Tất cả phòng', icon: '🌍' },
  { id: 'Studio', label: 'Căn hộ Studio', icon: '🏡' },
  { id: 'Duplex', label: 'Gác lửng Duplex', icon: '🪜' },
  { id: 'Ban công', label: 'Ban công thoáng', icon: '🌿' },
  { id: 'Full nội thất', label: 'Full nội thất', icon: '🛋️' },
];

const INITIAL_FILTERS = {
  search: '',
  location: '',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  minArea: '',
};

const GuestHomePage = () => {
  const dispatch = useDispatch();
  const { items: rooms, pagination, loading } = useSelector((state) => state.rooms);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  const debouncedFilters = useDebounce(filters, 350);

  const loadRooms = useCallback(() => {
    dispatch(
      fetchRooms({
        search: debouncedFilters.search,
        location: debouncedFilters.location,
        category: debouncedFilters.category === 'All' ? '' : debouncedFilters.category,
        minPrice: debouncedFilters.minPrice,
        maxPrice: debouncedFilters.maxPrice,
        minArea: debouncedFilters.minArea,
        status: 'Trống',
        guestOnly: 'true',
        page,
        limit: 12,
      })
    );
  }, [dispatch, debouncedFilters, page]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleCategoryChange = (catId) => {
    setFilters((prev) => ({
      ...prev,
      category: catId,
    }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Top Category Tabs + Airbnb Pill Search Header */}
      <section className="bg-white border-b border-neutral-200/80 pt-4 pb-6 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Category Tabs giống hệt Airbnb */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex flex-col items-center gap-1.5 pb-2.5 border-b-2 transition-all shrink-0 ${
                    isActive
                      ? 'border-neutral-900 text-neutral-900 font-bold'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs tracking-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Thanh tìm kiếm & lọc địa điểm dạng Pill giống Airbnb */}
          <RoomFilterBar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            showStatusFilter={false}
          />
        </div>
      </section>

      {/* Danh sách phòng dạng lưới 4 cột chuẩn Airbnb */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight">
              {filters.location
                ? `Phòng trống tại ${filters.location}`
                : 'Khám phá phòng trọ & căn hộ đang trống'}
            </h2>
            <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          <span className="text-xs font-semibold text-neutral-500">
            Hiển thị <strong>{pagination?.total || 0}</strong> phòng sẵn sàng nhận khách
          </span>
        </div>

        {loading ? (
          <Spinner label="Đang tìm phòng phù hợp theo địa điểm..." />
        ) : rooms.length === 0 ? (
          <EmptyState
            title="Không tìm thấy phòng trống tại địa điểm này"
            description="Hãy thử chọn địa điểm khác (VD: Cầu Giấy, Đống Đa, Sơn Trà, Mỹ An) hoặc nhấn Đặt lại bộ lọc."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-9">
              {rooms.map((room) => (
                <RoomCard key={room._id} room={room} isAdmin={false} />
              ))}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </>
        )}
      </section>

      {/* Section 2: Biểu giá điện 6 bậc thang & Cam kết minh bạch (Phong cách Explore Experiences của Airbnb) */}
      <section
        id="electricity-tiers"
        className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-8 space-y-5"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight">
            Cam kết tính tiền điện 6 bậc thang nhà nước
          </h2>
          <span className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ELECTRICITY_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 hover:shadow-lg transition-all"
            >
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#FF385C] text-[11px] font-bold">
                <Zap className="w-3 h-3" /> Bậc {tier.tier}
              </span>
              <p className="text-xs font-semibold text-neutral-500 mt-2">{tier.label}</p>
              <p className="text-lg font-extrabold text-[#222222] mt-1">
                {formatCurrency(tier.price)}
                <span className="text-xs font-normal text-neutral-500">/kWh</span>
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-[#F7F7F7] flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#FF385C] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-neutral-900">
                Hợp đồng minh bạch, tự động giữ phòng
              </h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Khi ký hợp đồng Hiệu lực, trạng thái phòng tự động khóa sang &quot;Đang thuê&quot;
                để bảo vệ quyền lợi cư dân.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7F7F7] flex items-start gap-3.5">
            <Sparkles className="w-6 h-6 text-[#FF385C] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-neutral-900">
                Xuất hóa đơn PDF & Gửi email tự động
              </h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Mỗi kỳ hóa đơn đều có bảng diễn giải chi tiết số kWh từng bậc thang và hỗ trợ tải
                file PDF sắc nét.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7F7F7] flex items-start gap-3.5">
            <MapPin className="w-6 h-6 text-[#FF385C] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-neutral-900">
                Đa dạng vị trí trung tâm đắc địa
              </h4>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Hệ thống phòng trọ & căn hộ tại Cầu Giấy, Đống Đa, Tây Hồ (Hà Nội), Sơn Trà, Mỹ An
                (Đà Nẵng) và Bình Thạnh (TP.HCM).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuestHomePage;

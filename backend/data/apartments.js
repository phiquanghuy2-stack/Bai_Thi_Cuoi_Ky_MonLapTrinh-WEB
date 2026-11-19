// Dữ liệu 20 căn hộ bổ sung (P701 → P1104).
// Dùng chung cho seed.js (seed toàn bộ) và seedApartments.js (chỉ thêm căn hộ, không xóa dữ liệu cũ).

// Ảnh lưu trong MongoDB (nạp từ backend/data/images), phục vụ qua GET /api/images/:name
const img = (id) => `/api/images/${id}.jpg`;

const PHOTOS = [
  '1522708323590-d24dbb6b0267',
  '1502672260266-1c1ef2d93688',
  '1560448204-e02f11c3d0e2',
  '1556909114-f6e7ad7d3136',
  '1493809842364-78817add7ffb',
  '1505693416388-ac5ce068fe85',
  '1512918728675-ed5a9ecdebfd',
  '1484154218962-a197022b5858',
  '1536376072261-38c75010e6c9',
  '1554995207-c18c203602cb',
  '1598928506311-c55ded91a20c',
  '1513694203232-719a280e022f',
  '1556911220-bff31c812dba',
  '1584622650111-993a426fbf0a',
  '1552321554-5fefe8c9ef14',
];

// Ảnh bìa lấy theo thứ tự, 4 ảnh phụ xoay vòng để mỗi căn có bộ ảnh khác nhau
const gallery = (i) => [
  img(PHOTOS[i % PHOTOS.length], 1000, 85),
  ...[3, 6, 9, 12].map((step) => img(PHOTOS[(i + step) % PHOTOS.length])),
];

const raw = [
  // ── Tầng 7 ─ Hà Nội ──────────────────────────────────────────────
  {
    roomNumber: 'P701',
    title: 'Studio hiện đại cạnh ĐH Quốc gia Hà Nội',
    location: 'Quận Cầu Giấy, Hà Nội',
    address: 'Số 144 Xuân Thủy, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    category: 'Studio',
    price: 3600000,
    area: 26,
    maxGuests: 2,
    rating: 4.9,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Studio mới hoàn thiện, đi bộ 3 phút tới ĐH Quốc gia và ĐH Sư phạm. Giường 1m6, bàn làm việc gỗ, bếp từ đôi, tủ lạnh mini, cửa sổ lớn hướng Đông Nam.',
  },
  {
    roomNumber: 'P702',
    title: 'Căn hộ ban công view hồ Nghĩa Tân',
    location: 'Quận Cầu Giấy, Hà Nội',
    address: 'Ngõ 2 Hoàng Quốc Việt, Phường Nghĩa Đô, Quận Cầu Giấy, Hà Nội',
    category: 'Ban công',
    price: 4200000,
    area: 32,
    maxGuests: 2,
    rating: 4.93,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Ban công rộng 4m² nhìn thẳng ra hồ, buổi chiều lộng gió. Phòng khách và phòng ngủ tách biệt bằng vách kính, có máy giặt riêng và sàn gỗ chống ẩm.',
  },
  {
    roomNumber: 'P703',
    title: 'Duplex gác xép cao 4m phố Chùa Láng',
    location: 'Quận Đống Đa, Hà Nội',
    address: 'Ngõ 35 Chùa Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội',
    category: 'Duplex',
    price: 4800000,
    area: 35,
    maxGuests: 3,
    rating: 4.88,
    isGuestFavorite: false,
    status: 'Trống',
    description:
      'Thiết kế Duplex với gác ngủ riêng, tầng dưới là phòng khách và bếp. Gần ĐH Ngoại thương, ĐH Ngân hàng. Cầu thang gỗ chắc chắn, có lan can an toàn.',
  },
  {
    roomNumber: 'P704',
    title: 'Căn hộ Full nội thất gần Hồ Đống Đa',
    location: 'Quận Đống Đa, Hà Nội',
    address: 'Số 18 Đặng Văn Ngữ, Phường Trung Tự, Quận Đống Đa, Hà Nội',
    category: 'Full nội thất',
    price: 5200000,
    area: 38,
    maxGuests: 2,
    rating: 4.95,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Bàn giao full nội thất: sofa nỉ, smart TV 50 inch, tủ lạnh Inverter, lò vi sóng, máy giặt sấy. Chỉ việc xách vali vào ở. Gần chợ Kim Liên và bệnh viện Bạch Mai.',
  },

  // ── Tầng 8 ─ Hà Nội ──────────────────────────────────────────────
  {
    roomNumber: 'P801',
    title: 'Căn hộ ban công lộng gió ven Hồ Tây',
    location: 'Quận Tây Hồ, Hà Nội',
    address: 'Ngõ 52 Tô Ngọc Vân, Phường Quảng An, Quận Tây Hồ, Hà Nội',
    category: 'Ban công',
    price: 6500000,
    area: 42,
    maxGuests: 2,
    rating: 4.97,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Căn hộ yên tĩnh trong khu phố Tây, ban công trồng cây xanh, đi bộ 2 phút ra hồ. Phù hợp người đi làm hoặc chuyên gia nước ngoài. Có dọn phòng 2 lần/tuần.',
  },
  {
    roomNumber: 'P802',
    title: 'Duplex cao cấp phố Xuân Diệu',
    location: 'Quận Tây Hồ, Hà Nội',
    address: 'Số 29 Xuân Diệu, Phường Quảng An, Quận Tây Hồ, Hà Nội',
    category: 'Duplex',
    price: 8500000,
    area: 55,
    maxGuests: 4,
    rating: 4.98,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Duplex 2 phòng ngủ, trần cao, cửa kính kịch trần. Bếp đảo, máy rửa bát, bồn tắm nằm. Hầm để xe ô tô, bảo vệ 24/7. Lý tưởng cho gia đình nhỏ.',
  },
  {
    roomNumber: 'P803',
    title: 'Studio tiết kiệm gần Royal City',
    location: 'Quận Thanh Xuân, Hà Nội',
    address: 'Ngõ 214 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội',
    category: 'Studio',
    price: 2900000,
    area: 22,
    maxGuests: 1,
    rating: 4.84,
    isGuestFavorite: false,
    status: 'Trống',
    description:
      'Phòng studio nhỏ gọn cho sinh viên ĐH Khoa học Tự nhiên, ĐH KHXH&NV. Có điều hòa, nóng lạnh, kệ bếp riêng. Đi bộ 5 phút ra Royal City và ga tàu Cát Linh – Hà Đông.',
  },
  {
    roomNumber: 'P804',
    title: 'Căn hộ Full nội thất cạnh ga Thượng Đình',
    location: 'Quận Thanh Xuân, Hà Nội',
    address: 'Số 61 Khương Đình, Phường Hạ Đình, Quận Thanh Xuân, Hà Nội',
    category: 'Full nội thất',
    price: 4500000,
    area: 34,
    maxGuests: 2,
    rating: 4.9,
    isGuestFavorite: true,
    status: 'Đang sửa',
    description:
      'Đang sơn sửa lại tường và thay rèm mới, dự kiến bàn giao trong 1 tuần. Nội thất gỗ sồi đồng bộ, giường 1m8, tủ áo 3 cánh, bếp đầy đủ dụng cụ nấu ăn.',
  },

  // ── Tầng 9 ─ TP.HCM ──────────────────────────────────────────────
  {
    roomNumber: 'P901',
    title: 'Studio ban công gần Landmark 81',
    location: 'Quận Bình Thạnh, TP.HCM',
    address: 'Đường Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP.HCM',
    category: 'Ban công',
    price: 5500000,
    area: 30,
    maxGuests: 2,
    rating: 4.94,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Ban công nhìn về sông Sài Gòn và Landmark 81. Nội thất tông trắng – gỗ, rèm cản sáng 100%, máy lọc nước RO. Gần công viên Vinhomes Central Park.',
  },
  {
    roomNumber: 'P902',
    title: 'Phòng Studio gần ĐH Văn Lang cơ sở 3',
    location: 'Quận Bình Thạnh, TP.HCM',
    address: 'Đường Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, TP.HCM',
    category: 'Studio',
    price: 3300000,
    area: 24,
    maxGuests: 2,
    rating: 4.87,
    isGuestFavorite: false,
    status: 'Trống',
    description:
      'Phòng mới xây, sạch sẽ, có thang máy và bãi xe rộng. Giờ giấc tự do, khóa vân tay. Cách ĐH Văn Lang 5 phút đi bộ, gần chợ Bà Chiểu.',
  },
  {
    roomNumber: 'P903',
    title: 'Căn hộ dịch vụ Full nội thất trung tâm Quận 1',
    location: 'Quận 1, TP.HCM',
    address: 'Đường Nguyễn Trãi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM',
    category: 'Full nội thất',
    price: 9000000,
    area: 45,
    maxGuests: 2,
    rating: 4.96,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Căn hộ dịch vụ cao cấp ngay trung tâm, đi bộ ra chợ Bến Thành và phố đi bộ Nguyễn Huệ. Dọn phòng hằng ngày, thay ga gối 2 lần/tuần, có lễ tân.',
  },
  {
    roomNumber: 'P904',
    title: 'Duplex phong cách Indochine tại Quận 3',
    location: 'Quận 3, TP.HCM',
    address: 'Đường Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
    category: 'Duplex',
    price: 7800000,
    area: 48,
    maxGuests: 3,
    rating: 4.92,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Duplex trang trí phong cách Đông Dương: gạch bông, gỗ tối màu, quạt trần mây tre. Tầng trên phòng ngủ, tầng dưới phòng khách và bếp. Gần Hồ Con Rùa.',
  },

  // ── Tầng 10 ─ TP.HCM + Đà Nẵng ───────────────────────────────────
  {
    roomNumber: 'P1001',
    title: 'Studio gần Làng Đại học Thủ Đức',
    location: 'Thành phố Thủ Đức, TP.HCM',
    address: 'Đường Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, TP.HCM',
    category: 'Studio',
    price: 2700000,
    area: 20,
    maxGuests: 2,
    rating: 4.82,
    isGuestFavorite: false,
    status: 'Trống',
    description:
      'Phòng giá mềm cho sinh viên ĐH Sư phạm Kỹ thuật, gần tuyến Metro số 1. Có gác nhỏ để đồ, WC riêng, điều hòa. Khu dân cư yên tĩnh, an ninh tốt.',
  },
  {
    roomNumber: 'P1002',
    title: 'Căn hộ ban công view biển Mỹ Khê',
    location: 'Quận Sơn Trà, Đà Nẵng',
    address: 'Đường Hồ Nghinh, Phường Phước Mỹ, Quận Sơn Trà, Đà Nẵng',
    category: 'Ban công',
    price: 6000000,
    area: 40,
    maxGuests: 3,
    rating: 4.97,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Cách biển Mỹ Khê 200m, ban công đón bình minh trên biển. Có hồ bơi chung trên sân thượng, cho thuê xe máy tại chỗ. Phù hợp làm việc từ xa.',
  },
  {
    roomNumber: 'P1003',
    title: 'Studio yên tĩnh gần cầu Rồng',
    location: 'Quận Hải Châu, Đà Nẵng',
    address: 'Đường Trần Phú, Phường Phước Ninh, Quận Hải Châu, Đà Nẵng',
    category: 'Studio',
    price: 3500000,
    area: 27,
    maxGuests: 2,
    rating: 4.89,
    isGuestFavorite: false,
    status: 'Trống',
    description:
      'Nằm giữa trung tâm Hải Châu, đi bộ ra cầu Rồng và chợ Hàn. Phòng có cửa sổ lớn, bếp nhỏ, máy giặt chung tầng. Tối cuối tuần xem cầu Rồng phun lửa.',
  },
  {
    roomNumber: 'P1004',
    title: 'Duplex sân vườn khu phố biển An Thượng',
    location: 'Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
    address: 'Đường An Thượng 4, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng',
    category: 'Duplex',
    price: 8000000,
    area: 60,
    maxGuests: 4,
    rating: 4.96,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Duplex có sân vườn nhỏ phía trước, 2 phòng ngủ, 2 WC. Khu An Thượng sầm uất với nhà hàng, quán cà phê; đi bộ 5 phút ra biển Mỹ An.',
  },

  // ── Tầng 11 ─ Hà Nội + Đà Nẵng ───────────────────────────────────
  {
    roomNumber: 'P1101',
    title: 'Căn hộ Full nội thất phố cổ Hoàn Kiếm',
    location: 'Quận Hoàn Kiếm, Hà Nội',
    address: 'Phố Hàng Bạc, Phường Hàng Buồm, Quận Hoàn Kiếm, Hà Nội',
    category: 'Full nội thất',
    price: 7500000,
    area: 36,
    maxGuests: 2,
    rating: 4.95,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Căn hộ trong lòng phố cổ, cách Hồ Gươm 300m. Cửa cách âm, nội thất mới 100%, có máy lọc không khí. Tối cuối tuần ra phố đi bộ chỉ vài bước chân.',
  },
  {
    roomNumber: 'P1102',
    title: 'Studio ban công gần Times City',
    location: 'Quận Hai Bà Trưng, Hà Nội',
    address: 'Ngõ 460 Minh Khai, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Hà Nội',
    category: 'Ban công',
    price: 3800000,
    area: 28,
    maxGuests: 2,
    rating: 4.86,
    isGuestFavorite: false,
    status: 'Trống',
    description:
      'Studio có ban công phơi đồ riêng, gần Times City và ĐH Kinh tế Quốc dân. Thang máy, camera hành lang, gửi xe miễn phí 1 xe máy.',
  },
  {
    roomNumber: 'P1103',
    title: 'Căn hộ Full nội thất gần sân bay Đà Nẵng',
    location: 'Quận Thanh Khê, Đà Nẵng',
    address: 'Đường Điện Biên Phủ, Phường Chính Gián, Quận Thanh Khê, Đà Nẵng',
    category: 'Full nội thất',
    price: 4300000,
    area: 33,
    maxGuests: 2,
    rating: 4.88,
    isGuestFavorite: false,
    status: 'Đang sửa',
    description:
      'Đang thay mới máy lạnh và bình nóng lạnh, bàn giao sau 5 ngày. Cách sân bay 10 phút, phù hợp người hay đi công tác. Nội thất đầy đủ, có bàn làm việc rộng.',
  },
  {
    roomNumber: 'P1104',
    title: 'Studio penthouse sân thượng Cầu Giấy',
    location: 'Quận Cầu Giấy, Hà Nội',
    address: 'Ngõ 165 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
    category: 'Studio',
    price: 5000000,
    area: 36,
    maxGuests: 2,
    rating: 4.94,
    isGuestFavorite: true,
    status: 'Trống',
    description:
      'Studio tầng cao nhất, có lối ra sân thượng riêng để trồng cây và ngắm hoàng hôn. Trần cao, nhiều ánh sáng, bếp đầy đủ và máy giặt riêng.',
  },
];

const apartments = raw.map((room, i) => ({
  ...room,
  floor: Number(room.roomNumber.slice(1, -2)),
  images: gallery(i),
  // Chỉ số điện/nước khởi điểm khác nhau cho từng căn
  lastElecIndex: 200 + i * 37,
  lastWaterIndex: 20 + i * 3,
}));

module.exports = apartments;

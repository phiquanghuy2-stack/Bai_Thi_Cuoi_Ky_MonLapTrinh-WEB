const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Room = require('./models/Room');
const Contract = require('./models/Contract');
const Invoice = require('./models/Invoice');
const RepairRequest = require('./models/RepairRequest');
const { calculateInvoiceAmounts } = require('./utils/calcElectricity');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB để khởi tạo dữ liệu mẫu HVA HOMESTAY...');

    await Promise.all([
      RepairRequest.deleteMany({}),
      Invoice.deleteMany({}),
      Contract.deleteMany({}),
      Room.deleteMany({}),
      User.deleteMany({}),
    ]);

    await User.create({
      name: 'Ban Quản Lý HVA HOMESTAY',
      email: 'admin@nhatro.vn',
      password: 'password123',
      role: 'admin',
      phone: '0988888888',
    });

    const tenants = await User.create([
      {
        name: 'Trần Minh Tuấn',
        email: 'tuan@gmail.com',
        password: 'password123',
        role: 'tenant',
        phone: '0912345671',
      },
      {
        name: 'Lê Thị Hương',
        email: 'huong@gmail.com',
        password: 'password123',
        role: 'tenant',
        phone: '0912345672',
      },
      {
        name: 'Phạm Quốc Bảo',
        email: 'bao@gmail.com',
        password: 'password123',
        role: 'tenant',
        phone: '0912345673',
      },
      {
        name: 'Hoàng Ngọc Ánh',
        email: 'anh@gmail.com',
        password: 'password123',
        role: 'tenant',
        phone: '0912345674',
      },
      {
        name: 'Vũ Đức Thắng',
        email: 'thang@gmail.com',
        password: 'password123',
        role: 'tenant',
        phone: '0912345675',
      },
    ]);

    // Tạo 22 Phòng trọ / Căn hộ dịch vụ đa dạng Địa điểm (Hà Nội, Đà Nẵng, TP.HCM) & Bộ 5 ảnh Bento Gallery
    const rooms = await Room.create([
      {
        roomNumber: 'P101',
        title: 'Studio Bắc Âu ngập tràn nắng tại Cầu Giấy',
        location: 'Quận Cầu Giấy, Hà Nội',
        address: 'Ngõ 76 Duy Tân, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
        category: 'Studio',
        price: 3200000,
        area: 25,
        floor: 2,
        maxGuests: 2,
        rating: 4.96,
        isGuestFavorite: true,
        status: 'Đang thuê',
        description:
          'Căn hộ Studio thiết kế tối giản phong cách Bắc Âu, cửa sổ kính lớn đón ánh sáng tự nhiên cả ngày. Trang bị sẵn điều hòa Inverter tiết kiệm điện, giường gỗ sồi, nệm cao su non, tủ quần áo âm tường và khu bếp nấu riêng biệt có máy hút mùi.',
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 1280,
        lastWaterIndex: 115,
      },
      {
        roomNumber: 'P102',
        title: 'Căn hộ góc 2 mặt thoáng có Ban công riêng',
        location: 'Quận Cầu Giấy, Hà Nội',
        address: 'Số 120 Xuân Thủy, Quận Cầu Giấy, Hà Nội',
        category: 'Ban công',
        price: 3500000,
        area: 28,
        floor: 3,
        maxGuests: 2,
        rating: 4.92,
        isGuestFavorite: true,
        status: 'Đang thuê',
        description:
          'Căn góc 2 mặt thoáng cực kỳ mát mẻ, đối diện công viên Cầu Giấy. Bàn giao full nội thất cao cấp: sofa dài, tivi thông minh, tủ lạnh 2 cánh, máy giặt lồng ngang riêng trên ban công và khóa vân tay an toàn tuyệt đối.',
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 960,
        lastWaterIndex: 88,
      },
      {
        roomNumber: 'P103',
        title: 'Phòng Studio ấm cúng tại Quận Sơn Trà',
        location: 'Quận Sơn Trà, Đà Nẵng',
        address: 'Đường Phạm Văn Đồng, Quận Sơn Trà, Đà Nẵng',
        category: 'Studio',
        price: 2800000,
        area: 24,
        floor: 2,
        maxGuests: 2,
        rating: 4.98,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Chỉ 5 phút đi bộ ra biển Mỹ Khê. Phòng thiết kế gam màu vàng kem ấm áp, trang bị đầy đủ giường nệm êm ái, bàn làm việc nhìn ra cửa sổ lớn, khu vực bếp lát gạch bông cổ điển và nhà vệ sinh khép kín có vách kính tắm đứng.',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 420,
        lastWaterIndex: 45,
      },
      {
        roomNumber: 'P104',
        title: 'Căn hộ Duplex gác lửng tại Mỹ An',
        location: 'Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
        address: 'Khu phố Tây An Thượng, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng',
        category: 'Duplex',
        price: 3400000,
        area: 30,
        floor: 3,
        maxGuests: 3,
        rating: 5.0,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Căn hộ Duplex trần cao 4.5m với gác lửng gỗ sang trọng tách biệt hoàn toàn không gian ngủ và phòng khách bên dưới. Nằm ngay trung tâm khu phố An Thượng - Mỹ An sầm uất, yên tĩnh, an ninh thẻ từ thang máy.',
        images: [
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 210,
        lastWaterIndex: 25,
      },
      {
        roomNumber: 'P201',
        title: 'Executive Suite Full Nội Thất tại Đống Đa',
        location: 'Quận Đống Đa, Hà Nội',
        address: 'Phố Thái Hà, Quận Đống Đa, Hà Nội',
        category: 'Full nội thất',
        price: 3800000,
        area: 30,
        floor: 2,
        maxGuests: 2,
        rating: 4.94,
        isGuestFavorite: true,
        status: 'Đang thuê',
        description:
          'Căn hộ dịch vụ cao cấp trung tâm Thái Hà - Đống Đa. Trang bị đầy đủ từ A-Z: Smart TV 50 inch, tủ lạnh Inverter, máy giặt sấy riêng, bàn ăn mặt đá, hệ thống lọc nước uống trực tiếp tại vòi.',
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 1540,
        lastWaterIndex: 132,
      },
      {
        roomNumber: 'P202',
        title: 'Loft Gác Lửng Hiện Đại tại Thanh Xuân',
        location: 'Quận Thanh Xuân, Hà Nội',
        address: 'Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
        category: 'Duplex',
        price: 3300000,
        area: 26,
        floor: 2,
        maxGuests: 2,
        rating: 4.91,
        isGuestFavorite: false,
        status: 'Đang thuê',
        description:
          'Phòng có gác lửng rộng 10m2, cửa sổ lớn đón nắng tự nhiên, cách ga tàu điện trên cao 200m.',
        images: [
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 810,
        lastWaterIndex: 74,
      },
      {
        roomNumber: 'P203',
        title: 'Studio Ban Công Xanh Mát tại Quận Cầu Giấy',
        location: 'Quận Cầu Giấy, Hà Nội',
        address: 'Phố Trung Kính, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội',
        category: 'Ban công',
        price: 3100000,
        area: 25,
        floor: 3,
        maxGuests: 2,
        rating: 4.97,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Phòng mới hoàn thiện 100% tại phố Trung Kính - Cầu Giấy. Có ban công riêng trồng cây xanh và phơi đồ thoáng gió, nhà vệ sinh trang bị thiết bị Inax cao cấp, khóa cửa vân tay và chỗ để xe tầng 1 miễn phí.',
        images: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 310,
        lastWaterIndex: 30,
      },
      {
        roomNumber: 'P301',
        title: 'Penthouse Mini View Hồ Tây Lộng Gió',
        location: 'Quận Tây Hồ, Hà Nội',
        address: 'Đường Trích Sài, Quận Tây Hồ, Hà Nội',
        category: 'Full nội thất',
        price: 4200000,
        area: 35,
        floor: 5,
        maxGuests: 3,
        rating: 4.99,
        isGuestFavorite: true,
        status: 'Đang thuê',
        description:
          'Căn hộ diện tích lớn 35m2 có sân thượng uống trà nhìn ra Hồ Tây. Trang bị nội thất nhập khẩu, bồn tắm nằm thư giãn.',
        images: [
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 1890,
        lastWaterIndex: 164,
      },
      {
        roomNumber: 'P302',
        title: 'Phòng Đơn Tiết Kiệm tại Quận Thanh Xuân',
        location: 'Quận Thanh Xuân, Hà Nội',
        address: 'Phố Vũ Trọng Phụng, Quận Thanh Xuân, Hà Nội',
        category: 'Studio',
        price: 2600000,
        area: 20,
        floor: 3,
        maxGuests: 2,
        rating: 4.89,
        isGuestFavorite: false,
        status: 'Trống',
        description:
          'Phòng đơn gọn gàng, sạch sẽ, cực kỳ phù hợp cho sinh viên hoặc người đi làm cần không gian yên tĩnh. Giờ giấc tự do 24/24, điện nước tính chuẩn giá bậc thang nhà nước.',
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 150,
        lastWaterIndex: 20,
      },
      {
        roomNumber: 'P303',
        title: 'Căn hộ Dịch vụ Cao cấp tại Quận Bình Thạnh',
        location: 'Quận Bình Thạnh, TP.HCM',
        address: 'Đường Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
        category: 'Full nội thất',
        price: 3600000,
        area: 28,
        floor: 4,
        maxGuests: 2,
        rating: 4.95,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Căn hộ dịch vụ ngay sát Landmark 81, di chuyển sang Quận 1 chỉ 5 phút. Nội thất gỗ ấm cúng, có sofa tiếp khách, kệ bếp rộng rãi và cửa sổ kính cách âm tuyệt đối.',
        images: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 500,
        lastWaterIndex: 52,
      },
      {
        roomNumber: 'P304',
        title: 'Căn hộ Ban Công Rộng tại Quận Đống Đa',
        location: 'Quận Đống Đa, Hà Nội',
        address: 'Phố Chùa Láng, Quận Đống Đa, Hà Nội',
        category: 'Ban công',
        price: 3300000,
        area: 27,
        floor: 4,
        maxGuests: 2,
        rating: 4.93,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Căn hộ ngay phố Chùa Láng, gần ĐH Ngoại Thương và Học viện Ngoại Giao. Không gian sáng sủa, ban công hướng Đông Nam mát mẻ quanh năm.',
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 260,
        lastWaterIndex: 31,
      },
      {
        roomNumber: 'P401',
        title: 'Studio Tiêu Chuẩn tại Quận Tây Hồ',
        location: 'Quận Tây Hồ, Hà Nội',
        address: 'Đường Lạc Long Quân, Quận Tây Hồ, Hà Nội',
        category: 'Studio',
        price: 2900000,
        area: 24,
        floor: 4,
        maxGuests: 2,
        rating: 4.88,
        isGuestFavorite: false,
        status: 'Đang sửa',
        description:
          'Đang nâng cấp sàn gỗ xương cá và bảo dưỡng định kỳ hệ thống điều hòa trung tâm.',
        images: [
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=85',
        ],
        lastElecIndex: 600,
        lastWaterIndex: 60,
      },
      {
        roomNumber: 'P402',
        title: 'Studio Mini Gần ĐH Quốc Gia tại Cầu Giấy',
        location: 'Quận Cầu Giấy, Hà Nội',
        address: 'Ngõ 165 Xuân Thủy, Quận Cầu Giấy, Hà Nội',
        category: 'Studio',
        price: 2700000,
        area: 22,
        floor: 4,
        maxGuests: 2,
        rating: 4.9,
        isGuestFavorite: false,
        status: 'Trống',
        description:
          'Phòng studio nhỏ gọn cách ĐH Quốc Gia và ĐH Sư Phạm 5 phút đi bộ. Có giường, tủ, bàn học, bếp mini và WC khép kín. Phù hợp cho sinh viên, giờ giấc tự do, có chỗ để xe miễn phí.',
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 180,
        lastWaterIndex: 22,
      },
      {
        roomNumber: 'P403',
        title: 'Căn hộ Ban Công Phố Cổ tại Hoàn Kiếm',
        location: 'Quận Hoàn Kiếm, Hà Nội',
        address: 'Phố Hàng Bè, Quận Hoàn Kiếm, Hà Nội',
        category: 'Ban công',
        price: 4500000,
        area: 30,
        floor: 4,
        maxGuests: 2,
        rating: 4.97,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Căn hộ giữa lòng phố cổ, đi bộ 3 phút ra Hồ Gươm. Ban công rộng nhìn xuống phố, nội thất gỗ ấm cúng, điều hòa 2 chiều, máy giặt riêng và khóa vân tay an toàn.',
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 340,
        lastWaterIndex: 36,
      },
      {
        roomNumber: 'P404',
        title: 'Duplex Gác Gỗ tại Hai Bà Trưng',
        location: 'Quận Hai Bà Trưng, Hà Nội',
        address: 'Phố Minh Khai, Quận Hai Bà Trưng, Hà Nội',
        category: 'Duplex',
        price: 3400000,
        area: 29,
        floor: 4,
        maxGuests: 3,
        rating: 4.9,
        isGuestFavorite: false,
        status: 'Trống',
        description:
          'Phòng duplex có gác gỗ chắc chắn để ngủ, tầng dưới làm phòng khách và bếp. Gần Times City và ĐH Kinh tế Quốc dân, khu dân cư yên tĩnh, an ninh tốt.',
        images: [
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 270,
        lastWaterIndex: 29,
      },
      {
        roomNumber: 'P501',
        title: 'Căn hộ Full Nội Thất View Sông Hàn',
        location: 'Quận Hải Châu, Đà Nẵng',
        address: 'Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng',
        category: 'Full nội thất',
        price: 4000000,
        area: 32,
        floor: 5,
        maxGuests: 3,
        rating: 4.98,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Căn hộ tầng cao nhìn thẳng ra sông Hàn và cầu Rồng. Bàn giao đầy đủ sofa, Smart TV, tủ lạnh, máy giặt, bếp từ và máy lọc nước. Tối cuối tuần ngắm cầu Rồng phun lửa ngay từ cửa sổ.',
        images: [
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 390,
        lastWaterIndex: 41,
      },
      {
        roomNumber: 'P502',
        title: 'Studio Yên Tĩnh tại Quận Thanh Khê',
        location: 'Quận Thanh Khê, Đà Nẵng',
        address: 'Đường Hàm Nghi, Quận Thanh Khê, Đà Nẵng',
        category: 'Studio',
        price: 2500000,
        area: 21,
        floor: 5,
        maxGuests: 2,
        rating: 4.87,
        isGuestFavorite: false,
        status: 'Trống',
        description:
          'Phòng studio giá mềm trong hẻm yên tĩnh, gần chợ và siêu thị. Có cửa sổ thoáng, điều hòa, nóng lạnh và kệ bếp riêng. Thích hợp cho người đi làm muốn tiết kiệm chi phí.',
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 140,
        lastWaterIndex: 18,
      },
      {
        roomNumber: 'P503',
        title: 'Căn hộ Ban Công Gần Biển Mỹ Khê',
        location: 'Quận Sơn Trà, Đà Nẵng',
        address: 'Đường Võ Nguyên Giáp, Quận Sơn Trà, Đà Nẵng',
        category: 'Ban công',
        price: 3700000,
        area: 28,
        floor: 5,
        maxGuests: 2,
        rating: 4.96,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Chỉ 2 phút đi bộ ra bãi biển Mỹ Khê. Ban công riêng đón gió biển, phòng ngủ cách âm tốt, bếp đầy đủ dụng cụ nấu ăn và khu phơi đồ thoáng mát.',
        images: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 230,
        lastWaterIndex: 27,
      },
      {
        roomNumber: 'P504',
        title: 'Duplex Hiện Đại tại Quận 3',
        location: 'Quận 3, TP.HCM',
        address: 'Đường Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
        category: 'Duplex',
        price: 4100000,
        area: 33,
        floor: 5,
        maxGuests: 3,
        rating: 4.93,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Căn duplex trần cao, gác ngủ riêng tư, tầng dưới có sofa và bàn làm việc. Nằm ngay trung tâm Quận 3, gần Hồ Con Rùa và nhiều quán cà phê, di chuyển sang Quận 1 rất nhanh.',
        images: [
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 450,
        lastWaterIndex: 48,
      },
      {
        roomNumber: 'P601',
        title: 'Studio Tiện Nghi Gần Chợ Bến Thành',
        location: 'Quận 1, TP.HCM',
        address: 'Đường Lê Thánh Tôn, Phường Bến Thành, Quận 1, TP.HCM',
        category: 'Studio',
        price: 4300000,
        area: 25,
        floor: 6,
        maxGuests: 2,
        rating: 4.95,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Studio ngay trung tâm Quận 1, đi bộ 5 phút tới chợ Bến Thành và phố đi bộ Nguyễn Huệ. Nội thất mới, cửa kính cách âm, có thang máy và bảo vệ 24/7.',
        images: [
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 520,
        lastWaterIndex: 55,
      },
      {
        roomNumber: 'P602',
        title: 'Căn hộ Full Nội Thất tại Thảo Điền',
        location: 'Thành phố Thủ Đức, TP.HCM',
        address: 'Đường Quốc Hương, Phường Thảo Điền, TP. Thủ Đức, TP.HCM',
        category: 'Full nội thất',
        price: 5000000,
        area: 38,
        floor: 6,
        maxGuests: 4,
        rating: 4.99,
        isGuestFavorite: true,
        status: 'Trống',
        description:
          'Căn hộ rộng 38m2 trong khu Thảo Điền yên bình, nhiều cây xanh. Đầy đủ nội thất cao cấp: giường king size, sofa, Smart TV, máy giặt sấy và bếp đảo. Phù hợp gia đình nhỏ hoặc nhóm bạn.',
        images: [
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 610,
        lastWaterIndex: 63,
      },
      {
        roomNumber: 'P603',
        title: 'Phòng Đơn Tiết Kiệm tại Quận Bình Thạnh',
        location: 'Quận Bình Thạnh, TP.HCM',
        address: 'Đường Xô Viết Nghệ Tĩnh, Phường 25, Quận Bình Thạnh, TP.HCM',
        category: 'Studio',
        price: 2400000,
        area: 18,
        floor: 6,
        maxGuests: 1,
        rating: 4.86,
        isGuestFavorite: false,
        status: 'Trống',
        description:
          'Phòng đơn giá rẻ gần ĐH Hutech và ĐH Giao thông Vận tải. Sạch sẽ, có cửa sổ, điều hòa và WC riêng. Điện nước tính theo giá nhà nước, không phụ thu.',
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        ],
        lastElecIndex: 120,
        lastWaterIndex: 15,
      },
    ]);

    const currentYear = new Date().getFullYear();
    const rentedRooms = [rooms[0], rooms[1], rooms[4], rooms[5], rooms[7]]; // P101, P102, P201, P202, P301

    for (let i = 0; i < rentedRooms.length; i++) {
      await Contract.create({
        room: rentedRooms[i]._id,
        tenant: tenants[i]._id,
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear + 1}-01-01`),
        deposit: rentedRooms[i].price,
        status: 'Hiệu lực',
        notes: 'Hợp đồng thuê 12 tháng, đóng tiền từ ngày 01 - 05 hàng tháng.',
      });
    }

    const invoicesToCreate = [];
    for (let idx = 0; idx < rentedRooms.length; idx++) {
      const room = rentedRooms[idx];
      const tenant = tenants[idx];
      let runningElec = 200 + idx * 100;
      let runningWater = 15 + idx * 5;

      for (let m = 1; m <= 10; m++) {
        const kwhStep = 85 + ((idx * 27 + m * 19) % 180);
        const waterStep = 4 + ((idx + m) % 6);

        const oldElec = runningElec;
        const newElec = oldElec + kwhStep;
        const oldWater = runningWater;
        const newWater = oldWater + waterStep;

        runningElec = newElec;
        runningWater = newWater;

        const calc = calculateInvoiceAmounts({
          roomPrice: room.price,
          oldElec,
          newElec,
          oldWater,
          newWater,
          serviceFee: 100000,
        });

        const isUnpaid =
          (room.roomNumber === 'P102' && (m === 9 || m === 10)) ||
          (room.roomNumber === 'P202' && m === 10) ||
          (room.roomNumber === 'P301' && m === 10);

        invoicesToCreate.push({
          room: room._id,
          tenant: tenant._id,
          month: m,
          year: currentYear,
          oldElec,
          newElec,
          oldWater,
          newWater,
          roomPrice: calc.roomPrice,
          elecAmount: calc.elecAmount,
          waterAmount: calc.waterAmount,
          serviceFee: calc.serviceFee,
          totalAmount: calc.totalAmount,
          status: isUnpaid ? 'Chưa thanh toán' : 'Đã thanh toán',
          paidAt: isUnpaid ? null : new Date(currentYear, m - 1, 5),
        });
      }

      await Room.findByIdAndUpdate(room._id, {
        lastElecIndex: runningElec,
        lastWaterIndex: runningWater,
      });
    }

    await Invoice.insertMany(invoicesToCreate);

    await RepairRequest.create([
      {
        tenant: tenants[0]._id,
        room: rentedRooms[0]._id,
        title: 'Điều hòa không mát, có tiếng kêu ở dàn lạnh',
        description:
          'Điều hòa phòng P101 bật 18 độ nhưng chỉ thổi gió thường, cần thợ kiểm tra nạp gas hoặc vệ sinh.',
        images: [],
        status: 'Mới',
      },
      {
        tenant: tenants[1]._id,
        room: rentedRooms[1]._id,
        title: 'Vòi nước bồn rửa bát bị rò nước ở khớp nối',
        description: 'Nước rỉ nhỏ giọt dưới gầm tủ bếp, nhờ chủ trọ cho người thay gioăng cao su.',
        images: [],
        status: 'Đang xử lý',
        adminNote: 'Đã hẹn thợ điện nước chiều mai 15h qua thay vòi mới.',
      },
      {
        tenant: tenants[2]._id,
        room: rentedRooms[2]._id,
        title: 'Thay bóng đèn LED nhà tắm',
        description: 'Bóng đèn ốp trần trong WC bị cháy.',
        images: [],
        status: 'Xong',
        adminNote: 'Đã thay bóng đèn Rạng Đông 18W mới.',
      },
    ]);

    console.log('🎉 Khởi tạo dữ liệu mẫu Airbnb thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();

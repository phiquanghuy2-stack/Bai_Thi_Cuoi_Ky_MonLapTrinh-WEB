// Thêm 20 căn hộ (P701 → P1104) vào DB mà KHÔNG xóa dữ liệu hiện có.
// Chạy lại nhiều lần vẫn an toàn: căn nào đã tồn tại (theo roomNumber) sẽ được cập nhật thông tin.
// Cách chạy: npm run seed:apartments  (trong thư mục backend)

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const apartments = require('./data/apartments');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Room.bulkWrite(
      apartments.map((apt) => {
        // Không ghi đè trạng thái thuê/chỉ số điện nước nếu căn đã có sẵn trong DB
        const { status, lastElecIndex, lastWaterIndex, ...info } = apt;
        return {
          updateOne: {
            filter: { roomNumber: apt.roomNumber },
            update: {
              $set: info,
              $setOnInsert: { status, lastElecIndex, lastWaterIndex },
            },
            upsert: true,
          },
        };
      })
    );

    const total = await Room.countDocuments();
    console.log(
      `✅ Đã thêm mới ${result.upsertedCount} căn, cập nhật ${result.modifiedCount} căn. Tổng số phòng trong DB: ${total}`
    );
    process.exit(0);
  } catch (error) {
    console.error(`❌ Lỗi khi thêm căn hộ: ${error.message}`);
    process.exit(1);
  }
};

run();

// Nạp ảnh (data/images) và dữ liệu nhà trọ (data/snapshot) vào MongoDB.
// Không xóa dữ liệu hiện có: bản ghi trùng _id sẽ bị ghi đè bằng bản trong snapshot,
// bản ghi khác được giữ nguyên.
//
// Cách chạy: npm run import-data  (trong thư mục backend)

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { importImages, importSnapshot } = require('./utils/sampleData');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const images = await importImages({ force: true });
    const summary = await importSnapshot();

    console.log(`✅ Đã nạp ${images} ảnh và dữ liệu:`, summary);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Lỗi khi nạp dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

run();

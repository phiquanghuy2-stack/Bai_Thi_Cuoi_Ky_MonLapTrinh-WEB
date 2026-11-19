// Xuất dữ liệu nhà trọ đang có trong MongoDB ra backend/data/snapshot/*.json để commit lên GitHub.
// Người khác clone về chỉ cần chạy server (DB trống sẽ tự nạp) hoặc `npm run import-data`.
//
// - Link ảnh Unsplash được đổi sang ảnh lưu trong DB (/api/images/<id>.jpg) nếu file ảnh có trong data/images.
// - Chỉ xuất tài khoản admin và khách thuê có liên quan tới hợp đồng/hóa đơn/yêu cầu sửa chữa,
//   để tài khoản cá nhân tự đăng ký lúc test không bị đẩy lên GitHub.
//
// Cách chạy: npm run export-data  (trong thư mục backend)

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { IMAGES_DIR, SNAPSHOT_DIR, SNAPSHOT_COLLECTIONS } = require('./utils/sampleData');

const { EJSON } = mongoose.mongo.BSON;

dotenv.config();

const localImages = new Set(fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : []);

const toLocalImage = (url) => {
  const match = /images\.unsplash\.com\/photo-([0-9a-f-]+)/i.exec(url || '');
  if (match && localImages.has(`${match[1]}.jpg`)) return `/api/images/${match[1]}.jpg`;
  return url;
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

    const data = {};
    for (const name of SNAPSHOT_COLLECTIONS) {
      data[name] = await db.collection(name).find().sort({ _id: 1 }).toArray();
    }

    // Đổi link ảnh phòng & ảnh sửa chữa sang ảnh trong DB
    for (const name of ['rooms', 'repairrequests']) {
      data[name].forEach((doc) => {
        if (Array.isArray(doc.images)) doc.images = doc.images.map(toLocalImage);
      });
    }

    // Giữ admin + những người dùng được tham chiếu bởi dữ liệu nhà trọ
    const referenced = new Set(
      ['contracts', 'invoices', 'repairrequests'].flatMap((name) =>
        data[name].map((doc) => String(doc.tenant))
      )
    );
    const skippedUsers = data.users.filter(
      (u) => u.role !== 'admin' && !referenced.has(String(u._id))
    ).length;
    data.users = data.users.filter((u) => u.role === 'admin' || referenced.has(String(u._id)));

    for (const name of SNAPSHOT_COLLECTIONS) {
      fs.writeFileSync(
        path.join(SNAPSHOT_DIR, `${name}.json`),
        `${EJSON.stringify(data[name], null, 2, { relaxed: true })}\n`
      );
      console.log(`  ${name}: ${data[name].length} bản ghi`);
    }
    if (skippedUsers > 0) {
      console.log(`  (bỏ qua ${skippedUsers} tài khoản không gắn với hợp đồng/hóa đơn nào)`);
    }
    console.log(`✅ Đã xuất dữ liệu ra ${path.relative(process.cwd(), SNAPSHOT_DIR)}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Lỗi khi xuất dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

run();

// Nạp dữ liệu mẫu (ảnh + dữ liệu nhà trọ) từ thư mục backend/data vào MongoDB.
//
//  - backend/data/images/*.jpg   → collection `images` (ảnh lưu nhị phân trong DB)
//  - backend/data/snapshot/*.json → các collection rooms, users, contracts, invoices, repairrequests
//
// Snapshot được tạo bằng `npm run export-data` từ DB của người đã có dữ liệu,
// commit lên GitHub, rồi máy khác tự nạp lại khi khởi động server (nếu DB còn trống)
// hoặc chạy tay `npm run import-data`.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Image = require('../models/Image');

const { EJSON } = mongoose.mongo.BSON;

const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const SNAPSHOT_DIR = path.join(DATA_DIR, 'snapshot');

// Thứ tự nạp: phòng & người dùng trước, các bảng tham chiếu tới chúng sau
const SNAPSHOT_COLLECTIONS = ['users', 'rooms', 'contracts', 'invoices', 'repairrequests'];

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const listImageFiles = () => {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  return fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => CONTENT_TYPES[path.extname(file).toLowerCase()]);
};

// Đưa toàn bộ ảnh trong data/images vào DB (ảnh đã có thì bỏ qua, trừ khi force = true)
const importImages = async ({ force = false } = {}) => {
  const files = listImageFiles();
  if (files.length === 0) return 0;

  const existing = force
    ? new Set()
    : new Set((await Image.find({ name: { $in: files } }, 'name').lean()).map((img) => img.name));

  const missing = files.filter((file) => !existing.has(file));
  if (missing.length === 0) return 0;

  await Image.bulkWrite(
    missing.map((file) => {
      const data = fs.readFileSync(path.join(IMAGES_DIR, file));
      return {
        updateOne: {
          filter: { name: file },
          update: {
            $set: {
              contentType: CONTENT_TYPES[path.extname(file).toLowerCase()],
              size: data.length,
              data,
            },
          },
          upsert: true,
        },
      };
    })
  );
  return missing.length;
};

// Ghi đè/thêm các bản ghi trong snapshot theo _id. Bản ghi không có trong snapshot được giữ nguyên.
const importSnapshot = async () => {
  const db = mongoose.connection.db;
  const summary = {};

  for (const name of SNAPSHOT_COLLECTIONS) {
    const file = path.join(SNAPSHOT_DIR, `${name}.json`);
    if (!fs.existsSync(file)) continue;

    const docs = EJSON.parse(fs.readFileSync(file, 'utf8'), { relaxed: true });
    if (docs.length > 0) {
      await db.collection(name).bulkWrite(
        docs.map((doc) => ({
          replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
        }))
      );
    }
    summary[name] = docs.length;
  }
  return summary;
};

// Gọi khi server khởi động: luôn đảm bảo đủ ảnh trong DB,
// và nếu chưa có phòng nào thì nạp toàn bộ snapshot.
const ensureSampleData = async () => {
  try {
    const addedImages = await importImages();
    if (addedImages > 0) console.log(`🖼️  Đã nạp ${addedImages} ảnh mẫu vào MongoDB`);

    const roomCount = await mongoose.connection.db.collection('rooms').countDocuments();
    if (roomCount === 0 && fs.existsSync(SNAPSHOT_DIR)) {
      const summary = await importSnapshot();
      console.log('📦 DB đang trống → đã nạp dữ liệu mẫu:', summary);
    }
  } catch (error) {
    console.error(`⚠️  Không nạp được dữ liệu mẫu: ${error.message}`);
  }
};

module.exports = {
  IMAGES_DIR,
  SNAPSHOT_DIR,
  SNAPSHOT_COLLECTIONS,
  importImages,
  importSnapshot,
  ensureSampleData,
};

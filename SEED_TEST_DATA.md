# 📊 Hướng Dẫn Seed Test Data cho Hệ Thống Đăng Nhập

## 📌 Mục Đích

Tài liệu này giải thích cách tạo dữ liệu test trong database để kiểm thử hệ thống đăng nhập.

---

## ✅ Điều Kiện Tiên Quyết

```bash
# 1. MongoDB đang chạy
# Windows: mongod.exe hoặc MongoDB from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 2. Backend dependencies
cd backend
npm install

# 3. .env file đã cấu hình
cat .env
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/quan_ly_nha_tro
# JWT_SECRET=quan_ly_nha_tro_jwt_secret_key_2026_secure
```

---

## 🔧 Cách 1: Chạy Seed Script

### Bước 1: Kiểm tra seed.js
```bash
cd backend
cat seed.js | head -20
```

### Bước 2: Chạy Script
```bash
node seed.js
```

### Output Mong Đợi
```
🌱 Seeding database...
✅ Database cleared
✅ Tạo 5 users (admin + 4 tenants)
✅ Tạo 10 phòng trọ
✅ Tạo 4 hợp đồng
✅ Seeding hoàn tất!
```

### Test Ngay
```bash
# Terminal 2
npm start

# Terminal 3
curl http://localhost:5000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nhatro.vn","password":"password123"}'
```

---

## 🔧 Cách 2: Insert Thủ Công qua MongoDB

### Bước 1: Mở MongoDB CLI
```bash
# Windows
mongosh

# Mac/Linux
mongosh
```

### Bước 2: Chọn Database
```javascript
use quan_ly_nha_tro
```

### Bước 3: Create Users
```javascript
const bcrypt = require('bcryptjs');

// Admin user
db.users.insertOne({
  _id: ObjectId(),
  name: "Quản Trị Viên",
  email: "admin@nhatro.vn",
  password: "$2a$10$...", // bcrypt hash of "password123"
  role: "admin",
  phone: "0901234567",
  avatar: "",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Tenant user
db.users.insertOne({
  _id: ObjectId(),
  name: "Nguyễn Văn A",
  email: "user1@gmail.com",
  password: "$2a$10$...", // bcrypt hash
  role: "tenant",
  phone: "0912345678",
  avatar: "",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Bước 4: Kiểm tra
```javascript
db.users.find()
```

---

## 🔧 Cách 3: Generate Password Hashes

### Online Tool (Dùng Cẩn Thận)
https://bcryptjs.org/

### Locally (Recommended)
```javascript
// Node.js
const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(hash);
}

generateHash('password123');
// Output: $2a$10$Hf5PpFq...
```

---

## 📋 Test Data Structure

### Admin User
```json
{
  "email": "admin@nhatro.vn",
  "password": "password123",
  "name": "Quản Trị Viên",
  "phone": "0901234567",
  "role": "admin"
}
```

### Tenant User 1 (Đang nợ)
```json
{
  "email": "huong@gmail.com",
  "password": "password123",
  "name": "Hương (P102)",
  "phone": "0912111111",
  "role": "tenant"
}
```

### Tenant User 2 (Bình thường)
```json
{
  "email": "tuan@gmail.com",
  "password": "password123",
  "name": "Tuấn (P101)",
  "phone": "0912222222",
  "role": "tenant"
}
```

### Tenant User 3 (Mới)
```json
{
  "email": "linh@gmail.com",
  "password": "password123",
  "name": "Linh (P103)",
  "phone": "0912333333",
  "role": "tenant"
}
```

---

## 🏠 Rooms Data Structure

```javascript
[
  {
    roomNumber: "P101",
    floor: 1,
    price: 2000000,
    area: 25,
    status: "occupied",
    description: "Phòng đơn có cửa sổ"
  },
  {
    roomNumber: "P102",
    floor: 1,
    price: 2500000,
    area: 30,
    status: "occupied",
    description: "Phòng rộng, có đầy đủ tiện nghi"
  },
  // ... more rooms
]
```

---

## 📝 Contracts Data Structure

```javascript
[
  {
    tenant: "ObjectId(userId)",
    room: "ObjectId(roomId)",
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    monthlyRent: 2000000,
    status: "Hiệu lực",
    notes: "Hợp đồng 1 năm"
  }
]
```

---

## 🧪 Kiểm Tra Seeding Thành Công

### Check Users
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer {token}"
```

### Check Rooms
```bash
curl http://localhost:5000/api/rooms
```

### Check Contracts
```bash
curl http://localhost:5000/api/contracts \
  -H "Authorization: Bearer {token}"
```

---

## 🔄 Reset Database

### Xóa Tất Cả Collections
```javascript
// MongoDB CLI
db.users.deleteMany({})
db.rooms.deleteMany({})
db.contracts.deleteMany({})

// Verify
db.users.countDocuments()  // Should be 0
```

### Re-seed
```bash
node seed.js
```

---

## ⚠️ Troubleshooting

### Issue: "Connection refused"
```
❌ MongoDB không chạy
✅ Giải pháp:
  - Windows: Start-Service mongod
  - Mac: brew services start mongodb-community
  - Linux: sudo systemctl start mongod
```

### Issue: "Cannot find module"
```
❌ Dependencies chưa install
✅ Giải pháp:
  npm install
```

### Issue: "E11000 duplicate key error"
```
❌ Email đã tồn tại
✅ Giải pháp:
  # Clear database
  node seed.js  # Hoặc manual delete
```

### Issue: "Authentication failed"
```
❌ MongoDB authentication issues
✅ Giải pháp:
  # Check .env
  MONGO_URI=mongodb://127.0.0.1:27017/quan_ly_nha_tro
  
  # Check MongoDB không require auth
  mongosh --noauth
```

---

## 🚀 Automation Scripts

### Auto Seed & Start Backend
```bash
#!/bin/bash
cd backend
npm install
node seed.js
npm start
```

### Auto Seed & Start Full Stack
```bash
#!/bin/bash
# Terminal 1: Backend
(cd backend && node seed.js && npm start) &

# Terminal 2: Frontend
(cd frontend && npm run dev) &
```

---

## 📊 Sample Database State

Sau khi seed:

| Collection | Count | Notes |
|-----------|-------|-------|
| users | 5 | 1 admin + 4 tenants |
| rooms | 10 | Phòng từ P101-P110 |
| contracts | 4 | 4 người thuê × 1 phòng |
| invoices | 0 | Tạo khi cần |

---

## 🔐 Security Notes

### DO NOT
```javascript
// ❌ KHÔNG hardcode password ở frontend
const testPassword = "password123";

// ❌ KHÔNG lưu unencrypted password
db.users.insertOne({
  password: "password123" // ❌ WRONG
});

// ❌ KHÔNG expose seed script ở production
if (process.env.NODE_ENV === 'production') {
  // Block seed execution
}
```

### DO
```javascript
// ✅ Mã hóa password trước khi lưu
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash(password, 10);

// ✅ Kiểm tra NODE_ENV
if (process.env.NODE_ENV !== 'development') {
  throw new Error('Seed only in development!');
}

// ✅ Xóa seed script trước deploy
rm seed.js  // hoặc move sang .gitignore
```

---

## 🧪 Login Flow Verification

### Step 1: Seed data
```bash
node seed.js
```

### Step 2: Start servers
```bash
npm start  # Backend
npm run dev  # Frontend (other terminal)
```

### Step 3: Navigate to login
```
http://localhost:5173/login
```

### Step 4: Try credentials
```
Email: admin@nhatro.vn
Password: password123
```

### Step 5: Verify redirect
```
✅ Login success message
✅ Redirect to /admin/dashboard
✅ Token in localStorage
```

---

## 📚 Related Commands

```bash
# Check MongoDB status
mongosh --version

# Connect to database
mongosh quan_ly_nha_tro

# Export data
mongodump --db quan_ly_nha_tro --out ./backup

# Import data
mongorestore --db quan_ly_nha_tro ./backup/quan_ly_nha_tro

# Clear database
mongo quan_ly_nha_tro --eval "db.dropDatabase()"
```

---

## ✅ Checklist

- [ ] MongoDB running
- [ ] Backend .env configured
- [ ] Dependencies installed
- [ ] Seed script executed
- [ ] Users created
- [ ] Can login with admin account
- [ ] Token in localStorage
- [ ] Redirect to dashboard works
- [ ] Multiple users can login
- [ ] Logout clears storage

---

**Cập nhật**: 2026-11-11
**Status**: ✅ Hoàn tát

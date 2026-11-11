# Hướng Dẫn Kiểm Thử Hệ Thống Đăng Nhập

## 🎯 Mục Đích

Tài liệu này hướng dẫn cách kiểm thử toàn bộ quy trình đăng nhập từ giao diện người dùng đến backend.

---

## ⚙️ Chuẩn Bị Môi Trường

### Bước 1: Khởi động Backend

```bash
cd backend
npm install
npm start
```

Kiểm tra: http://localhost:5000/api/health

```json
{
  "success": true,
  "message": "API Hệ thống Quản lý Nhà trọ đang hoạt động!"
}
```

git commit -m "first commit"

### Bước 2: Khởi động Frontend

```bash
cd frontend
npm install
npm run dev
```

Kiểm tra: http://localhost:5173 (hoặc port được hiển thị)

---

## 🧪 Các Kịch Bản Kiểm Thử

### Test 1: Đăng Nhập Thành Công (Admin)

**Mục đích**: Xác nhận flow đăng nhập bình thường

**Bước**:

1. Truy cập trang `/login`
2. Nhập email: `admin@nhatro.vn`
3. Nhập mật khẩu: `password123` (nếu seed data tồn tại)
4. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Thông báo "Đăng nhập thành công!" xuất hiện
- ✅ Chuyển hướng về `/admin/dashboard`
- ✅ localStorage có `smartmotel_token` và `smartmotel_user`

**Kiểm Tra Kỹ Thuật**:

```javascript
// Trong Console (F12 -> Application -> LocalStorage)
localStorage.getItem("smartmotel_token"); // Phải có giá trị JWT
localStorage.getItem("smartmotel_user"); // Phải có object người dùng

// Kiểm tra network trong DevTools
// POST /api/auth/login -> Status 200
```

---

### Test 2: Đăng Nhập Không Chính Xác (Email Sai)

**Mục đích**: Xác nhận xử lý lỗi khi email không tồn tại

**Bước**:

1. Truy cập trang `/login`
2. Nhập email: `notexist@example.com`
3. Nhập mật khẩu: `password123`
4. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Thông báo lỗi: "Email hoặc mật khẩu không chính xác!"
- ✅ Vẫn ở trang `/login`
- ✅ Không có token trong localStorage

**Kiểm Tra Kỹ Thuật**:

```javascript
// Network DevTools
// POST /api/auth/login -> Status 401
// Response: { "success": false, "message": "Email hoặc mật khẩu không chính xác!" }
```

---

### Test 3: Đăng Nhập Không Chính Xác (Mật Khẩu Sai)

**Mục đích**: Xác nhận xử lý lỗi khi mật khẩu sai

**Bước**:

1. Truy cập trang `/login`
2. Nhập email: `admin@nhatro.vn`
3. Nhập mật khẩu: `wrongpassword`
4. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Thông báo lỗi: "Email hoặc mật khẩu không chính xác!"
- ✅ Vẫn ở trang `/login`
- ✅ Không có token trong localStorage

---

### Test 4: Xác Thực Client-Side (Email Trống)

**Mục đích**: Xác nhận validation frontend

**Bước**:

1. Truy cập trang `/login`
2. Để trống cả email lẫn mật khẩu
3. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Hiển thị lỗi dưới email: "Vui lòng nhập địa chỉ email"
- ✅ Hiển thị lỗi dưới password: "Vui lòng nhập mật khẩu"
- ✅ **KHÔNG** gửi request lên server
- ✅ Nút "Đăng nhập" không disabled

---

### Test 5: Xác Thực Client-Side (Email Sai Format)

**Mục đích**: Xác nhận validation email format

**Bước**:

1. Truy cập trang `/login`
2. Nhập email: `invalidemail`
3. Nhập mật khẩu: `password123`
4. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Hiển thị lỗi: "Định dạng email không hợp lệ"
- ✅ **KHÔNG** gửi request lên server
- ✅ Input field email highlight lỗi

---

### Test 6: Xác Thực Client-Side (Mật Khẩu Quá Ngắn)

**Mục đích**: Xác nhận validation mật khẩu minimum

**Bước**:

1. Truy cập trang `/login`
2. Nhập email: `admin@nhatro.vn`
3. Nhập mật khẩu: `12345` (chỉ 5 ký tự)
4. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Hiển thị lỗi: "Mật khẩu phải có tối thiểu 6 ký tự"
- ✅ **KHÔNG** gửi request lên server

---

### Test 7: Xác Nhận Field Clearing (Lỗi Tự Clear)

**Mục đích**: Xác nhận UX khi người dùng chỉnh sửa

**Bước**:

1. Nhập email: `invalid`
2. Nhấn "Đăng nhập" (thấy lỗi)
3. Chỉnh sửa email field

**Kết Quả Mong Đợi**:

- ✅ Lỗi email tự động clear khi user chỉnh sửa
- ✅ Lỗi password vẫn hiển thị (chưa chỉnh sửa)

---

### Test 8: Token Hết Hạn (Expired Token)

**Mục đích**: Xác nhận auto-logout khi token hết hạn

**Bước**:

1. Đăng nhập thành công
2. Chờ token hết hạn hoặc simulate bằng:
   ```javascript
   // Mở Console (F12)
   localStorage.removeItem("smartmotel_token");
   ```
3. Thực hiện action cần xác thực (truy cập protected route)

**Kết Quả Mong Đợi**:

- ✅ Nhận được 401 error từ server
- ✅ Tự động clear localStorage
- ✅ Chuyển hướng về `/login`

---

### Test 9: Xử Lý Khoảng Trắng Email

**Mục đích**: Xác nhận email normalization

**Bước**:

1. Nhập email: `  admin@nhatro.vn  ` (có space)
2. Nhập mật khẩu: `password123`
3. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Đăng nhập thành công
- ✅ Backend tự động trim space

---

### Test 10: Case Insensitive Email

**Mục đích**: Xác nhận email case-insensitive

**Bước**:

1. Nhập email: `ADMIN@NHATRO.VN` (uppercase)
2. Nhập mật khẩu: `password123`
3. Nhấn "Đăng nhập"

**Kết Quả Mong Đợi**:

- ✅ Đăng nhập thành công
- ✅ Backend chuyển về lowercase

---

### Test 11: Multiple Failed Attempts

**Mục đích**: Xác nhận handle nhiều lần đăng nhập sai

**Bước**:

1. Đăng nhập sai 3 lần
2. Lần thứ 4 đăng nhập đúng

**Kết Quả Mong Đợi**:

- ✅ Tất cả lỗi đều hiển thị rõ ràng
- ✅ Lần thứ 4 đăng nhập được bình thường
- ✅ **KHÔNG** có rate limiting block

---

### Test 12: Refresh Page Sau Đăng Nhập

**Mục đích**: Xác nhận session persistence

**Bước**:

1. Đăng nhập thành công
2. Refresh page (Ctrl+R / Cmd+R)

**Kết Quả Mong Đợi**:

- ✅ Vẫn ở trên dashboard (không quay về login)
- ✅ User info vẫn hiển thị
- ✅ localStorage vẫn có token

---

## 🐛 Debugging Issues

### Issue: "CORS Error" khi đăng nhập

**Nguyên Nhân**: Backend CORS không được cấu hình
**Giải Pháp**:

```javascript
// backend/server.js
app.use(cors());
```

### Issue: "Token not found in localStorage"

**Nguyên Nhân**: localStorage bị block hoặc clear
**Giải Pháp**:

```javascript
// Console kiểm tra
typeof Storage; // Phải return "object"
localStorage.getItem("smartmotel_token"); // Kiểm tra key
```

### Issue: "Endless loading" khi đăng nhập

**Nguyên Nhân**: Có thể backend không response hoặc network error
**Giải Pháp**:

```bash
# 1. Kiểm tra backend đang chạy
curl http://localhost:5000/api/health

# 2. Kiểm tra network tab trong DevTools
# 3. Kiểm tra console logs
```

### Issue: "Cannot redirect to dashboard"

**Nguyên Nhân**: Route chưa được set up hoặc AuthContext chưa update
**Giải Pháp**:

```javascript
// Kiểm tra Redux/Context update
console.log(useAuth().user); // Phải có user object
```

---

## 📊 Performance Checks

### Loading Time

```javascript
// Mở DevTools -> Performance tab
// Kiểm tra:
// - Initial page load: < 2s
// - Login request: < 1s
```

### Network Usage

```javascript
// DevTools -> Network tab
// POST /api/auth/login -> Size ~5KB
```

### Memory Leaks

```javascript
// DevTools -> Memory tab
// Logout -> Check Memory ngành sau 5s (phải release memory)
```

---

## ✅ Checklist Trước Deploy

- [ ] Test 1: Đăng nhập thành công (Admin)
- [ ] Test 2: Email không tồn tại
- [ ] Test 3: Mật khẩu sai
- [ ] Test 4: Email trống
- [ ] Test 5: Email format sai
- [ ] Test 6: Mật khẩu quá ngắn
- [ ] Test 7: Error auto-clear
- [ ] Test 8: Token hết hạn
- [ ] Test 9: Email với space
- [ ] Test 10: Email uppercase
- [ ] Test 11: Multiple failed attempts
- [ ] Test 12: Refresh page
- [ ] Network requests OK
- [ ] Console no errors
- [ ] Performance acceptable

---

## 📝 Ghi Chú

- Đảm bảo `.env` backend được cấu hình đúng
- Database phải có seed data (user test)
- Network DevTools phải enabled
- Browser Cache nên clear giữa tests

---

**Cập nhật**: 2026-11-11

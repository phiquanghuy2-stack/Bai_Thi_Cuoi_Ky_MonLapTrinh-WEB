# HỆ THỐNG QUẢN LÝ NHÀ TRỌ SMARTMOTEL (MERN STACK)

Dự án Full-stack MERN quản lý nhà trọ tuân thủ 100% đặc tả kỹ thuật và nghiệp vụ:
- **Frontend:** React 18 (Vite), JavaScript ES6+ (Arrow function, Destructuring, Spread/Rest, Async/Await, không dùng `var`, không mutate state), Tailwind CSS, React Router v6, Context API (`AuthContext`, `ThemeContext`), Redux Toolkit (`invoiceSlice`, `roomSlice`), Custom Hooks (`useDebounce`, `useFetch`).
- **Backend:** Node.js, Express.js, RESTful API (URL danh từ số nhiều), JWT + `bcryptjs`, phân quyền Role-based (`admin`, `tenant` - trả về `403 Forbidden` khi truy cập trái phép hóa đơn/hợp đồng phòng khác), upload ảnh cục bộ bằng `multer`, xuất hóa đơn PDF bằng `pdfkit`, gửi email nhắc nợ bằng `nodemailer`.
- **Database:** MongoDB (Mongoose) với 5 Collections có liên kết (`Users`, `Rooms`, `Contracts`, `Invoices`, `RepairRequests`), Compound Unique Index chặn trùng hóa đơn `{ room: 1, month: 1, year: 1 }`, và **MongoDB Aggregation Pipeline** (`$group`, `$lookup`, `$unwind`) cho Dashboard Thống kê.

---

## HƯỚNG DẪN CHẠY DỰ ÁN NHANH

### Bước 1: Cài đặt & Khởi tạo dữ liệu mẫu Backend
Mở Terminal thứ nhất:
```bash
cd backend
npm install
npm run seed
npm run dev
```
- Server Backend chạy tại: `http://localhost:5000`
- Lệnh `npm run seed` sẽ tự động tạo sẵn:
  - **Tài khoản Chủ trọ (Admin):** `admin@nhatro.vn` / `password123`
  - **Tài khoản Người thuê P102 (Có hóa đơn nợ):** `huong@gmail.com` / `password123`
  - **Tài khoản Người thuê P101:** `tuan@gmail.com` / `password123`
  - 10 phòng trọ (`Trống`, `Đang thuê`, `Đang sửa`), 5 hợp đồng hiệu lực, 50 hóa đơn trải đều các tháng trong năm (phục vụ Biểu đồ Doanh thu 12 tháng & Danh sách phòng nợ), cùng các yêu cầu sửa chữa mẫu.

### Bước 2: Cài đặt & Chạy Frontend (Vite + React)
Mở Terminal thứ hai:
```bash
cd frontend
npm install
npm run dev
```
- Giao diện Web chạy tại: `http://localhost:5173`
*(Ghi chú: File `test.jjs` trống ban đầu có thể xóa đi nếu không sử dụng).*

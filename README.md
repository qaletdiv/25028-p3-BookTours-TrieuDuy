# BookTours

Website đặt tour du lịch gồm frontend React/Vite và REST API Express.js kết nối MySQL.

## Chức năng hiện có

- A.1: Trang chủ có banner slider, tìm kiếm nhanh, tour nổi bật/trong nước/nước ngoài và popup theo phiên.
- A.2: Danh sách tour, bộ lọc nâng cao, sắp xếp và phân trang.
- A.3: Chi tiết tour, thư viện ảnh, ngày khởi hành, lịch trình, giá/phụ thu, chính sách và tour liên quan.

## Cài đặt MySQL

Chạy lần lượt hai file:

```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p < backend/database/seed.sql
```

Sao chép `backend/.env.example` thành `backend/.env`, sau đó chỉnh thông tin kết nối MySQL.

## Chạy backend

```bash
cd backend
npm install
npm run dev
```

API mặc định chạy tại `http://localhost:5000`.

## Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Website chạy tại `http://localhost:5173`. Vite tự chuyển tiếp các request `/api` đến backend trong môi trường phát triển.

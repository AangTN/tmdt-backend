# API Thống Kê Đơn Hàng

API cung cấp các endpoint thống kê chi tiết về đơn hàng, sản phẩm bán chạy, doanh thu theo cơ sở và tổng quan hệ thống.

## Base URL
```
/api/orders/statistics
```

---

## 1. Sản Phẩm Bán Chạy Nhất

### GET `/api/orders/statistics/best-selling-products`

Lấy danh sách sản phẩm bán chạy nhất (không bao gồm combo).

**Query Parameters:**
- `limit` (number, optional): Số lượng sản phẩm trả về. Mặc định: 10
- `branchId` (number, optional): Lọc theo cơ sở cụ thể
- `startDate` (string, optional): Ngày bắt đầu (ISO format: YYYY-MM-DD)
- `endDate` (string, optional): Ngày kết thúc (ISO format: YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaBienThe": 1,
      "TongSoLuongBan": 150,
      "TongDoanhThu": "45000000",
      "SoDonHang": 75,
      "ThongTinSanPham": {
        "MaBienThe": 1,
        "GiaBan": "300000",
        "MonAn": {
          "MaMonAn": 1,
          "TenMonAn": "Pizza Hải Sản",
          "HinhAnh": "pizza-hai-san.jpg",
          "DanhMuc": {
            "MaDanhMuc": 1,
            "TenDanhMuc": "Pizza"
          }
        },
        "Size": {
          "MaSize": 2,
          "TenSize": "Lớn"
        }
      }
    }
  ]
}
```

**Example:**
```bash
GET /api/orders/statistics/best-selling-products?limit=5&branchId=1&startDate=2025-11-01
```

---

## 2. Combo Bán Chạy Nhất

### GET `/api/orders/statistics/best-selling-combos`

Lấy danh sách combo bán chạy nhất.

**Query Parameters:**
- `limit` (number, optional): Số lượng combo trả về. Mặc định: 10
- `branchId` (number, optional): Lọc theo cơ sở
- `startDate` (string, optional): Ngày bắt đầu
- `endDate` (string, optional): Ngày kết thúc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaCombo": 5,
      "TongSoLuongBan": 80,
      "TongDoanhThu": "24000000",
      "SoDonHang": 80,
      "ThongTinCombo": {
        "MaCombo": 5,
        "TenCombo": "Combo Gia Đình",
        "MoTa": "2 Pizza + 1 Nước ngọt",
        "HinhAnh": "combo-gia-dinh.jpg",
        "GiaCombo": "300000",
        "TrangThai": "Active"
      }
    }
  ]
}
```

**Example:**
```bash
GET /api/orders/statistics/best-selling-combos?limit=10&startDate=2025-11-01&endDate=2025-11-21
```

---

## 3. Doanh Thu Theo Cơ Sở

### GET `/api/orders/statistics/revenue-by-branch`

Thống kê doanh thu của từng cơ sở.

**Query Parameters:**
- `startDate` (string, optional): Ngày bắt đầu
- `endDate` (string, optional): Ngày kết thúc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "MaCoSo": 1,
      "TongDoanhThu": "150000000",
      "TongGiamGia": "5000000",
      "TongPhiShip": "10000000",
      "SoDonHang": 500,
      "DoanhThuThucTe": "145000000",
      "ThongTinCoSo": {
        "MaCoSo": 1,
        "TenCoSo": "SECRET PIZZA Hà Nội",
        "SoDienThoai": "0241234567",
        "SoNhaDuong": "123 Đường ABC",
        "PhuongXa": "Phường 1",
        "QuanHuyen": "Quận Ba Đình",
        "ThanhPho": "Hà Nội"
      }
    },
    {
      "MaCoSo": 2,
      "TongDoanhThu": "200000000",
      "TongGiamGia": "8000000",
      "TongPhiShip": "15000000",
      "SoDonHang": 650,
      "DoanhThuThucTe": "192000000",
      "ThongTinCoSo": {
        "MaCoSo": 2,
        "TenCoSo": "SECRET PIZZA TP. HCM",
        "SoDienThoai": "0281234567",
        "SoNhaDuong": "456 Đường XYZ",
        "PhuongXa": "Phường 10",
        "QuanHuyen": "Quận 1",
        "ThanhPho": "Hồ Chí Minh"
      }
    }
  ]
}
```

**Example:**
```bash
GET /api/orders/statistics/revenue-by-branch?startDate=2025-11-01&endDate=2025-11-21
```

---

## 4. Tổng Quan Doanh Thu

### GET `/api/orders/statistics/overall-revenue`

Thống kê tổng quan doanh thu (toàn hệ thống hoặc theo cơ sở).

**Query Parameters:**
- `branchId` (number, optional): Lọc theo cơ sở cụ thể
- `startDate` (string, optional): Ngày bắt đầu
- `endDate` (string, optional): Ngày kết thúc

**Response:**
```json
{
  "success": true,
  "data": {
    "TongDoanhThu": "350000000",
    "TongTienHang": "360000000",
    "TongGiamGia": "13000000",
    "TongPhiShip": "25000000",
    "SoDonHang": 1150,
    "GiaTriTrungBinh": "304347.83",
    "DoanhThuThucTe": "337000000"
  }
}
```

**Example:**
```bash
GET /api/orders/statistics/overall-revenue?startDate=2025-11-01&endDate=2025-11-21
GET /api/orders/statistics/overall-revenue?branchId=1
```

---

## 5. Số Lượng Đơn Hàng Theo Khoảng Thời Gian

### GET `/api/orders/statistics/order-count-by-period`

Thống kê số lượng đơn hàng và doanh thu theo ngày/tuần/tháng/năm.

**Query Parameters:**
- `groupBy` (string, optional): Nhóm theo `day`, `week`, `month`, hoặc `year`. Mặc định: `day`
- `branchId` (number, optional): Lọc theo cơ sở
- `startDate` (string, optional): Ngày bắt đầu
- `endDate` (string, optional): Ngày kết thúc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2025-11-18",
      "count": 45,
      "totalRevenue": "13500000"
    },
    {
      "period": "2025-11-19",
      "count": 52,
      "totalRevenue": "15600000"
    },
    {
      "period": "2025-11-20",
      "count": 48,
      "totalRevenue": "14400000"
    },
    {
      "period": "2025-11-21",
      "count": 38,
      "totalRevenue": "11400000"
    }
  ]
}
```

**Examples:**
```bash
# Theo ngày
GET /api/orders/statistics/order-count-by-period?groupBy=day&startDate=2025-11-01&endDate=2025-11-21

# Theo tuần
GET /api/orders/statistics/order-count-by-period?groupBy=week&startDate=2025-11-01

# Theo tháng
GET /api/orders/statistics/order-count-by-period?groupBy=month&startDate=2025-01-01&endDate=2025-12-31

# Theo năm
GET /api/orders/statistics/order-count-by-period?groupBy=year
```

---

## 6. Thống Kê Theo Trạng Thái Đơn Hàng

### GET `/api/orders/statistics/by-status`

Thống kê số lượng đơn hàng và doanh thu theo trạng thái.

**Query Parameters:**
- `branchId` (number, optional): Lọc theo cơ sở
- `startDate` (string, optional): Ngày bắt đầu
- `endDate` (string, optional): Ngày kết thúc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "TrangThai": "Đã giao",
      "SoDonHang": 850,
      "TongDoanhThu": "255000000"
    },
    {
      "TrangThai": "Đang giao",
      "SoDonHang": 120,
      "TongDoanhThu": "36000000"
    },
    {
      "TrangThai": "Đang xử lý",
      "SoDonHang": 80,
      "TongDoanhThu": "24000000"
    },
    {
      "TrangThai": "Đang chờ xác nhận",
      "SoDonHang": 50,
      "TongDoanhThu": "15000000"
    },
    {
      "TrangThai": "Đã hủy",
      "SoDonHang": 20,
      "TongDoanhThu": "6000000"
    }
  ]
}
```

**Example:**
```bash
GET /api/orders/statistics/by-status?startDate=2025-11-01&endDate=2025-11-21
```

---

## 7. Thống Kê Theo Phương Thức Thanh Toán

### GET `/api/orders/statistics/by-payment-method`

Thống kê số lượng giao dịch và tổng tiền theo phương thức thanh toán.

**Query Parameters:**
- `branchId` (number, optional): Lọc theo cơ sở
- `startDate` (string, optional): Ngày bắt đầu
- `endDate` (string, optional): Ngày kết thúc

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "PhuongThuc": "Tiền Mặt",
      "TrangThai": "Đã thanh toán",
      "SoGiaoDich": 650,
      "TongTien": "195000000"
    },
    {
      "PhuongThuc": "Tiền Mặt",
      "TrangThai": "Chưa thanh toán",
      "SoGiaoDich": 150,
      "TongTien": "45000000"
    },
    {
      "PhuongThuc": "VNPay",
      "TrangThai": "Đã thanh toán",
      "SoGiaoDich": 300,
      "TongTien": "90000000"
    },
    {
      "PhuongThuc": "VNPay",
      "TrangThai": "Thất bại",
      "SoGiaoDich": 50,
      "TongTien": "15000000"
    }
  ]
}
```

**Example:**
```bash
GET /api/orders/statistics/by-payment-method?startDate=2025-11-01
```

---

## 8. Dashboard Overview - Tổng Quan Nhanh

### GET `/api/orders/statistics/dashboard-overview`

API tổng hợp thống kê nhanh cho dashboard admin (hôm nay, tuần này, tháng này, tổng toàn bộ).

**Query Parameters:**
- `branchId` (number, optional): Lọc theo cơ sở

**Response:**
```json
{
  "success": true,
  "data": {
    "homNay": {
      "soDonHang": 38,
      "doanhThu": "11400000"
    },
    "tuanNay": {
      "soDonHang": 183,
      "doanhThu": "54900000"
    },
    "thangNay": {
      "soDonHang": 850,
      "doanhThu": "255000000"
    },
    "tongQuan": {
      "tongSoDonHang": 1150,
      "tongDoanhThu": "350000000",
      "tongGiamGia": "13000000",
      "giaTriTrungBinh": "304347.83"
    }
  }
}
```

**Example:**
```bash
GET /api/orders/statistics/dashboard-overview
GET /api/orders/statistics/dashboard-overview?branchId=1
```

---

## Lưu Ý

### Date Format
- Sử dụng format ISO 8601: `YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:MM:SS.sssZ`
- Ví dụ: `2025-11-01`, `2025-11-21T23:59:59.999Z`

### Filtering
- Tất cả các endpoint đều hỗ trợ lọc theo khoảng thời gian (`startDate`, `endDate`)
- Một số endpoint hỗ trợ lọc theo cơ sở (`branchId`)

### Performance
- Sử dụng `limit` để giới hạn kết quả trả về
- Nên chỉ định khoảng thời gian cụ thể để tối ưu hiệu suất

### Error Response
Tất cả các API đều trả về error theo format:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Use Cases

### 1. Dashboard Admin
```bash
# Lấy tổng quan nhanh
GET /api/orders/statistics/dashboard-overview

# Top 5 sản phẩm bán chạy trong tháng
GET /api/orders/statistics/best-selling-products?limit=5&startDate=2025-11-01

# Doanh thu các cơ sở trong tháng
GET /api/orders/statistics/revenue-by-branch?startDate=2025-11-01
```

### 2. Báo Cáo Tuần
```bash
# Đơn hàng theo ngày trong tuần
GET /api/orders/statistics/order-count-by-period?groupBy=day&startDate=2025-11-18&endDate=2025-11-24

# Trạng thái đơn hàng trong tuần
GET /api/orders/statistics/by-status?startDate=2025-11-18&endDate=2025-11-24
```

### 3. Phân Tích Cơ Sở
```bash
# Top sản phẩm của cơ sở 1
GET /api/orders/statistics/best-selling-products?branchId=1&limit=10

# Doanh thu cơ sở 1 trong tháng
GET /api/orders/statistics/overall-revenue?branchId=1&startDate=2025-11-01
```

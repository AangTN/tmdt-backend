# API Quản Lý Combo

## 1. Thêm Combo Mới

### Endpoint
```
POST /api/combos
```

### Content-Type
```
multipart/form-data
```

## Request Body

### Form Fields

1. **data** (required) - JSON string chứa thông tin combo
```json
{
  "tenCombo": "Combo Family 4 người",
  "moTa": "Combo pizza siêu tiết kiệm cho gia đình 4 người",
  "giaCombo": 499000,
  "trangThai": "Active",
  "items": [
    {
      "maBienThe": 1,
      "maDeBanh": 1,
      "soLuong": 2
    },
    {
      "maBienThe": 5,
      "maDeBanh": null,
      "soLuong": 1
    }
  ]
}
```

2. **hinhAnhFile** (required) - File ảnh combo (jpeg, jpg, png, gif, webp, max 5MB)

## Response

### Success (201 Created)
```json
{
  "message": "Thêm combo thành công",
  "combo": {
    "MaCombo": 1,
    "TenCombo": "Combo Family 4 người",
    "MoTa": "Combo pizza siêu tiết kiệm cho gia đình 4 người",
    "GiaCombo": "499000.00",
    "HinhAnh": "/images/AnhCombo/combo-1234567890.jpg",
    "TrangThai": "Active",
    "NgayTao": "2025-11-18T10:30:00.000Z",
    "NgayCapNhat": "2025-11-18T10:30:00.000Z",
    "Combo_ChiTiet": [...]
  }
}
```

### Error (400 Bad Request)
```json
{
  "message": "Tên combo là bắt buộc"
}
```

```json
{
  "message": "Giá combo phải lớn hơn 0"
}
```

```json
{
  "message": "Hình ảnh combo là bắt buộc"
}
```

```json
{
  "message": "Combo phải có ít nhất một món"
}
```

## Example Request (Frontend)

```javascript
const formData = new FormData();

const payload = {
  tenCombo: 'Combo Pizza Hấp Dẫn',
  moTa: 'Combo siêu tiết kiệm',
  giaCombo: 299000,
  trangThai: 'Active',
  items: [
    { maBienThe: 1, maDeBanh: 1, soLuong: 1 },
    { maBienThe: 5, maDeBanh: null, soLuong: 2 }
  ]
};

formData.append('data', JSON.stringify(payload));
formData.append('hinhAnhFile', imageFile);

const response = await api.post('/api/combos', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## Validation Rules

1. **tenCombo**: Required, không được rỗng
2. **giaCombo**: Required, phải > 0
3. **hinhAnhFile**: Required, định dạng ảnh hợp lệ, max 5MB
4. **items**: Required, phải có ít nhất 1 món
5. **items[].maBienThe**: Required
6. **items[].soLuong**: Required, phải > 0
7. **items[].maDeBanh**: Optional, có thể null

## Database Schema

```sql
-- Combo table
CREATE TABLE Combo (
  MaCombo SERIAL PRIMARY KEY,
  TenCombo VARCHAR(255) NOT NULL,
  MoTa TEXT,
  GiaCombo DECIMAL(10,2) NOT NULL,
  HinhAnh VARCHAR(255),
  TrangThai VARCHAR(20) DEFAULT 'Active',
  NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  NgayCapNhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Combo_ChiTiet table
CREATE TABLE Combo_ChiTiet (
  MaCTCombo SERIAL PRIMARY KEY,
  MaCombo INT NOT NULL REFERENCES Combo(MaCombo) ON DELETE CASCADE,
  MaBienThe INT NOT NULL REFERENCES BienTheMonAn(MaBienThe),
  SoLuong INT NOT NULL DEFAULT 1,
  MaDeBanh INT REFERENCES DeBanh(MaDeBanh),
  UNIQUE(MaCombo, MaBienThe)
);
```

## Notes

- Ảnh combo sẽ được lưu vào thư mục riêng: `/public/images/AnhCombo/` với tên file có prefix "combo-"
- Path lưu trong DB là relative path: `/images/AnhCombo/combo-filename-timestamp.jpg`
- Frontend cần append `ASSET_BASE_URL` để hiển thị ảnh
- Constraint UNIQUE trên `(MaCombo, MaBienThe)` - nếu cần thêm cùng món với đế khác, cần xử lý riêng
- Khi cập nhật trạng thái, chỉ chấp nhận "Active" hoặc "Inactive"
- Khi xóa combo, chi tiết sẽ bị xóa hoàn toàn nhưng combo chỉ chuyển trạng thái sang "Deleted"

## 2. Cập Nhật Combo (Không sửa tên)

### Endpoint
```
PUT /api/combos/:id
```

### Content-Type
```
multipart/form-data
```

### Request Body

**Form Fields:**

1. **data** (required) - JSON string (KHÔNG bao gồm tenCombo)
```json
{
  "moTa": "Combo pizza siêu tiết kiệm cho gia đình 4 người - Đã cập nhật",
  "giaCombo": 449000,
  "trangThai": "Active",
  "hinhAnh": "/images/AnhCombo/combo-existing.jpg",
  "items": [
    {
      "maBienThe": 1,
      "maDeBanh": 1,
      "soLuong": 2
    },
    {
      "maBienThe": 5,
      "maDeBanh": null,
      "soLuong": 1
    }
  ]
}
```

2. **hinhAnhFile** (optional) - File ảnh mới (nếu muốn thay đổi ảnh)

### Notes về cập nhật:
- ⚠️ **KHÔNG gửi tenCombo** - tên combo không được phép sửa
- Nếu không upload file mới, phải gửi `hinhAnh` (path ảnh cũ) trong data
- **TẤT CẢ chi tiết cũ sẽ bị xóa** và thay bằng danh sách items mới
- Phải gửi đầy đủ thông tin: moTa, giaCombo, trangThai, hinhAnh, items

### Success Response (200)
```json
{
  "message": "Cập nhật combo thành công",
  "combo": {
    "MaCombo": 1,
    "TenCombo": "Combo Family 4 người",
    "MoTa": "Combo pizza siêu tiết kiệm cho gia đình 4 người - Đã cập nhật",
    "GiaCombo": "449000.00",
    "HinhAnh": "/images/AnhCombo/combo-new-image.jpg",
    "TrangThai": "Active",
    "NgayTao": "2025-11-18T10:30:00.000Z",
    "NgayCapNhat": "2025-11-18T12:00:00.000Z",
    "Combo_ChiTiet": [...]
  }
}
```

### Error Responses
```json
{
  "message": "Không tìm thấy combo"
}
```

```json
{
  "message": "Giá combo phải lớn hơn 0"
}
```

```json
{
  "message": "Combo phải có ít nhất một món"
}
```

## 3. Cập Nhật Trạng Thái Combo (Khóa/Mở)

### Endpoint
```
PATCH /api/combos/:id/status
```

### Request Body
```json
{
  "status": "Active" // hoặc "Inactive"
}
```

### Success Response (200)
```json
{
  "message": "Cập nhật trạng thái combo thành công",
  "combo": {
    "MaCombo": 1,
    "TenCombo": "Combo Family 4 người",
    "HinhAnh": "/images/AnhCombo/combo-1234567890.jpg",
    "GiaCombo": "499000.00",
    "MoTa": "...",
    "TrangThai": "Inactive",
    "NgayTao": "2025-11-18T10:30:00.000Z",
    "NgayCapNhat": "2025-11-18T11:00:00.000Z"
  }
}
```

### Error Response (400)
```json
{
  "message": "Trạng thái không hợp lệ. Chỉ chấp nhận Active hoặc Inactive"
}
```

### Error Response (404)
```json
{
  "message": "Không tìm thấy combo"
}
```

## 4. Xóa Combo (Chuyển sang Deleted)

### Endpoint
```
DELETE /api/combos/:id
```

### Response (200)
```json
{
  "message": "Xóa combo thành công",
  "combo": {
    "MaCombo": 1,
    "TenCombo": "Combo Family 4 người",
    "TrangThai": "Deleted"
  }
}
```

### Error Response (404)
```json
{
  "message": "Không tìm thấy combo"
}
```

### Notes
- Khi xóa combo, tất cả chi tiết trong `Combo_ChiTiet` sẽ bị xóa
- Trạng thái combo sẽ được chuyển thành "Deleted"
- Combo không bị xóa vật lý khỏi database

## Testing

### 1. Thêm combo mới
Frontend: `http://localhost:5174/admin/combos/add`

Curl:
```bash
curl -X POST http://localhost:3001/api/combos \
  -F 'data={"tenCombo":"Test Combo","moTa":"Test","giaCombo":299000,"trangThai":"Active","items":[{"maBienThe":1,"maDeBanh":1,"soLuong":1}]}' \
  -F 'hinhAnhFile=@/path/to/image.jpg'
```

### 2. Cập nhật combo
```bash
curl -X PUT http://localhost:3001/api/combos/1 \
  -F 'data={"moTa":"Updated description","giaCombo":350000,"trangThai":"Active","hinhAnh":"/images/AnhCombo/existing.jpg","items":[{"maBienThe":1,"maDeBanh":1,"soLuong":2}]}' \
  -F 'hinhAnhFile=@/path/to/new-image.jpg'
```

### 3. Cập nhật trạng thái
```bash
curl -X PATCH http://localhost:3001/api/combos/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Inactive"}'
```

### 4. Xóa combo
```bash
curl -X DELETE http://localhost:3001/api/combos/1
```

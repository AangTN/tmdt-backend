// --- IMPORT CÁC THƯ VIỆN CẦN THIẾT ---
const express = require('express');
const cors = require('cors');

// --- IMPORT CÁC ROUTES CỦA ỨNG DỤNG ---
const categoryRoutes = require('./src/api/categories/category.routes');
const typeRoutes = require('./src/api/types/type.routes');
const foodRoutes = require('./src/api/foods/food.routes');
const variantRoutes = require('./src/api/variants/variant.routes');
const crustRoutes = require('./src/api/crusts/crust.routes');

// --- KHỞI TẠO EXPRESS APP ---
const app = express();

// --- CẤU HÌNH MIDDLEWARE ---
app.use(cors());

// Cho phép server đọc và xử lý dữ liệu dạng JSON trong body của request
app.use(express.json());
app.use(express.static('public'));

// --- ĐỊNH NGHĨA CÁC API ROUTES ---
// Route cơ bản để kiểm tra server có đang "sống" hay không
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running healthy!' });
});

// Sử dụng routes đã tách riêng
app.use('/api/categories', categoryRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/crusts', crustRoutes);


// --- KHỞI ĐỘNG SERVER ---
// Lấy PORT từ biến môi trường (do Render cung cấp) hoặc dùng 3001 khi chạy local
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server SECRET PIZZA đang chạy tại cổng ${PORT}`);
});
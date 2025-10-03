// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Để đọc các biến trong file .env

// Khởi tạo app Express
const app = express();

// Sử dụng các middleware
app.use(cors()); // Cho phép cross-origin requests
app.use(express.json()); // Cho phép server đọc dữ liệu JSON từ request

// --- API ENDPOINTS ---
// API "Hello World" của chúng ta
app.get('/api/health', (req, res) => {
  res.json({ status: "API is running!" });
});

// --- KHỞI ĐỘNG SERVER ---
// Lấy port từ biến môi trường, nếu không có thì mặc định là 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const repo = require('./review.repository');

async function createReview(payload) {
  if (!payload) {
    const e = new Error('Thiếu dữ liệu đánh giá');
    e.status = 400;
    throw e;
  }

  const { MaMonAn, MaTaiKhoan, SoSao, NoiDung } = payload;

  // Validate required fields
  if (!MaMonAn || !MaTaiKhoan || !SoSao) {
    const e = new Error('Thiếu thông tin bắt buộc: MaMonAn, MaTaiKhoan, SoSao');
    e.status = 400;
    throw e;
  }

  // Validate SoSao range
  const soSaoNum = Number(SoSao);
  if (!Number.isInteger(soSaoNum) || soSaoNum < 1 || soSaoNum > 5) {
    const e = new Error('Số sao phải là số nguyên từ 1 đến 5');
    e.status = 400;
    throw e;
  }

  // Check if user can review this food
  const reviewCheck = await repo.checkUserCanReview(MaTaiKhoan, MaMonAn);
  if (!reviewCheck.canReview) {
    let errorMessage = 'Không thể đánh giá món ăn này';
    
    switch (reviewCheck.reason) {
      case 'already_reviewed':
        errorMessage = 'Bạn đã đánh giá món ăn này rồi';
        break;
      case 'user_not_found':
        errorMessage = 'Không tìm thấy thông tin người dùng';
        break;
      case 'no_completed_order':
        errorMessage = 'Bạn chỉ có thể đánh giá món ăn sau khi đã nhận được hàng';
        break;
    }
    
    const e = new Error(errorMessage);
    e.status = 400;
    throw e;
  }

  return repo.createReview({
    maMonAn: Number(MaMonAn),
    maTaiKhoan: Number(MaTaiKhoan),
    soSao: soSaoNum,
    noiDung: NoiDung || null,
  });
}

async function getReviewsByFoodId(maMonAn) {
  if (!maMonAn) {
    const e = new Error('Thiếu MaMonAn');
    e.status = 400;
    throw e;
  }
  return repo.findReviewsByFoodId(maMonAn);
}

async function getAllReviews() {
  return repo.findAllReviews();
}

async function approveReview(maDanhGia) {
  if (!maDanhGia) {
    const e = new Error('Thiếu MaDanhGiaMonAn');
    e.status = 400;
    throw e;
  }
  return repo.updateReviewStatus(maDanhGia, 'Hiển thị');
}

async function rejectReview(maDanhGia) {
  if (!maDanhGia) {
    const e = new Error('Thiếu MaDanhGiaMonAn');
    e.status = 400;
    throw e;
  }
  return repo.updateReviewStatus(maDanhGia, 'Ẩn');
}

async function deleteReview(maDanhGia) {
  if (!maDanhGia) {
    const e = new Error('Thiếu MaDanhGiaMonAn');
    e.status = 400;
    throw e;
  }
  return repo.deleteReview(maDanhGia);
}

module.exports = {
  createReview,
  getReviewsByFoodId,
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview,
};

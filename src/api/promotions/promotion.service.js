const promotionRepository = require('./promotion.repository');

const getAllPromotions = async () => {
  const promotions = await promotionRepository.findAllPromotions();
  
  // Format dates and calculate status
  return promotions.map(promo => {
    const now = new Date();
    const isActive = promo.TrangThai === 'Active' 
      && new Date(promo.KMBatDau) <= now 
      && new Date(promo.KMKetThuc) >= now;
    
    return {
      ...promo,
      isCurrentlyActive: isActive,
      totalFoods: promo._count?.MonAn_KhuyenMai || 0,
    };
  });
};

const getDiscountedFoods = async () => {
  const result = await promotionRepository.findDiscountedFoods();
  
  // Return array with MaMonAn and MaKhuyenMai only
  return result.map(item => ({
    MaMonAn: item.MaMonAn,
    MaKhuyenMai: item.MaKhuyenMai,
  }));
};

const getPromotionById = async (id) => {
  const promotion = await promotionRepository.findPromotionById(id);
  if (!promotion) {
    const e = new Error('Không tìm thấy khuyến mãi');
    e.status = 404;
    throw e;
  }

  const now = new Date();
  const isActive = promotion.TrangThai === 'Active' 
    && new Date(promotion.KMBatDau) <= now 
    && new Date(promotion.KMKetThuc) >= now;

  return {
    ...promotion,
    isCurrentlyActive: isActive,
    totalFoods: promotion._count?.MonAn_KhuyenMai || 0,
    foods: promotion.MonAn_KhuyenMai.map(mk => mk.MonAn),
  };
};

const createPromotion = async (data) => {
  // Validation
  if (!data.TenKhuyenMai || !data.TenKhuyenMai.trim()) {
    const e = new Error('Tên khuyến mãi là bắt buộc');
    e.status = 400;
    throw e;
  }
  if (!data.KMLoai || !['PERCENT', 'AMOUNT'].includes(data.KMLoai)) {
    const e = new Error('Loại khuyến mãi không hợp lệ');
    e.status = 400;
    throw e;
  }
  if (!data.KMGiaTri || Number(data.KMGiaTri) <= 0) {
    const e = new Error('Giá trị khuyến mãi phải lớn hơn 0');
    e.status = 400;
    throw e;
  }

  // Validate percentage 0-100
  if (data.KMLoai === 'PERCENT') {
    const value = Number(data.KMGiaTri);
    if (value > 100) {
      const e = new Error('Phần trăm giảm phải từ 0-100');
      e.status = 400;
      throw e;
    }
  }

  // Validate amount max 100 million
  if (data.KMLoai === 'AMOUNT') {
    const value = Number(data.KMGiaTri);
    if (value > 100000000) {
      const e = new Error('Số tiền giảm tối đa 100 triệu');
      e.status = 400;
      throw e;
    }
  }

  // Validate date range
  if (data.KMBatDau && data.KMKetThuc) {
    const startDate = new Date(data.KMBatDau);
    const endDate = new Date(data.KMKetThuc);
    if (endDate <= startDate) {
      const e = new Error('Ngày kết thúc phải sau ngày bắt đầu');
      e.status = 400;
      throw e;
    }
  }

  const promotion = await promotionRepository.createPromotion(data);
  const now = new Date();
  const isActive = promotion.TrangThai === 'Active' 
    && new Date(promotion.KMBatDau) <= now 
    && new Date(promotion.KMKetThuc) >= now;

  return {
    ...promotion,
    isCurrentlyActive: isActive,
    totalFoods: promotion._count?.MonAn_KhuyenMai || 0,
  };
};

const updatePromotion = async (id, data) => {
  const existing = await promotionRepository.findPromotionById(id);
  if (!existing) {
    const e = new Error('Không tìm thấy khuyến mãi');
    e.status = 404;
    throw e;
  }

  // Validation
  if (!data.TenKhuyenMai || !data.TenKhuyenMai.trim()) {
    const e = new Error('Tên khuyến mãi là bắt buộc');
    e.status = 400;
    throw e;
  }
  if (!data.KMLoai || !['PERCENT', 'AMOUNT'].includes(data.KMLoai)) {
    const e = new Error('Loại khuyến mãi không hợp lệ');
    e.status = 400;
    throw e;
  }
  if (!data.KMGiaTri || Number(data.KMGiaTri) <= 0) {
    const e = new Error('Giá trị khuyến mãi phải lớn hơn 0');
    e.status = 400;
    throw e;
  }

  // Validate percentage 0-100
  if (data.KMLoai === 'PERCENT') {
    const value = Number(data.KMGiaTri);
    if (value > 100) {
      const e = new Error('Phần trăm giảm phải từ 0-100');
      e.status = 400;
      throw e;
    }
  }

  // Validate amount max 100 million
  if (data.KMLoai === 'AMOUNT') {
    const value = Number(data.KMGiaTri);
    if (value > 100000000) {
      const e = new Error('Số tiền giảm tối đa 100 triệu');
      e.status = 400;
      throw e;
    }
  }

  // Validate date range
  if (data.KMBatDau && data.KMKetThuc) {
    const startDate = new Date(data.KMBatDau);
    const endDate = new Date(data.KMKetThuc);
    if (endDate <= startDate) {
      const e = new Error('Ngày kết thúc phải sau ngày bắt đầu');
      e.status = 400;
      throw e;
    }
  }

  const promotion = await promotionRepository.updatePromotion(id, data);
  const now = new Date();
  const isActive = promotion.TrangThai === 'Active' 
    && new Date(promotion.KMBatDau) <= now 
    && new Date(promotion.KMKetThuc) >= now;

  return {
    ...promotion,
    isCurrentlyActive: isActive,
    totalFoods: promotion._count?.MonAn_KhuyenMai || 0,
  };
};

const togglePromotionStatus = async (id, newStatus) => {
  if (!newStatus || !['Active', 'Inactive'].includes(newStatus)) {
    const e = new Error('Trạng thái không hợp lệ');
    e.status = 400;
    throw e;
  }

  const existing = await promotionRepository.findPromotionById(id);
  if (!existing) {
    const e = new Error('Không tìm thấy khuyến mãi');
    e.status = 404;
    throw e;
  }

  const promotion = await promotionRepository.updatePromotionStatus(id, newStatus);
  const now = new Date();
  const isActive = promotion.TrangThai === 'Active' 
    && new Date(promotion.KMBatDau) <= now 
    && new Date(promotion.KMKetThuc) >= now;

  return {
    ...promotion,
    isCurrentlyActive: isActive,
    totalFoods: promotion._count?.MonAn_KhuyenMai || 0,
  };
};

const updatePromotionFoods = async (promotionId, foodIds) => {
  const promotion = await promotionRepository.findPromotionById(promotionId);
  if (!promotion) {
    const e = new Error('Không tìm thấy khuyến mãi');
    e.status = 404;
    throw e;
  }

  await promotionRepository.updatePromotionFoods(promotionId, foodIds);
  return { success: true, message: 'Cập nhật danh sách món ăn thành công' };
};

const deletePromotion = async (promotionId) => {
  const promotion = await promotionRepository.findPromotionById(promotionId);
  if (!promotion) {
    const e = new Error('Không tìm thấy khuyến mãi');
    e.status = 404;
    throw e;
  }

  // First delete relations, then the promotion itself
  await promotionRepository.deletePromotion(promotionId);
  return { success: true, message: 'Xóa khuyến mãi thành công' };
};

module.exports = {
  getAllPromotions,
  getDiscountedFoods,
  getPromotionById,
  createPromotion,
  updatePromotion,
  togglePromotionStatus,
  updatePromotionFoods,
  deletePromotion,
};

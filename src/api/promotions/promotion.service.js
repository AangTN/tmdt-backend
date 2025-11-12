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

module.exports = {
  getAllPromotions,
  getDiscountedFoods,
};

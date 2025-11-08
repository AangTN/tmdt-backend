const bannerService = require('./banner.service');

const getBanners = async (req, res) => {
  try {
    const banners = await bannerService.getBanners();
    res.status(200).json({ data: banners });
  } catch (error) {
    console.error('Error in getBanners controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getBanners };

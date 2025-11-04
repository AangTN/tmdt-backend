const bannerService = require('./banner.service');

const getBanners = async (req, res) => {
  try {
    const filenames = await bannerService.getBannerFilenames();
    // Return relative public paths (served by express.static('public'))
    const banners = filenames.map((fname) => `/images/Banner/${encodeURIComponent(fname)}`);
    res.status(200).json(banners);
  } catch (error) {
    console.error('Error in getBanners controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getBanners };

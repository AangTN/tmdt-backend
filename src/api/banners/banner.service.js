const fs = require('fs');
const path = require('path');

// Path to banners.json
const BANNERS_JSON_PATH = path.join(__dirname, '../../data/banners.json');

function getBanners() {
  try {
    const data = fs.readFileSync(BANNERS_JSON_PATH, 'utf8');
    const banners = JSON.parse(data);
    return banners;
  } catch (err) {
    console.error('Could not read banners.json:', err.message);
    return [];
  }
}

module.exports = { getBanners };

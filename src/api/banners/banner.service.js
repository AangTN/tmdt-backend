const fs = require('fs').promises;
const path = require('path');

// Path from this file (src/api/banners) to project public images Banner folder
const BANNER_DIR = path.join(__dirname, '../../../public/images/Banner');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

async function getBannerFilenames() {
  try {
    const files = await fs.readdir(BANNER_DIR);
    // filter by common image extensions
    const images = files.filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()));
    return images;
  } catch (err) {
    // If directory doesn't exist or other FS error, log and return empty
    console.warn('Could not read banner directory:', BANNER_DIR, err.message);
    return [];
  }
}

module.exports = { getBannerFilenames };

const fs = require('fs');
const path = require('path');

// Path to banners.json
const BANNERS_JSON_PATH = path.join(__dirname, '../../data/banners.json');

function getBanners() {
  try {
    if (!fs.existsSync(BANNERS_JSON_PATH)) {
      // Create empty array if file doesn't exist
      fs.writeFileSync(BANNERS_JSON_PATH, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(BANNERS_JSON_PATH, 'utf8');
    const banners = JSON.parse(data);
    return banners;
  } catch (err) {
    console.error('Could not read banners.json:', err.message);
    return [];
  }
}

function writeBanners(banners) {
  try {
    fs.writeFileSync(BANNERS_JSON_PATH, JSON.stringify(banners, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Could not write banners.json:', err.message);
    return false;
  }
}

function addBanner({ AnhBanner, DuongDan }) {
  const banners = getBanners();
  // generate new MaBanner as max existing + 1 or timestamp-based id
  const maxId = banners.reduce((m, b) => {
    const id = Number(b.MaBanner || b.id || 0);
    return isNaN(id) ? m : Math.max(m, id);
  }, 0);
  const MaBanner = maxId > 0 ? maxId + 1 : Date.now();
  const newBanner = { MaBanner, AnhBanner: AnhBanner || '', DuongDan: DuongDan || '/' };
  banners.push(newBanner);
  const ok = writeBanners(banners);
  if (!ok) throw new Error('Unable to persist banner');
  return newBanner;
}

function updateBanner(id, { AnhBanner, DuongDan }) {
  const banners = getBanners();
  const idx = banners.findIndex((b) => String(b.MaBanner || b.id) === String(id));
  if (idx === -1) return null;
  const existing = banners[idx];
  const updated = {
    ...existing,
    AnhBanner: typeof AnhBanner !== 'undefined' ? AnhBanner : existing.AnhBanner,
    DuongDan: typeof DuongDan !== 'undefined' ? DuongDan : existing.DuongDan,
  };
  banners[idx] = updated;
  const ok = writeBanners(banners);
  if (!ok) throw new Error('Unable to persist banner update');
  return updated;
}

function deleteBanner(id) {
  const banners = getBanners();
  const idx = banners.findIndex((b) => String(b.MaBanner || b.id) === String(id));
  if (idx === -1) return false;
  banners.splice(idx, 1);
  const ok = writeBanners(banners);
  if (!ok) throw new Error('Unable to persist banner deletion');
  return true;
}

module.exports = { getBanners, addBanner, updateBanner, deleteBanner };

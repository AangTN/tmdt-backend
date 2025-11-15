const express = require('express');
const router = express.Router();
const bannerController = require('./banner.controller');

router.get('/', bannerController.getBanners);
router.post('/', bannerController.createBanner);
router.put('/:id', bannerController.editBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;

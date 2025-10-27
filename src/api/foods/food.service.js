const foodRepository = require('./food.repository');

const getAllFoods = async () => {
	const foods = await foodRepository.findAllFoods();
	// Flatten categories for a cleaner payload and keep LoaiMonAn as is
	return foods.map(({ MonAn_DanhMuc, ...rest }) => ({
		...rest,
		DanhMuc: Array.isArray(MonAn_DanhMuc)
			? MonAn_DanhMuc.map((md) => md.DanhMuc)
			: [],
	}));
};

const getFoodDetail = (id) => foodRepository.findFoodById(id);

module.exports = { getAllFoods, getFoodDetail };

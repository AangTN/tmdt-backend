const foodRepository = require('./food.repository');

const calcRatingStats = (ratings = []) => {
	const count = ratings.length || 0;
	const avg = count
		? Number((ratings.reduce((sum, r) => sum + (r.SoSao || 0), 0) / count).toFixed(2))
		: 0;
	return { SoDanhGia: count, SoSaoTrungBinh: avg };
};

const getAllFoods = async () => {
	const [foods, stats] = await Promise.all([
		foodRepository.findAllFoods(),
		foodRepository.findFoodsRatingStats(),
	]);

	// index stats by MaMonAn for quick lookup
	const statsMap = new Map(
		stats.map((s) => [s.MaMonAn, {
			SoSaoTrungBinh: Number((s._avg.SoSao || 0).toFixed(2)),
			SoDanhGia: s._count.SoSao || 0,
		}])
	);

	// Flatten categories and attach stats (default 0 when missing)
	return foods.map(({ MonAn_DanhMuc, ...rest }) => {
		const st = statsMap.get(rest.MaMonAn) || { SoSaoTrungBinh: 0, SoDanhGia: 0 };
		return {
			...rest,
			DanhMuc: Array.isArray(MonAn_DanhMuc)
				? MonAn_DanhMuc.map((md) => md.DanhMuc)
				: [],
			...st,
		};
	});
};

const getFoodDetail = async (id) => {
	const food = await foodRepository.findFoodById(id);
	if (!food) return null;

	const { DanhGiaMonAn = [], MonAn_DanhMuc = [], ...rest } = food;
	const { SoDanhGia, SoSaoTrungBinh } = calcRatingStats(DanhGiaMonAn);

	return {
		...rest,
		DanhMuc: Array.isArray(MonAn_DanhMuc)
			? MonAn_DanhMuc.map((md) => md.DanhMuc)
			: [],
		DanhGiaMonAn, // already filtered to TrangThai = 'Hiển thị'
		SoDanhGia,
		SoSaoTrungBinh,
	};
};

module.exports = { getAllFoods, getFoodDetail };

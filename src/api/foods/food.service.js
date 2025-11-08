const foodRepository = require('./food.repository');

const calcRatingStats = (ratings = []) => {
	const count = ratings.length || 0;
	const avg = count
		? Number((ratings.reduce((sum, r) => sum + (r.SoSao || 0), 0) / count).toFixed(2))
		: 0;
	return { SoDanhGia: count, SoSaoTrungBinh: avg };
};

const getAllFoods = async () => {
	// Thực thi tuần tự để tránh lỗi prepared statement với PgBouncer Supabase
	const foods = await foodRepository.findAllFoods();
	let stats = [];
	try {
		stats = await foodRepository.findFoodsRatingStats();
	} catch (err) {
		// Nếu groupBy lỗi (PgBouncer / quyền), log cảnh báo và tiếp tục với stats rỗng
		console.warn('Warning: findFoodsRatingStats failed, continuing without rating stats:', err.message);
	}

	const statsMap = new Map(
		stats.map((s) => [
			s.MaMonAn,
			{
				SoSaoTrungBinh: Number((s._avg.SoSao || 0).toFixed(2)),
				SoDanhGia: s._count.SoSao || 0,
			},
		])
	);

	return foods.map(({ MonAn_DanhMuc, ...rest }) => {
		const st = statsMap.get(rest.MaMonAn) || { SoSaoTrungBinh: 0, SoDanhGia: 0 };
		return {
			...rest,
			DanhMuc: Array.isArray(MonAn_DanhMuc) ? MonAn_DanhMuc.map((md) => md.DanhMuc) : [],
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

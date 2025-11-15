const categoryRepository = require('./category.repository');

const getAllCategories = () => categoryRepository.findAllCategories();

const createCategory = async (data) => {
  // Validate required fields
  if (!data.tenDanhMuc) {
    const e = new Error('Thiếu thông tin bắt buộc: tenDanhMuc');
    e.status = 400;
    throw e;
  }

  // Check for duplicate name
  const existing = await categoryRepository.findCategoryByName(data.tenDanhMuc);
  if (existing) {
    const e = new Error('Tên danh mục đã tồn tại');
    e.status = 400;
    throw e;
  }

  return categoryRepository.createCategory(data);
};

const updateCategory = async (id, data) => {
  // Validate required fields
  if (!data.tenDanhMuc) {
    const e = new Error('Thiếu thông tin bắt buộc: tenDanhMuc');
    e.status = 400;
    throw e;
  }

  // Check if category exists
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    const e = new Error('Không tìm thấy danh mục');
    e.status = 404;
    throw e;
  }

  // Check for duplicate name (exclude current record)
  const existing = await categoryRepository.findCategoryByName(data.tenDanhMuc);
  if (existing && existing.MaDanhMuc !== Number(id)) {
    const e = new Error('Tên danh mục đã tồn tại');
    e.status = 400;
    throw e;
  }

  return categoryRepository.updateCategory(id, data);
};

const deleteCategory = async (id) => {
  // Check if category exists
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    const e = new Error('Không tìm thấy danh mục');
    e.status = 404;
    throw e;
  }

  // Check if any foods use this category
  const foodCount = await categoryRepository.countFoodsByCategory(id);
  if (foodCount > 0) {
    const e = new Error(`Không thể xóa danh mục này vì có ${foodCount} món ăn đang sử dụng`);
    e.status = 400;
    throw e;
  }

  return categoryRepository.deleteCategory(id);
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };

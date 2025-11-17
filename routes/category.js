import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const router = express.Router();

/**
 * GET /categories
 * 获取所有 category（仅 is_active = true）
 */
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find({ is_active: true })
      .sort({ sort_order: 1 });

    return res.sendSuccess(categories);

  } catch (err) {
    next(err);
  }
});

/**
 * GET /categories/:id/products
 * 获取某分类下的所有商品
 */
router.get("/:id/products", async (req, res, next) => {
  try {
    const categoryId = parseInt(req.params.id);

    // 1. 确认分类存在
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
      return res.sendError("Category Not Found", "CATEGORY_404", 404);
    }

    // 2. 获取该分类下所有商品
    const products = await Product.find({ category_id: categoryId })
      .sort({ updated_at: -1 });  // 可以按更新时间排序

    return res.sendSuccess(products);
  } catch (err) {
    next(err);
  }
});

export default router;

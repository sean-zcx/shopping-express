import express from "express";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

/**
 * GET /products/hot
 * 获取所有 display_status = 2 的热门商品
 */
router.get("/hot", async (req, res, next) => {
    try {
        const hotItems = await Product.find({ display_status: 2 })
            .sort({ updated_at: -1 });   // 最新的排在前面（可选）

        return res.sendSuccess(hotItems);

    } catch (err) {
        next(err);
    }
});

/**
 * GET /products/discount
 * 获取 sale_status = 1 的促销商品
 */
router.get("/discount", async (req, res, next) => {
    try {
        const saleItems = await Product.find({
            $expr: { $lt: ["$sale_price", "$original_price"] }
        }).sort({ updated_at: -1 });

        return res.sendSuccess(saleItems);

    } catch (err) {
        next(err);
    }
});

/**
 * GET /products/best-selling
 * 获取畅销商品（按 sold_count 从高到低排序）
 */
router.get("/best-selling", async (req, res, next) => {
    try {
        let query = Product.find().sort({ sold_count: -1 });
        query = query.limit(10);
        const bestSelling = await query.exec();

        return res.sendSuccess(bestSelling);

    } catch (err) {
        next(err);
    }
});


/**
 * GET /products/upcoming
 * 获取即将发售的商品（sale_status = 2 或 sale_status = 3）
 */
router.get("/upcoming", async (req, res, next) => {
  try {
    const upcomingItems = await Product.find({
      sale_status: { $in: [2, 3] }
    }).sort({ updated_at: -1 }); // 最新的排前面（可选）

    return res.sendSuccess(upcomingItems);

  } catch (err) {
    next(err);
  }
});

/**
 * GET /products/:guid
 * 根据商品 GUID 获取商品详情
 */
router.get("/:guid", async (req, res, next) => {
  try {
    const guid = req.params.guid;

    // 查找商品
    const product = await Product.findOne({ guid });

    // 如果没找到
    if (!product) {
      return res.sendError("Product Not Found", "PRODUCT_404", 404);
    }

    // 返回成功
    return res.sendSuccess(product);

  } catch (err) {
    next(err);
  }
});

export default router;

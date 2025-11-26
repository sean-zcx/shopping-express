import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import CartItem from "../models/Cart.js";

const router = express.Router();

// /**
//  * GET /categories
//  * 获取所有 category（仅 is_active = true）
//  */
// router.get("/", async (req, res, next) => {
//   try {
//     const categories = await Category.find({ is_active: true })
//       .sort({ sort_order: 1 });

//     return res.sendSuccess(categories);

//   } catch (err) {
//     next(err);
//   }
// });

/**
 * GET /cart/:uid/cart-items
 * 获取 uid 的购物车商品列表
 */
router.get("/:uid/cart-items", async (req, res, next) => {
  try {
    const uid = req.params.uid;

    // 获取该用户的购物车商品列表
    const resp = await CartItem.findOne({ uid });

    console.log("RESP:", JSON.stringify(resp, null, 2));   // 完整结构
    console.log("ALL KEYS:", Object.keys(resp._doc));      // 字段名

    if (!resp) {
      return res.sendError("Cart Items Not Found", "CART_ITEMS_404", 404);
    }
    const items = resp.cart_items;
    console.log('items', items)

    // const cartItems = resp['cart_items'];

    return res.sendSuccess(items);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /cart/:uid/cart-items
 * 为 uid 的购物车添加商品
 */
// TODO: finish this
router.post("/:uid/cart-items", async (req, res, next) => {
  try {
    const uid = req.params.uid;
    const newItem = req.body;
    newItem.created_at = new Date();
    newItem.updated_at = new Date();
    console.log("New Item:", newItem);
    // 查找该用户的购物车
    let cart = await CartItem.findOne({ uid });

    if (!cart) {
      // 如果没有购物车，则创建一个新的购物车
      cart = new CartItem({
        uid,    
        cart_items: [newItem],
        created_at: new Date(),
        updated_at: new Date()
      });
    } else {
      // 如果有购物车，则添加商品到 cart_items 数组
      cart.cart_items.push(newItem);
      cart.updated_at = new Date();
    }

    await cart.save();

    return res.sendSuccess(cart);
  } catch (err) {
    next(err);
  }
});

export default router;

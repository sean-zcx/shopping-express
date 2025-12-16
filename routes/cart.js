import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /cart/cart-items
 * 获取 uid 的购物车商品列表
 */
router.get("/cart-items", authMiddleware, async (req, res, next) => {
  try {
    const uid = req.auth.uid;

    // 获取该用户的购物车商品列表
    const resp = await Cart.findOne({ uid });

    if (!resp) {
      // 创建一个新的购物车
      const newCart = await Cart.create({ uid, cart_items: [] });
      return res.sendSuccess(newCart.cart_items);
    }

    console.log("RESP:", JSON.stringify(resp, null, 2));   // 完整结构
    console.log("ALL KEYS:", Object.keys(resp._doc));      // 字段名
    const items = resp.cart_items;
    console.log('items', items)

    // const cartItems = resp['cart_items'];

    return res.sendSuccess(items);
  } catch (err) {
    next(err);
  }
});


/**
* POST /cart/update
* SKU-aware cart upsert
*/
router.post("/update", authMiddleware, async (req, res, next) => {
  try {
    console.log("REQUEST BODY:", req.body);
    const uid = req.auth.uid;
    const { productGuid, quantity, variantCombination } = req.body;

    if (!productGuid || typeof quantity !== "number") {
      return res.sendError("Invalid request", "CART_400", 400);
    }

    if (quantity < 0) {
      return res.sendError("Quantity cannot be negative", "CART_400", 400);
    }

    // 1️⃣ 查商品
    const product = await Product.findOne({ guid: productGuid });
    if (!product) {
      return res.sendError("Product Not Found", "PRODUCT_404", 404);
    }

    console.log(`Updating cart for UID: ${uid}, Product GUID: ${productGuid}, Quantity: ${quantity}`);
    console.log("Product Found:", product);

    // 校验 product_type
    if (product.product_type === 'variant') {
      if (!variantCombination) {
        return res.sendError(
          "Variant selection required",
          "VARIANT_REQUIRED",
          400
        );
      }
    } else {
      if (variantCombination) {
        return res.sendError(
          "Variant not supported for this product",
          "VARIANT_NOT_ALLOWED",
          400
        );
      }
    }

    // 2️⃣ 查购物车
    // 查找该用户的购物车（一定能找到，注册时创建）
    let cart = await Cart.findOne({ uid });
    if (!cart) {
      // return res.sendError("Cart Not Found", "CART_404", 404);

      // 创建一个新的购物车
      cart = await Cart.create({ uid, cart_items: [] });
    }
    console.log("Cart:", JSON.stringify(cart, null, 2));

    // 3️⃣ SKU 匹配（productGuid + variantCombination）
    // 查找是否已有该商品
    const existingIndex = cart.cart_items.findIndex(
      item => {
        const sameProduct = item.product_guid === productGuid;
        const sameVariant =
          JSON.stringify(item.variant_combination || null) ===
          JSON.stringify(variantCombination || null);
        return sameProduct && sameVariant;
      }
    );

    // 4️⃣ quantity = 0 → 删除 SKU
    if (quantity === 0) {
      if (existingIndex !== -1) {
        cart.cart_items.splice(existingIndex, 1);
      }
      await cart.save();
      return res.sendSuccess(cart.cart_items);
    }

    // 5️⃣ 已存在 SKU → 只更新数量
    if (existingIndex !== -1) {
      cart.cart_items[existingIndex].quantity = quantity;
      cart.cart_items[existingIndex].updated_at = new Date();
      await cart.save();
      return res.sendSuccess(cart.cart_items);
    }

    // 6️⃣ 新 SKU → 锁价后加入
    let originalPrice;
    let salePrice;

    if (variantCombination) {
      const variant = product.variants.find(v => {
        const combo = v.combination;
        console.log('combo:', JSON.stringify(combo, null, 2));
        const comboObj = Object.fromEntries(combo);
        console.log('comboObj:', JSON.stringify(comboObj, null, 2));
        console.log('variantCombination:', JSON.stringify(variantCombination, null, 2));

        // 1️⃣ 键数量必须一致
        console.log('length match:', Object.keys(comboObj).length, Object.keys(variantCombination).length);
        if (Object.keys(comboObj).length !== Object.keys(variantCombination).length) {
          return false;
        }

        // 2️⃣ 每个 key-value 都必须一致
        const valueMatch = Object.entries(comboObj).every(
          ([k, v2]) => variantCombination[k] === v2
        );
        console.log('valueMatch:', valueMatch);
        return valueMatch;
      });

      console.log('product.variants:', product.variants);
      console.log('variant:', variant);

      if (!variant || !variant.available) {
        return res.sendError("Variant unavailable", "VARIANT_404", 400);
      }

      if (
        variant.original_price == null ||
        variant.sale_price == null
      ) {
        return res.sendError(
          "Variant price unavailable",
          "VARIANT_PRICE_INVALID",
          400
        );
      }

      originalPrice = variant.original_price;
      salePrice = variant.sale_price;
    } else {
      originalPrice = product.original_price;
      salePrice = product.sale_price;
    }

    cart.cart_items.push({
      product_guid: product.guid,
      variant_key: variantCombination ? Object.values(variantCombination).join("_") : "default",
      name: product.name,
      image_url: product.image_url,
      variant_combination: variantCombination ?? null,
      quantity,
      original_price: originalPrice,
      sale_price: salePrice,
      selected: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    await cart.save();
    return res.sendSuccess(cart.cart_items);
  } catch (err) {
    next(err);
  }
});





/**
* TEST
* POST /cart/update
* SKU-aware cart upsert
*/
router.post("/update/test", async (req, res, next) => {
  try {
    console.log("REQUEST BODY:", req.body);
    const { uid, productGuid, quantity, variantCombination } = req.body;

    if (!productGuid || typeof quantity !== "number") {
      return res.sendError("Invalid request", "CART_400", 400);
    }

    if (quantity < 0) {
      return res.sendError("Quantity cannot be negative", "CART_400", 400);
    }

    // 1️⃣ 查商品
    const product = await Product.findOne({ guid: productGuid });
    if (!product) {
      return res.sendError("Product Not Found", "PRODUCT_404", 404);
    }

    console.log(`Updating cart for UID: ${uid}, Product GUID: ${productGuid}, Quantity: ${quantity}`);
    console.log("Product Found:", product);

    // 校验 product_type
    if (product.product_type === 'variant') {
      if (!variantCombination) {
        return res.sendError(
          "Variant selection required",
          "VARIANT_REQUIRED",
          400
        );
      }
    } else {
      if (variantCombination) {
        return res.sendError(
          "Variant not supported for this product",
          "VARIANT_NOT_ALLOWED",
          400
        );
      }
    }

    // 2️⃣ 查购物车
    // 查找该用户的购物车（一定能找到，注册时创建）
    let cart = await Cart.findOne({ uid });
    if (!cart) {
      // 创建一个新的购物车
      cart = await Cart.create({ uid, cart_items: [] });
    }
    console.log("Cart:", JSON.stringify(cart, null, 2));

    // 3️⃣ SKU 匹配（productGuid + variantCombination）
    // 查找是否已有该商品
    const existingIndex = cart.cart_items.findIndex(
      item => {
        const sameProduct = item.product_guid === productGuid;
        const sameVariant =
          JSON.stringify(item.variant_combination || null) ===
          JSON.stringify(variantCombination || null);
        return sameProduct && sameVariant;
      }
    );

    // 4️⃣ quantity = 0 → 删除 SKU
    if (quantity === 0) {
      if (existingIndex !== -1) {
        cart.cart_items.splice(existingIndex, 1);
      }
      await cart.save();
      return res.sendSuccess(cart.cart_items);
    }

    // 5️⃣ 已存在 SKU → 只更新数量
    if (existingIndex !== -1) {
      cart.cart_items[existingIndex].quantity = quantity;
      cart.cart_items[existingIndex].updated_at = new Date();
      await cart.save();
      return res.sendSuccess(cart.cart_items);
    }

    // 6️⃣ 新 SKU → 锁价后加入
    let originalPrice;
    let salePrice;

    if (variantCombination) {
      const variant = product.variants.find(v => {
        const combo = v.combination;
        console.log('combo:', JSON.stringify(combo, null, 2));
        const comboObj = Object.fromEntries(combo);
        console.log('comboObj:', JSON.stringify(comboObj, null, 2));
        console.log('variantCombination:', JSON.stringify(variantCombination, null, 2));

        // 1️⃣ 键数量必须一致
        console.log('length match:', Object.keys(comboObj).length, Object.keys(variantCombination).length);
        if (Object.keys(comboObj).length !== Object.keys(variantCombination).length) {
          return false;
        }

        // 2️⃣ 每个 key-value 都必须一致
        const valueMatch = Object.entries(comboObj).every(
          ([k, v2]) => variantCombination[k] === v2
        );
        console.log('valueMatch:', valueMatch);
        return valueMatch;
      });

      console.log('product.variants:', product.variants);
      console.log('variant:', variant);

      if (!variant || !variant.available) {
        return res.sendError("Variant unavailable", "VARIANT_404", 400);
      }

      if (
        variant.original_price == null ||
        variant.sale_price == null
      ) {
        return res.sendError(
          "Variant price unavailable",
          "VARIANT_PRICE_INVALID",
          400
        );
      }

      originalPrice = variant.original_price;
      salePrice = variant.sale_price;
    } else {
      originalPrice = product.original_price;
      salePrice = product.sale_price;
    }

    cart.cart_items.push({
      product_guid: product.guid,
      variant_key: variantCombination ? Object.values(variantCombination).join("_") : "default",
      name: product.name,
      image_url: product.image_url,
      variant_combination: variantCombination ?? null,
      quantity,
      original_price: originalPrice,
      sale_price: salePrice,
      selected: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    await cart.save();
    return res.sendSuccess(cart.cart_items);
  } catch (err) {
    next(err);
  }
});


export default router;

import express from "express";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

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
    const resp = await Cart.findOne({ uid });

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
 * POST /cart/:uid/add-item
 * 为 uid 的购物车添加商品
 * 请求体包含商品信息（product_guid, image_url, quantity, original_price, sale_price, selected）
 */
router.post("/:uid/add-item", async (req, res, next) => { })


/**
* POST /cart/:uid/add-item
* 为 uid 的购物车添加商品
* 请求体包含商品信息（product_guid, image_url, quantity, original_price, sale_price, selected）
*/
router.post("/update", async (req, res, next) => {
  try {
    console.log("REQUEST BODY:", req.body);
    const uid = req.body.uid;
    const productGuid = req.body.productGuid;
    const quantity = req.body.quantity;

    const product = await Product.findOne({ guid: productGuid });
    if (!product) {
      return res.sendError("Product Not Found", "PRODUCT_404", 404);
    }

    console.log(`Updating cart for UID: ${uid}, Product GUID: ${productGuid}, Quantity: ${quantity}`);
    console.log("Product Found:", product);


    // 查找该用户的购物车
    let resp = await Cart.findOne({ uid });

    console.log("RESP:", JSON.stringify(resp, null, 2));
    if (!resp) {
      // 如果没有购物车，则创建一个新的购物车
      resizeTo.cart_items = [new Cart({
        product_guid: product.guid,
        name: product.name,
        quantity: quantity,
        image_url: product.image_url,
        original_price: product.original_price,
        sale_price: product.sale_price,
        selected: true,
        created_at: new Date(),
        updated_at: new Date()
      })];
    } else {
      // 如果有购物车，则查找是否已有该商品
      const existingItemIndex = resp.cart_items.findIndex(
        item => item.product_guid === productGuid
      );
      if (existingItemIndex !== -1) {
        const p = resp.cart_items[existingItemIndex];
        console.log("Existing Cart Item:", p);

        // 如果数量为0，则从购物车中移除该商品
        if (quantity === 0) {
          resp.cart_items.splice(existingItemIndex, 1);
          console.log(`Removed product ${productGuid} from cart.`);
        }
        // 如果数量不为0，则更新该商品的信息
        else {

          p.product_guid = product.guid;
          p.name = product.name;
          p.image_url = product.image_url;
          p.original_price = product.original_price;
          p.sale_price = product.sale_price;
          p.selected = true;

          // 如果商品已存在，则更新数量和更新时间
          p.quantity = quantity;
          p.updated_at = new Date();
        }
      } else {
        // 如果商品不存在，则添加新商品
        const p = {
          product_guid: product.guid,
          name: product.name,
          quantity: quantity,
          image_url: product.image_url,
          original_price: product.original_price,
          sale_price: product.sale_price,
          selected: true,
          created_at: new Date(),
          updated_at: new Date()
        }

        resp.cart_items.push(p);
      }
    }

    await resp.save();
    return res.sendSuccess(resp.cart_items);
  } catch (err) {
    next(err);
  }
});



export default router;

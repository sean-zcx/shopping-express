import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import adminAuth from "../middleware/adminAuthMiddleware.js";
import { generateAdminTokens } from "../utils/token.js";

const router = express.Router();

/**
 * POST /admin/login
 * 管理员登录，返回 JWT Token
 */
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        console.log('[admin] login: email: ', email, 'password: ', password)

        // 1. 查找 admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.sendError("Admin not found", "ADMIN_404", 404);
        }

        console.log('[admin]', JSON.stringify(admin, null, 2))

        // 2. 密码验证
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.sendError("Wrong password", "ADMIN_WRONG_PASSWORD", 401);
        }

        // 3. 生成 JWT
        const { access_token, refresh_token } = generateAdminTokens(admin.email);


        const response = {
            access_token,
            refresh_token,
            token_type: "Bearer",
            expires_in: parseInt(process.env.TOKEN_ADMIN_EXPIRES_IN),
            issued_at: new Date().toISOString(),
            user: admin,
        };
        res.sendSuccess(response);

    } catch (err) {
        next(err);
    }
});

/* -----------------------------------------------------------
 * 以下为商品管理 API，需要管理员权限
 * ----------------------------------------------------------- */

router.use(adminAuth);


/**
 * GET /admin/products?page=1&limit=20
 * 管理员分页浏览所有商品
 */
router.get("/products", async (req, res, next) => {
    try {
        // 读取 query 参数
        const page = parseInt(req.query.page ?? 1);
        const limit = parseInt(req.query.limit ?? 20);
        const skip = (page - 1) * limit;

        // 并行执行，提高效率
        const [items, total] = await Promise.all([
            Product.find()
                .sort({ updated_at: -1 })  // 按更新时间倒序
                .skip(skip)
                .limit(limit),

            Product.countDocuments()
        ]);

        return res.sendSuccess({
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });

    } catch (err) {
        next(err);
    }
});


/**
 * GET /admin/products/:guid
 * 管理员获取商品
 */
router.get("/products/:guid", async (req, res, next) => {
    try {
        const product = await Product.findOne({ guid: req.params.guid });
        if (!product) {
            return res.sendError("Product Not Found", "PRODUCT_404", 404);
        }
        return res.sendSuccess(product);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /admin/products
 * 管理员创建商品
 */
router.post("/products", async (req, res, next) => {
    try {
        const {
            name,
            summary,
            description,
            display_status,
            sale_status,
            category_id,
            original_price,
            sale_price,
            sold_count,
            image_url,
            gallery,
            specs
        } = req.body;

        // 基础校验
        if (!name || !original_price) {
            return res.sendError("Missing required fields", "PRODUCT_VALIDATION_ERROR", 400);
        }

        // 自动生成 guid
        const guid = uuidv4(); // ⬅⬅⬅ 自动生成 GUID

        // 创建商品对象
        const newProduct = await Product.create({
            guid,
            name,
            summary: summary ?? "",
            description: description ?? "",
            display_status: display_status ?? 1,
            sale_status: sale_status ?? 1,
            category_id: category_id ?? null,
            original_price,
            sale_price: sale_price ?? original_price,
            sold_count: sold_count ?? 0,
            image_url: image_url ?? "",
            gallery: gallery ?? [],
            specs: specs ?? {},

            created_at: new Date().toISOString().split('.')[0] + "Z",
            updated_at: new Date().toISOString().split('.')[0] + "Z"
        });

        return res.sendSuccess(newProduct);

    } catch (err) {
        next(err);
    }
});

/**
 * PUT /admin/products/:guid
 * 更新商品
 */
router.put("/products/:guid", async (req, res, next) => {
    try {
        const guid = req.params.guid;

        // 自动更新时间
        const updatedAt = new Date().toISOString().split('.')[0] + "Z";

        // 更新的数据（允许部分字段更新）
        const updateData = {
            ...req.body,
            updated_at: updatedAt
        };

        const updated = await Product.findOneAndUpdate(
            { guid },
            updateData,
            { new: true } // 返回更新后的对象
        );

        if (!updated) {
            return res.sendError("Product Not Found", "PRODUCT_404", 404);
        }

        return res.sendSuccess(updated);

    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /admin/products/:guid
 * 删除商品
 */
router.delete("/products/:guid", async (req, res, next) => {
    try {
        const guid = req.params.guid;

        // 根据 guid 删除商品
        const deletedProduct = await Product.findOneAndDelete({ guid });

        if (!deletedProduct) {
            return res.sendError("Product Not Found", "PRODUCT_404", 404);
        }

        // 删除成功
        return res.sendSuccess({
            guid: deletedProduct.guid,
            message: "Product deleted successfully"
        });

    } catch (err) {
        next(err);
    }
});

export default router;

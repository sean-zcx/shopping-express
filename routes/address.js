import express from "express";
import { v4 as uuidv4 } from "uuid";
import AddressBook from "../models/AddressBook.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Create Address
 * POST /address/
 * 创建新的地址
 */
router.post("/", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    const body = req.body;

    let book = await AddressBook.findOne({ userId: uid });

    // 若不存在，创建一个新的 addressBook
    if (!book) {
        book = await AddressBook.create({
            userId: uid,
            addresses: []
        });
    }

    // 如果本次新增设置为默认地址，则清除旧默认
    if (body.isDefault) {
        book.addresses.forEach(a => (a.isDefault = false));
    }

    book.addresses.push(body);
    await book.save();

    return res.sendSuccess(book);
});

/**
 * Get all addresses for user
 * GET /address/
 * 获取用户的地址簿
 */
router.get("/", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    let book = await AddressBook.findOne({ userId: uid });
    if (!book) {
        book = await AddressBook.create({
            userId: req.user.userId,
            addresses: []
        });
    }
    return res.sendSuccess(book);
});

/**
 * Update address
 * PUT /address/:id
 * 更新地址信息
 */

router.put("/:id", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    const { isDefault } = req.body;
    const { id } = req.params;

    const book = await AddressBook.findOne({ userId: uid });

    if (!book) return res.status(404).json({ error: "AddressBook not found" });

    // 清除旧默认
    if (isDefault) {
        book.addresses.forEach(a => a.isDefault = false);
    }

    const address = book.addresses.find(a => a.id === id);
    if (!address) return res.status(404).json({ error: "Address not found" });

    Object.assign(address, req.body);

    await book.save();

    return res.sendSuccess(book);
});

/**
 * Delete address
 * DELETE /address/:id
 */
router.delete("/:id", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    const { id } = req.params;
    const book = await AddressBook.findOne({ userId: uid });

    if (!book) return res.status(404).json({ error: "AddressBook not found" });

    book.addresses = book.addresses.filter(a => a.id != id);

    await book.save();

    return res.sendSuccess(book);
});

/**
 * Get only default address
 * GET /address/default
 */
router.get("/default", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    const address = await Address.findOne({ userId: uid, isDefault: true });

    return res.sendSuccess(address);
});





/**
 * TEST
 * Create Address
 * POST /address/
 * 创建新的地址
 */
router.post("/test/", async (req, res, next) => {
    const body = req.body;
    const uid = body.uid;

    let book = await AddressBook.findOne({ userId: uid });

    // 若不存在，创建一个新的 addressBook
    if (!book) {
        book = await AddressBook.create({
            userId: uid,
            addresses: []
        });
    }

    // 如果本次新增设置为默认地址，则清除旧默认
    if (body.isDefault) {
        book.addresses.forEach(a => (a.isDefault = false));
    }

    body.id = uuidv4();  // 生成唯一 ID

    book.addresses.push(body);
    await book.save();

    return res.sendSuccess(book);
});

/**
 * TEST
 * Get all addresses for user
 * GET /address/
 * 获取用户的地址簿
 */
router.get("/test", async (req, res, next) => {
    const uid = req.body.uid;
    let book = await AddressBook.findOne({ userId: uid });
    if (!book) {
        book = await AddressBook.create({
            userId: uid,
            addresses: []
        });
    }
    return res.sendSuccess(book);
});

/**
 * TEST
 * Update address
 * PUT /address/:id
 * 更新地址信息
 */

router.put("/test/:id", async (req, res, next) => {
    const { uid, isDefault } = req.body;
    const { id } = req.params;
    console.log('[address], test update uid:', uid)
    console.log('[address], test update addressId:', id)
    console.log('[address], test update isDefault:', isDefault)

    const book = await AddressBook.findOne({ userId: uid });
    if (!book) return res.status(404).json({ error: "AddressBook not found" });

    // 清除旧默认
    if (isDefault) {
        book.addresses.forEach(a => a.isDefault = false);
    }

    const address = book.addresses.find(a => a.id === id);
    if (!address) return res.status(404).json({ error: "Address not found" });

    Object.assign(address, req.body);

    await book.save();

    return res.sendSuccess(book);
});

/**
 * TEST
 * Delete address
 * DELETE /address/:id
 */
router.delete("/test/:id", async (req, res, next) => {
    const uid = req.body.uid;
    const { id } = req.params;
    const book = await AddressBook.findOne({ userId: uid });

    if (!book) return res.status(404).json({ error: "AddressBook not found" });

    book.addresses = book.addresses.filter(a => a.id != id);

    await book.save();

    return res.sendSuccess(book);
});


export default router;

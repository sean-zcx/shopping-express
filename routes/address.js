import express from "express";
import { v4 as uuidv4 } from "uuid";
import AddressBook from "../models/AddressBook.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ensure there is always a default address when the list is non-empty
const ensureDefaultAddress = (addresses) => {
    if (addresses.length === 0) return;
    if (!addresses.some(a => a.is_default)) {
        addresses[0].is_default = true;
    }
};

/**
 * Create Address
 * POST /address/
 * 创建新的地址
 */
router.post("/", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    const body = req.body;

    let book = await AddressBook.findOne({ uid });

    // 若不存在，创建一个新的 addressBook
    if (!book) {
        book = await AddressBook.create({
            uid,
            addresses: []
        });
    }

    // 如果本次新增设置为默认地址，则清除旧默认
    if (body.is_default) {
        book.addresses.forEach(a => (a.is_default = false));
    }

    body.id = uuidv4();  // 生成唯一 ID

    book.addresses.push(body);
    ensureDefaultAddress(book.addresses);
    await book.save();

    const addresses = book.addresses;

    return res.sendSuccess(addresses);
});

/**
 * Get all addresses for user
 * GET /address/
 * 获取用户的地址簿
 */
router.get("/", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    let book = await AddressBook.findOne({ uid });
    if (!book) {
        book = await AddressBook.create({
            uid,
            addresses: []
        });
    }
    const addresses = book.addresses;
    return res.sendSuccess(addresses);
});

/**
 * Update address
 * PUT /address/:id
 * 更新地址信息
 */

router.put("/:id", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    const { is_default } = req.body;
    const { id } = req.params;

    const book = await AddressBook.findOne({ uid });

    if (!book) return res.status(404).json({ error: "AddressBook not found" });

    // 清除旧默认
    if (is_default) {
        book.addresses.forEach(a => a.is_default = false);
    }

    const address = book.addresses.find(a => a.id === id);
    if (!address) return res.status(404).json({ error: "Address not found" });

    Object.assign(address, req.body);

    ensureDefaultAddress(book.addresses);
    await book.save();

    const addresses = book.addresses;

    return res.sendSuccess(addresses);
});

/**
 * Delete address
 * DELETE /address/:id
 */
router.delete("/:id", authMiddleware, async (req, res, next) => {
    const uid = req.auth.uid;
    const { id } = req.params;
    const book = await AddressBook.findOne({ uid });

    if (!book) return res.status(404).json({ error: "AddressBook not found" });

    book.addresses = book.addresses.filter(a => a.id != id);

    ensureDefaultAddress(book.addresses);
    await book.save();

    const addresses = book.addresses;

    return res.sendSuccess(addresses);
});






// /**
//  * TEST
//  * Create Address
//  * POST /address/
//  * 创建新的地址
//  */
// router.post("/test/", async (req, res, next) => {
//     const body = req.body;
//     const uid = body.uid;

//     let book = await AddressBook.findOne({ uid });

//     // 若不存在，创建一个新的 addressBook
//     if (!book) {
//         book = await AddressBook.create({
//             uid,
//             addresses: []
//         });
//     }

//     // 如果本次新增设置为默认地址，则清除旧默认
//     if (body.is_default) {
//         book.addresses.forEach(a => (a.is_default = false));
//     }

//     body.id = uuidv4();  // 生成唯一 ID

//     book.addresses.push(body);
//     await book.save();

//     return res.sendSuccess(book);
// });

// /**
//  * TEST
//  * Get all addresses for user
//  * GET /address/
//  * 获取用户的地址簿
//  */
// router.get("/test", async (req, res, next) => {
//     const uid = req.body.uid;
//     let book = await AddressBook.findOne({ uid });
//     if (!book) {
//         book = await AddressBook.create({
//             uid,
//             addresses: []
//         });
//     }
//     return res.sendSuccess(book);
// });

// /**
//  * TEST
//  * Update address
//  * PUT /address/:id
//  * 更新地址信息
//  */

// router.put("/test/:id", async (req, res, next) => {
//     const { uid, is_default } = req.body;
//     const { id } = req.params;
//     console.log('[address], test update uid:', uid)
//     console.log('[address], test update addressId:', id)
//     console.log('[address], test update is_default:', is_default)
//     const book = await AddressBook.findOne({ uid });
//     if (!book) return res.status(404).json({ error: "AddressBook not found" });

//     // 清除旧默认
//     if (is_default) {
//         book.addresses.forEach(a => a.is_default = false);
//     }

//     const address = book.addresses.find(a => a.id === id);
//     if (!address) return res.status(404).json({ error: "Address not found" });

//     Object.assign(address, req.body);

//     await book.save();

//     return res.sendSuccess(book);
// });

// /**
//  * TEST
//  * Delete address
//  * DELETE /address/:id
//  */
// router.delete("/test/:id", async (req, res, next) => {
//     const uid = req.body.uid;
//     const { id } = req.params;
//     const book = await AddressBook.findOne({ uid });

//     if (!book) return res.status(404).json({ error: "AddressBook not found" });

//     book.addresses = book.addresses.filter(a => a.id != id);

//     await book.save();

//     return res.sendSuccess(book);
// });


export default router;

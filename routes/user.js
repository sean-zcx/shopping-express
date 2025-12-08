import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET 
 * 获取用户简介
 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const uid = req.auth.uid;
    const user = await User.findOne({ uid });

    console.log('[User] get-user-profile', JSON.stringify(user, null, 2))

    return res.sendSuccess(user);

  } catch (err) {
    next(err);
  }
});

export default router;

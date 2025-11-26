import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import { generateTokens } from "../utils/token.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import AppError from "../utils/AppError.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Auth Test");
});

/**
 * Register
 */
router.post("/register", async (req, res) => {
    const { phone, email, username, password, first_name, last_name } = req.body;

    const existed = await User.findOne({ email });
    if (existed) return res.status(400).json({ msg: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        guid: uuidv4(),
        phone,
        email,
        username,
        first_name,
        last_name,
        avatar_url: "assets/images/demo_avatars/1.jpg",
        password: hashed
    });

    res.json({ msg: "User registered", user });
});

/**
 * Firebase Login
 */
router.post("/firebase-login", async (req, res) => {
    console.log("Firebase Login was called");
    const { uid } = req.body;

    if (!uid) {
      throw new AppError("Missing uid", 422, "AUTH_INPUT_ERROR");
    }


    const users = await User.find({ status: 1 });
    console.log("users: ", users)

    const user = await User.findOne({ uid });
    if (!user) {
      throw new AppError("Incorrect uid", 401, "AUTH_001");
    }

    // const match = await bcrypt.compare(password, user.password);
    // if (!match) return res.status(401).json({ msg: "Incorrect password" });

    const { access_token, refresh_token } = generateTokens(user);

    const response = {
        access_token,
        refresh_token,
        token_type: "Bearer",
        expires_in: parseInt(process.env.TOKEN_EXPIRES_IN),
        issued_at: new Date().toISOString(),
        user: {
            uid: user.uid,
            phone: user.phone,
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
    };
    res.sendSuccess(response);
});

/**
 * Login
 */
router.post("/login", async (req, res) => {
    console.log("Login was called");
    const { phone, password } = req.body;

    if (!phone || !password) {
      throw new AppError("Missing phone or password", 422, "AUTH_INPUT_ERROR");
    }


    const users = await User.find({ status: 1 });
    console.log("users: ", users)

    const user = await User.findOne({ phone });
    if (!user) {
      throw new AppError("Incorrect phone", 401, "AUTH_001");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Incorrect password" });

    const { access_token, refresh_token } = generateTokens(user);

    const response = {
        access_token,
        refresh_token,
        token_type: "Bearer",
        expires_in: parseInt(process.env.TOKEN_EXPIRES_IN),
        issued_at: new Date().toISOString(),
        user: {
            guid: user.guid,
            phone: user.phone,
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
    };
    res.sendSuccess(response);
});

/**
 * Protected Profile
 */
router.get("/profile", authMiddleware, async (req, res) => {
    const user = await User.findOne({ guid: req.user.guid });

    res.json({
        msg: "Profile loaded",
        user
    });
});

export default router;

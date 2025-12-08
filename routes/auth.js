import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { generateTokens } from "../utils/token.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import AppError from "../utils/AppError.js";
import admin from "firebase-admin";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Auth Test");
});

/**
 * Register
 */
router.post("/register", async (req, res) => {
    const { phone, email, username, id_token, first_name, last_name } = req.body;

    if (!id_token) {
        throw new AppError("Missing id_token", 422, "AUTH_INPUT_ERROR");
    }

    // 验证 Firebase ID Token
    var uid;
    try {
        // 使用 Firebase Admin SDK 验证 ID Token
        const decodedToken = await admin.auth().verifyIdToken(id_token);
        console.log('[auth] firebase-login: decodedToken', JSON.stringify(decodedToken, null, 2));
        uid = decodedToken.uid;
        console.log('[auth] firebase-login: uid', uid);
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        throw new AppError("Invalid ID token", 401, "AUTH_INVALID_TOKEN");
    }

    const existed = await User.findOne({ uid });
    if (existed) return res.status(400).json({ msg: "UID already used" });

    const user = await User.create({
        uid,
        phone,
        email,
        username,
        first_name,
        last_name,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
    });
    const cart = await Cart.findOne({ uid });
    if (!cart) {
        Cart.create({ uid: user.uid });
    }

    console.log('[auth] register: user', JSON.stringify(user, null, 2));

    const { access_token, refresh_token } = generateTokens(uid);

    const response = {
        access_token,
        refresh_token,
        token_type: "Bearer",
        expires_in: parseInt(process.env.TOKEN_EXPIRES_IN),
        issued_at: new Date().toISOString(),
        user,
    };
    res.sendSuccess(response);
});

/**
 * Firebase Login
 */
router.post("/firebase-login", async (req, res) => {
    console.log("Firebase Login was called");
    const { id_token } = req.body;

    if (!id_token) {
        throw new AppError("Missing id_token", 422, "AUTH_INPUT_ERROR");
    }

    // 验证 Firebase ID Token
    // 使用 Firebase Admin SDK 验证 ID Token
    const decodedToken = await admin.auth().verifyIdToken(id_token);
    console.log('[auth] firebase-login: decodedToken', JSON.stringify(decodedToken, null, 2));

    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name;
    const picture = decodedToken.picture;
    console.log('[auth] firebase-login: uid', uid);


    const user = await User.findOne({ uid });
    console.log('[auth] firebase-login: user', user);

    if (!user) {
        user = await User.create({
            firebaseUid: uid,
            email,
            name,
            avatar: picture,
        });
    }

    const { access_token, refresh_token } = generateTokens(uid);

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

// /**
//  * Login
//  */
// router.post("/login", async (req, res) => {
//     console.log("Login was called");
//     const { phone, password } = req.body;

//     if (!phone || !password) {
//       throw new AppError("Missing phone or password", 422, "AUTH_INPUT_ERROR");
//     }


//     const users = await User.find({ status: 1 });
//     console.log("users: ", users)

//     const user = await User.findOne({ phone });
//     if (!user) {
//       throw new AppError("Incorrect phone", 401, "AUTH_001");
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ msg: "Incorrect password" });

//     const { access_token, refresh_token } = generateTokens(user);

//     const response = {
//         access_token,
//         refresh_token,
//         token_type: "Bearer",
//         expires_in: parseInt(process.env.TOKEN_EXPIRES_IN),
//         issued_at: new Date().toISOString(),
//         user: {
//             guid: user.guid,
//             phone: user.phone,
//             email: user.email,
//             username: user.username,
//             first_name: user.first_name,
//             last_name: user.last_name,
//             avatar_url: user.avatar_url,
//             status: user.status,
//             created_at: user.created_at,
//             updated_at: user.updated_at
//         }
//     };
//     res.sendSuccess(response);
// });

/**
 * Protected Profile
 */
router.get("/profile", authMiddleware, async (req, res) => {
    const uid = req.auth.uid;
    const user = await User.findOne({ uid });

    res.json({
        msg: "Profile loaded",
        user
    });
});

export default router;

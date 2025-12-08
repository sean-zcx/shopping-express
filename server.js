import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import categoryRoutes from "./routes/category.js";
import cartRoutes from "./routes/cart.js";
import userRoutes from "./routes/user.js";

import { responseWrapper } from "./middleware/responseWrapper.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import mongoose from "mongoose";

import admin from "firebase-admin";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';



const app = express();
app.use(cors());
app.use(express.json());


// 用 ESM 的方式获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 读取 serviceAccountKey.json
const serviceAccount = JSON.parse(
  await readFile(path.join(__dirname, "./server/test-proj-abc123-firebase-adminsdk-fbsvc-b90721074b.json"), "utf8")
);
// 初始化 Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 推送 API：POST /send-notification
app.post("/send-notification", async (req, res) => {
  const { token, guid, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data: {
      type: "product_detail",
      guid
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("👍 Successfully sent message:", response);
    res.json({ success: true, response });
  } catch (error) {
    console.error("🔥 Error sending message:", error);
    res.status(500).json({ success: false, error });
  }
});


app.use(responseWrapper);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/user", userRoutes);

// 404 handler（路由之后）
app.use(notFoundHandler);

// 错误处理（必须是最后一个）
app.use(errorHandler);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3000");
});

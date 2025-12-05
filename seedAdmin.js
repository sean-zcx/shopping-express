import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

async function createAdmin() {
  try {
    // 连接 MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🌱 Connected to MongoDB");

    const email = "admin@test.com";
    const password = "123456";

    // 检查账号是否已存在
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("⚠️ Admin already exists:");
      console.log(existing);
      process.exit(0);
    }

    // bcrypt 加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建管理员
    const admin = await Admin.create({
      email,
      password: hashedPassword,
    });

    console.log("✅ Admin account created!");
    console.log(admin);

    process.exit(0);

  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();

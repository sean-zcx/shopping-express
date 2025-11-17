import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import categoryRoutes from "./routes/category.js";

import { responseWrapper } from "./middleware/responseWrapper.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import mongoose from "mongoose";



const app = express();
app.use(cors());
app.use(express.json());
app.use(responseWrapper);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);

// 404 handler（路由之后）
app.use(notFoundHandler);

// 错误处理（必须是最后一个）
app.use(errorHandler);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:3000");
});

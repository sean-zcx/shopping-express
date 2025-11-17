import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  guid: String,
  name: String,
  summary: String,
  description: String,

  display_status: Number,    // <-- 热门 / 首页展示状态
  sale_status: Number,
  category_id: Number,

  original_price: Number,
  sale_price: Number,
  sold_count: Number,

  image_url: String,
  gallery: [String],

  specs: {
    display: String,
    chipset: String,
    memory: String,
    battery: String,
    os: String,
  },

  created_at: Date,
  updated_at: Date,
});

export default mongoose.model("Product", productSchema);

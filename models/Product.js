import mongoose from "mongoose";

//
// ① Options Schema（如尺寸、颜色）
//
const productOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },      // 如 "size"
    values: { type: [String], required: true },  // 如 ["S","M","L"]
  },
  { _id: false }
);

//
// ② Variants Schema（SKU 组合）
//
const productVariantSchema = new mongoose.Schema(
  {
    // 组合，如 { size:"M", color:"Red" }
    combination: {
      type: Map,
      of: String,
      required: true
    },

    // 如果价格为 null => unavailable（前端自动识别）
    original_price: { type: Number, default: null },
    sale_price: { type: Number, default: null },

    image_url: { type: String },
    gallery: { type: [String], default: [] },

    // 是否可购买
    available: { type: Boolean, default: false },

    // 未来扩展用:
    sku_code: { type: String },  // SKU 编码（可选）
    stock: { type: Number, default: 0 }, // 库存（可选）
  },
  { _id: false }
);


const productSchema = new mongoose.Schema({
  /// 基础信息
  guid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  summary: { type: String },
  description: { type: String },

  display_status: { type: Number, required: true },    // <-- 热门 / 首页展示状态
  sale_status: { type: Number, required: true },
  category_id: { type: Number },

  /// Single 商品价格
  /// 对于 variant 模式可能不再使用
  original_price: { type: Number, required: true },
  sale_price: { type: Number },

  sold_count: { type: Number },

  image_url: { type: String },
  gallery: { type: [String], default: [] },

  /// 规格参数
  specs: { type: Map, of: mongoose.Schema.Types.Mixed },

  /// 商品类型："single" 或 "variant"
  product_type: {
    type: String,
    enum: ["single", "variant"],
    required: true,
    default: "single",
  },

  /// 可选项
  options: {
    type: [productOptionSchema],
    default: [],
  },

  /// SKU 组合列表
  variants: {
    type: [productVariantSchema],
    default: []
  },

  created_at: Date,
  updated_at: Date,
  updated_by: String,
});

export default mongoose.model("Product", productSchema);

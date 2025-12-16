import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product_guid: { type: String, required: true },
    name: { type: String, required: true },
    image_url: String,
    variant_combination: { type: Map, of: String }, // SKU 组合
    quantity: Number,
    original_price: Number,
    sale_price: Number,
    selected: Boolean,
    created_at: Date,
    updated_at: Date
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const cartSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    cart_items: [cartItemSchema]
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

cartSchema.index({ uid: 1 }, { unique: true });

export default mongoose.model("Cart", cartSchema);

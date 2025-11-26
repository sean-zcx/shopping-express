import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product_guid: String,
  image_url: String,
  quantity: Number,
  original_price: Number,
  sale_price: Number,
  selected: Boolean,
  created_at: Date,
  updated_at: Date
});

const cartSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  cart_items: [cartItemSchema],  // ← ★ 放在数组里
  created_at: Date,
  updated_at: Date
});

export default mongoose.model("Cart", cartSchema);

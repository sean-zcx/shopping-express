import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  image_url: String,
  sort_order: Number,
  is_active: Boolean,
  created_at: Date,
  updated_at: Date
});

export default mongoose.model("Category", categorySchema);

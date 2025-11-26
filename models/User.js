import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  phone: String,
  email: { type: String, required: true, unique: true },
  username: String,
  first_name: String,
  last_name: String,
  avatar_url: String,
  status: { type: Number, default: 1 },

  password: { type: String, required: true },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

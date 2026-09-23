import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
  },
  { timestamps: true }
);

// Prevent compiled model re-registration during Next.js hot-reloads
const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
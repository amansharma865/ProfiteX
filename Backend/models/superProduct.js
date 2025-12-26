const mongoose = require("mongoose");
const admin = require("./admin");

const SuperProductSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: admin,
      required: true,
    },
  },
  { timestamps: true }
);

// Add a unique compound index for product_id and user
SuperProductSchema.index({ product_id: 1, admin: 1 }, { unique: true });

module.exports = mongoose.model("SuperProduct", SuperProductSchema);

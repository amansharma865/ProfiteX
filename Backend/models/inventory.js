const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    item_id: {
      type: String,
      required: true,
      unique: true, // Ensures unique identification for inventory items
    },
    item_name: {
      type: String,
      required: true, // Name of the inventory item
    },
    item_quantity: {
      type: Number,
      required: true, // Quantity of the item in stock
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;

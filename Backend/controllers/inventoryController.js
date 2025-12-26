const mongoose = require('mongoose');
const Inventory = require('../models/inventory');
const InventoryBranch = require('../models/inventoryBranch');

//Add a new Inventory item
exports.addItem = async (req, res) => {
  try {
    const { item_id, item_name, item_quantity,inventory_type } = req.body;
    const {_id} = req.user;

    // Check if all required fields are provided
    if (!item_id || !item_name || !item_quantity|| !inventory_type) {
      return res.status(400).json({
        message: "failed",
        error: "Please fill all required fields"
      });
    }

    // Check if the inventory branch exists
    const inventory_ty = await InventoryBranch.findOne({
      $and:[{branchUser:_id},{inventoryBranch_type:inventory_type}]
    });
    if (!inventory_ty) {
      return res.status(404).json({
        message: "failed",
        error: 'Inventory branch not found'
      });
    }

    // Check if the item already exists
    const existingItem = await Inventory.findOne({ item_id });
    if (existingItem) {
      return res.status(409).json({
        message: "failed",
        error: 'Item with this ID already exists'
      });
    }

    // Create new inventory item
    const newItem = new Inventory({
      item_id,
      item_name,
      item_quantity,
      inventoryBranch: inventory_ty._id
    });

    // Save the new item
    await newItem.save();

    res.status(200).json({
      message: "Item added successfully",
      data: newItem
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message
    });
  }
};


// Get items by inventoryBranch
exports.getItemsByBranch = async (req, res) => {
  try {
    const { inventoryBranch_id } = req.params;

    // Validate inventoryBranch_id
    if (!mongoose.Types.ObjectId.isValid(inventoryBranch_id)) {
      return res.status(400).json({
        message: "failed",
        error: "Invalid inventory branch ID"
      });
    }

    // Find the inventory branch
    const inventoryBranch = await InventoryBranch.findById(inventoryBranch_id);
    if (!inventoryBranch) {
      return res.status(404).json({
        message: "failed",
        error: 'Inventory branch not found'
      });
    }

    // Find items under the inventory branch
    const items = await Inventory.find({ inventoryBranch: inventoryBranch._id }).populate('inventoryBranch');

    res.status(200).json({
      message: "Items retrieved successfully",
      data: items
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message
    });
  }
};

// Update inventory item name and/or quantity
exports.updateItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { item_name, item_quantity } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(400).json({
        message: "failed",
        error: 'Invalid item ID'
      });
    }

    const updateData = {};
    if (item_name) updateData.item_name = item_name;
    if (item_quantity !== undefined) updateData.item_quantity = item_quantity;

    // Check if there's any field to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "failed",
        error: 'No fields to update'
      });
    }

    // Update the item
    const item = await Inventory.findByIdAndUpdate(item_id, updateData, { new: true });
    if (!item) {
      return res.status(404).json({
        message: "failed",
        error: 'Item not found'
      });
    }

    res.status(200).json({
      message: "Item updated successfully",
      data: item
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message
    });
  }
};


// Delete an inventory item
exports.deleteItem = async (req, res) => {
  try {
    const { item_id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(400).json({
        message: "failed",
        error: 'Invalid item ID'
      });
    }

    // Find and delete the item
    const item = await Inventory.findByIdAndDelete(item_id);
    if (!item) {
      return res.status(404).json({
        message: "failed",
        error: 'Item not found'
      });
    }

    res.status(200).json({
      message: "Item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message
    });
  }
};




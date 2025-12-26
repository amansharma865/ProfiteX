const mongoose = require('mongoose');
const InventoryBranch = require('../models/inventoryBranch');
const Inventory = require('../models/inventory');

// Add a new inventoryBranch
exports.addInventoryBranch = async (req, res) => {
  try {
    const { inventoryBranch_id, inventoryBranch_type, location } = req.body;
    const {branch_id,_id} = req.user;

    // Validate required fields
    if (!inventoryBranch_id || !inventoryBranch_type || !location) {
      return res.status(400).json({
        message: "failed",
        error: "Please fill all required fields"
      });
    }


    // Check if inventory branch already exists with the given ID
    const branchExist = await InventoryBranch.findOne({ inventoryBranch_id });
    if (branchExist) {
      return res.status(409).json({
        message: "failed",
        error: 'Inventory branch with this ID already exists'
      });
    }

    // Check if there's already an inventory branch of the same type under the same branch
    const existingBranch = await InventoryBranch.findOne({ inventoryBranch_type, branch_id });
    if (existingBranch) {
      return res.status(409).json({
        message: "failed",
        error: `An inventory branch of type '${inventoryBranch_type}' already exists under this branch.`
      });
    }

    // Create a new inventory branch
    const newInventoryBranch = new InventoryBranch({
      inventoryBranch_id,
      inventoryBranch_type,
      location,
      branchUser:new mongoose.Types.ObjectId(_id)
    });

    await newInventoryBranch.save();
    res.status(201).json({
      message: "Inventory branch created successfully",
      data: newInventoryBranch
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message
    });
  }
};



// Get all inventoryBranches under same branch
exports.getInventoryBranches = async (req, res) => {
  try {
    const { _id } = req.user;
    let query = {};


    const inventoryBranches = await InventoryBranch.find({branchUser:_id});
    res.status(200).json({
      message: "Inventory branches retrieved successfully",
      data: inventoryBranches
    });
  } catch (error) {
    res.status(500).json({
      message: "failed",
      error: error.message
    });
  }
};


// Get all inventory items under each inventory branch of the same branch
exports.getItemsUnderBranch = async (req, res) => {
  try {
    const { branch_id } = req.params;

    // Validate branch_id if it should be an ObjectId
    if (!mongoose.Types.ObjectId.isValid(branch_id)) {
      return res.status(400).json({
        message: "failed",
        error: 'Invalid branch IDd'
      });
    }

    // Find all inventory branches under the given branch_id
    const inventoryBranches = await InventoryBranch.find({ branch_id });

    if (!inventoryBranches.length) {
      return res.status(404).json({ message: 'No inventory branches found for this branch' });
    }

    // Fetch all inventory items for each inventory branch found
    const items = await Inventory.find({
      inventoryBranch: { $in: inventoryBranches.map(branch => branch._id) }
    })

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



// Delete an inventoryBranch and its associated inventory items
exports.deleteInventoryBranch = async (req, res) => {
  try {
    const { inventoryBranch_id } = req.params;

    // Validate inventoryBranch_id if it should be an ObjectId
    if (!mongoose.Types.ObjectId.isValid(inventoryBranch_id)) {
      return res.status(400).json({
        message: "failed",
        error: 'Invalid inventory branch ID'
      });
    }

    // Find the inventory branch by its ID
    const inventoryBranch = await InventoryBranch.findById(inventoryBranch_id);
    if (!inventoryBranch) {
      return res.status(404).json({ message: 'Inventory branch not found' });
    }

    // Delete all associated inventory items
    await Inventory.deleteMany({ inventoryBranch: inventoryBranch._id });

    // Delete the inventory branch
    await InventoryBranch.findByIdAndDelete(inventoryBranch_id);

    res.status(200).json({ message: 'Inventory branch and its associated inventory items deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete inventory branch', error: error.message });
  }
};



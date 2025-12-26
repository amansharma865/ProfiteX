const mongoose = require('mongoose');
const warehouse = require('../models/warehouse');
const Product = require('../models/Product');
const SuperProduct = require('../models/superProduct');

const minValAndSizeForUser = async (req, res) => {
    try {
        const id = req.user._id;
        const { min_val, storage } = req.body;
        if (!min_val || !storage) {
            return res.status(404).json({
                success: false,
                message: 'all fields must be filled'
            });
        }

        // Check current total stock
        const result = await Product.aggregate([
            { $match: { user: id } },
            { $group: { _id: null, totalStocks: { $sum: '$stock' } } }
        ]);
        const currentStock = result.length > 0 ? result[0].totalStocks : 0;

        // Validate: warn if new storage < current stock
        let warningMessage = null;
        if (storage < currentStock) {
            warningMessage = `Warning: Your current stock (${currentStock} units) exceeds the new storage limit (${storage} units). You won't be able to add more products until you reduce stock below ${storage} units.`;
        }

        const findWarehouse = await warehouse.findOneAndUpdate({ owner: id }, {
            min_quantity: min_val,
            storage: storage
        }, {
            new: true
        });
        if (findWarehouse) {
            return res.status(200).json({
                success: true,
                message: warningMessage || 'details updated successfully',
                details: findWarehouse,
                warning: warningMessage ? true : false,
                capacityStatus: storage < currentStock ? 'OVER_LIMIT' : 'OK'
            })
        }
        const createWarehouse = new warehouse(
            {
                min_quantity: min_val,
                storage: storage,
                owner: id
            }
        )
        await createWarehouse.save();
        if (!createWarehouse) {
            return res.status(409).json({
                success: false,
                message: "error occured while saving warehouse details"
            })
        }
        return res.status(200).json({
            success: true,
            message: warningMessage || 'successfully updated details',
            details: createWarehouse,
            warning: warningMessage ? true : false,
            capacityStatus: storage < currentStock ? 'OVER_LIMIT' : 'OK'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occured while saving warehouse values" + error.message,
        })
    }
}

const minValAndSizeForAdmin = async (req, res) => {
    try {
        const id = req.user._id;
        const { min_val, storage } = req.body;
        if (!min_val || !storage) {
            return res.status(404).json({
                success: false,
                message: 'all fields must be filled'
            });
        }

        // Check current total stock for admin
        const result = await SuperProduct.aggregate([
            { $match: { admin: id } },
            { $group: { _id: null, totalStocks: { $sum: '$stock' } } }
        ]);
        const currentStock = result.length > 0 ? result[0].totalStocks : 0;

        // Validate: warn if new storage < current stock
        let warningMessage = null;
        if (storage < currentStock) {
            warningMessage = `Warning: Your current stock (${currentStock} units) exceeds the new storage limit (${storage} units). You won't be able to add more products until you reduce stock below ${storage} units.`;
        }

        const findWarehouse = await warehouse.findOneAndUpdate({ owner: id }, {
            min_quantity: min_val,
            storage: storage
        }, {
            new: true
        });
        if (findWarehouse) {
            return res.status(200).json({
                success: true,
                message: warningMessage || 'details updated successfully',
                details: findWarehouse,
                warning: warningMessage ? true : false,
                capacityStatus: storage < currentStock ? 'OVER_LIMIT' : 'OK'
            })
        }
        const createWarehouse = new warehouse(
            {
                min_quantity: min_val,
                storage: storage,
                owner: id
            }
        )
        await createWarehouse.save();
        if (!createWarehouse) {
            return res.status(409).json({
                success: false,
                message: "error occured while saving warehouse details"
            })
        }
        return res.status(200).json({
            success: true,
            message: warningMessage || 'successfully updated details',
            details: createWarehouse,
            warning: warningMessage ? true : false,
            capacityStatus: storage < currentStock ? 'OVER_LIMIT' : 'OK'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occured while saving warehouse values" + error.message,
        })
    }
}

const getDetails = async (req, res) => {
    try {
        const id = req.user._id;
        const findWarehouse = await warehouse.findOne({ owner: id });
        if (!findWarehouse) {
            // Return a successful response with default details when none are set
            return res.status(200).json({ success: true, message: 'no warehouse details found', details: { storage: 0, min_quantity: 0 } });
        }
        res.status(200).json({ success: true, message: "successfully retrieved data", details: findWarehouse });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occured while retrieving warehouse values" + error.message,
        })
    }
}
const getDetailsForAdmin = async (req, res) => {
    try {
        const id = req.user._id;
        const findWarehouse = await warehouse.findOne({ owner: id });
        if (!findWarehouse) {
            // Return a successful response with default details when none are set
            return res.status(200).json({ success: true, message: 'no warehouse details found', details: { storage: 0, min_quantity: 0 } });
        }
        res.status(200).json({ success: true, message: "successfully retrieved data", details: findWarehouse });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occured while retrieving warehouse values" + error.message,
        })
    }
}

module.exports = { minValAndSizeForUser, minValAndSizeForAdmin, getDetails, getDetailsForAdmin }
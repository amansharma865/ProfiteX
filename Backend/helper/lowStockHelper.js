const Product = require('../models/Product');
const SuperProduct = require('../models/superProduct');
const Warehouse = require('../models/warehouse');
const { createNotification } = require('./notificationHelper');

/**
 * Check if total stock is below minimum quantity and create notification if needed
 * @param {ObjectId} ownerId - User or Admin ID
 * @param {boolean} isAdmin - Whether owner is admin
 */
async function checkLowStockAndNotify(ownerId, isAdmin = false) {
    try {
        // 1. Get warehouse settings
        const warehouse = await Warehouse.findOne({ owner: ownerId });

        if (!warehouse || !warehouse.min_quantity || warehouse.min_quantity === 0) {
            return; // No minimum set, skip check
        }

        // 2. Get current total stock
        const ProductModel = isAdmin ? SuperProduct : Product;
        const ownerField = isAdmin ? 'admin' : 'user';

        const result = await ProductModel.aggregate([
            { $match: { [ownerField]: ownerId } },
            { $group: { _id: null, totalStocks: { $sum: '$stock' } } }
        ]);

        const currentStock = result.length > 0 ? result[0].totalStocks : 0;

        // 3. Check if below minimum
        if (currentStock < warehouse.min_quantity) {
            const deficit = warehouse.min_quantity - currentStock;

            // Create notification
            await createNotification(
                'low_stock',
                '⚠️ Low Inventory Alert',
                `Your inventory is running low! Current stock: ${currentStock} units. Minimum required: ${warehouse.min_quantity} units. You need to restock ${deficit} more units.`,
                ownerId,
                isAdmin ? 'admin' : 'user',
                null
            );

        }

    } catch (error) {
        console.error('Error in checkLowStockAndNotify:', error);
    }
}

module.exports = { checkLowStockAndNotify };

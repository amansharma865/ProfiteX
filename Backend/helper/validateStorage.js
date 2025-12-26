const Product = require('../models/Product');
const SuperProduct = require('../models/superProduct');
const Warehouse = require('../models/warehouse');

/**
 * Validates if adding stock would exceed warehouse storage capacity
 * @param {ObjectId} ownerId - User or Admin ID
 * @param {number} additionalStock - Stock units to add
 * @param {boolean} isAdmin - Whether owner is admin
 * @returns {Object} { valid, message, details }
 */
async function validateStorageCapacity(ownerId, additionalStock, isAdmin = false) {
    try {
        // 1. Handle decreasing stock (always allow)
        if (additionalStock <= 0) {
            return {
                valid: true,
                message: 'Stock decrease allowed',
                details: {}
            };
        }

        // 2. Get warehouse for owner
        const warehouse = await Warehouse.findOne({ owner: ownerId });

        // If no warehouse set, allow but could add warning
        if (!warehouse || !warehouse.storage || warehouse.storage === 0) {
            return {
                valid: true,
                message: 'No storage limit set - allowing addition',
                details: { warning: 'Please set warehouse storage capacity in inventory settings' }
            };
        }

        const storageLimit = warehouse.storage;

        // 3. Get current total stocks
        const ProductModel = isAdmin ? SuperProduct : Product;
        const ownerField = isAdmin ? 'admin' : 'user';

        const result = await ProductModel.aggregate([
            { $match: { [ownerField]: ownerId } },
            { $group: { _id: null, totalStocks: { $sum: '$stock' } } }
        ]);

        const currentStock = result.length > 0 ? result[0].totalStocks : 0;

        // 4. Calculate new total
        const totalAfterAdd = currentStock + additionalStock;

        // 5. Validate
        if (totalAfterAdd > storageLimit) {
            const excessAmount = totalAfterAdd - storageLimit;
            const remainingCapacity = storageLimit - currentStock;

            return {
                valid: false,
                message: `Storage capacity exceeded. Cannot add ${additionalStock} units.`,
                details: {
                    currentStock,
                    attemptedAdd: additionalStock,
                    totalAfterAdd,
                    storageLimit,
                    remainingCapacity: Math.max(0, remainingCapacity),
                    excessAmount
                }
            };
        }

        // 6. Valid - within capacity
        const remainingAfterAdd = storageLimit - totalAfterAdd;

        return {
            valid: true,
            message: 'Storage capacity check passed',
            details: {
                currentStock,
                addedStock: additionalStock,
                totalAfterAdd,
                storageLimit,
                remainingCapacity: remainingAfterAdd
            }
        };

    } catch (error) {
        console.error('Error in validateStorageCapacity:', error);
        // On error, allow operation but log (fail-open strategy)
        return {
            valid: true,
            message: 'Validation error - operation allowed',
            details: { error: error.message }
        };
    }
}

module.exports = { validateStorageCapacity };

import React from "react";

const LowStockAlert = ({ totalProduct, minQuantity }) => {
    // Don't show alert if min_quantity is 0 (not set) or if stock is adequate
    if (minQuantity === 0 || totalProduct >= minQuantity) {
        return null;
    }

    return (
        <div className="mb-5 flex items-center rounded-lg border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-900/20 dark:border-red-400">
            <div className="flex-1">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                        <h4 className="text-base font-bold text-red-700 dark:text-red-400">
                            Low Inventory Warning
                        </h4>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                            Current stock: <strong>{totalProduct} units</strong> |
                            Minimum required: <strong>{minQuantity} units</strong>
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                            You need to restock {minQuantity - totalProduct} more units to reach minimum inventory level.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LowStockAlert;

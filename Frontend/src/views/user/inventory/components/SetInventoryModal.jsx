import React, { useState } from "react";

const SetInventoryModal = ({ isOpen, onClose, onSubmit }) => {
  const [minProducts, setMinProducts] = useState("");
  const [inventorySize, setInventorySize] = useState("");

  const handleSubmit = () => {
    // Validate inputs
    if (!minProducts || !inventorySize || minProducts < 0 || inventorySize < 0) {
      alert("Please provide valid positive numbers.");
      return;
    } 
    onSubmit({ minProducts, inventorySize });
    onClose(); // Close the modal on form submission
  };

  if (!isOpen) return null; // Don't render if the modal is closed

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Close modal when clicking outside the form
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent click event propagation to the backdrop
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Set Inventory Preferences
        </h2>
        <form>
          <div className="mb-4">
            <label
              htmlFor="minProducts"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Minimum Products in Inventory
            </label>
            <input
              id="minProducts"
              type="number"
              value={minProducts}
              onChange={(e) => setMinProducts(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="inventorySize"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Size of Inventory
            </label>
            <input
              id="inventorySize"
              type="number"
              value={inventorySize}
              onChange={(e) => setInventorySize(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetInventoryModal;

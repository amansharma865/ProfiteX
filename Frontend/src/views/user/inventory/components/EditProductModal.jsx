// import React from "react";
// const EditProductModal = ({
//   editModalOpen,
//   setEditModalOpen,
//   editingProduct,
//   handleChange,
//   errors,
//   handleSave,
//   handleCloseModal,
// }) => {

//   return (
//     editModalOpen && (
//       <div
//         className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 backdrop-blur-sm"
//         onClick={handleCloseModal}
//       >
//         <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg relative dark:bg-black-800 ">
//           {/* Close Icon */}
//           <button
//             onClick={() => setEditModalOpen(false)}
//             className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               strokeWidth="2"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>

//           <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-200">Edit Product</h2>
//           <form>
//             <div className="mb-4">
//               <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">Product ID</label>
//               <input
//                 type="text"
//                 name="product_id"
//                 value={editingProduct.product_id}
//                 disabled
//                 className="mt-1 w-full rounded-lg border p-2 text-gray-700 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={editingProduct.name}
//                 onChange={handleChange}
//                 className={`mt-1 w-full rounded-lg text-gray-800 border p-2 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:bg-gray-600 dark:text-gray-300 ${
//                   errors.name ? "border-red-500 focus:ring-red-400" : "border-gray-300 dark:border-gray-500"
//                 }`}
//               />
//               {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">Price</label>
//               <input
//                 type="number"
//                 name="price"
//                 value={editingProduct.price}
//                 onChange={handleChange}
//                 className={`mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:bg-gray-600 dark:text-gray-300 ${
//                   errors.price ? "border-red-500 focus:ring-red-400" : "border-gray-300 dark:border-gray-500"
//                 }`}
//               />
//               {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">Stock</label>
//               <input
//                 type="number"
//                 name="stock"
//                 value={editingProduct.stock}
//                 onChange={handleChange}
//                 className={`mt-1 w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:bg-gray-600 dark:text-gray-300 ${
//                   errors.stock ? "border-red-500 focus:ring-red-400" : "border-gray-300 dark:border-gray-500"
//                 }`}
//               />
//               {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
//             </div>

//             <div className="flex justify-end space-x-4">
//               <button
//                 type="button"
//                 onClick={handleSave}
//                 className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:bg-brand-600 dark:hover:bg-brand-700"
//               >
//                 Save
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     )
//   );
// };

// export default EditProductModal;


import React, { useState } from "react";
import { z } from "zod";
// import { productSchema } from "./validationSchemas"; // Import your Zod schema here

const EditProductModal = ({
  editModalOpen,
  setEditModalOpen,
  editingProduct,
  handleChange,
  handleSave,
  handleCloseModal,
}) => {
  const [fieldErrors, setFieldErrors] = useState({}); // State for validation errors

  const productSchema = z.object({
    name: z
      .string()
      .min(1, "Product Name is required")
      .regex(
        /^[a-zA-Z][a-zA-Z0-9\s]*$/,
        "Product Name should start from an alphabet"
      )
      .max(20, "Product Name cannot be more than 20 characters"),
    price: z.preprocess(
      (value) => {
        // Convert string to number if it's a valid numeric string
        if (typeof value === "string" && !isNaN(Number(value))) {
          return Number(value);
        }
        return value; // Pass non-numeric values unchanged
      },
      z
        .number({ invalid_type_error: "Price must be a number" })
        .positive("Price must be a positive number greater than 0")
        .refine(
          (value) => /^\d+(\.\d{1,2})?$/.test(value.toString()),
          "Price can only have up to 2 decimal places"
        )
    ),

    stock: z
      .preprocess((value) => {
        // Convert string to number if it's a valid numeric string
        if (typeof value === "string" && !isNaN(Number(value))) {
          return Number(value);
        }
        return value; // Pass non-numeric values unchanged
      }, z
        .number({ invalid_type_error: "Stock must be a number" })
        .positive("Stock must be greater than 0")
        .int("Stock must be a whole number")
      ),

  });

  const validateForm = () => {
    try {
      productSchema.parse(editingProduct); // Validate using Zod schema
      setFieldErrors({});
      return true; // Validation passed
    } catch (error) {
      const zodErrors = {};
      error.errors.forEach((err) => {
        zodErrors[err.path[0]] = err.message;
      });
      setFieldErrors(zodErrors); // Set validation errors
      return false;
    }
  };

  const handleSaveWithValidation = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }
    handleSave(); // Call parent handleSave
  };

  return (
    editModalOpen && (
      <div
        className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleCloseModal}
      >
        <div
          className="relative w-full max-w-md rounded-lg bg-white dark:!bg-black-700 p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Icon */}
          <button
            onClick={() => setEditModalOpen(false)}
            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:!text-gray-200">
            Edit Product
          </h2>
          <form>
            {/* Product ID */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 dark:!text-gray-400">
                Product ID
              </label>
              <input
                type="text"
                name="product_id"
                value={editingProduct.product_id}
                disabled
                className="mt-1 w-full rounded-lg border p-2 text-gray-700 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-300"
              />
            </div>

            {/* Product Name */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 dark:!text-gray-400">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editingProduct.name}
                onChange={handleChange}
                className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black-700 text-gray-900 dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 ${fieldErrors.name
                  ? "border-red-500 focus:ring-red-400"
                  : ""
                  }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-800 dark:!text-gray-400">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={editingProduct.price}
                onChange={handleChange}
                className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black-700 text-gray-900 dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 ${fieldErrors.price
                  ? "border-red-500 focus:ring-red-400"
                  : ""
                  }`}
              />
              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 dark:!text-gray-400">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={editingProduct.stock}
                onChange={handleChange}
                className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black-700 text-gray-900 dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 ${fieldErrors.stock
                  ? "border-red-500 focus:ring-red-400"
                  : ""
                  }`}
              />
              {fieldErrors.stock && (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.stock}</p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleSaveWithValidation}
                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default EditProductModal;
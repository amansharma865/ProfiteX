import React, { useState } from "react";

const ManualEntryPopup = ({
  handleFormSubmit,
  loading,
  error,
  handleClosePopup,
}) => {
  const [formData, setFormData] = useState({
    product_id: "",
    name: "",
    price: "",
    stock: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    product_id: "",
    name: "",
    price: "",
    stock: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFields = () => {
    const errors = {};

    // Validate product ID: must contain both letters and numbers
    const productIdRegex = /^(?=.[a-zA-Z])(?=.\d)[a-zA-Z0-9]+$/; // Must contain both alphabets and numbers
    const specialCharRegex = /[^a-zA-Z0-9]/; // Regex to detect special characters (only allows letters and numbers)

    if (!formData.product_id) {
      errors.product_id = "Product ID is required";
    } else if (formData.product_id.length > 15) {
      errors.product_id = "Product ID cannot be more than 15 characters";
    } else if (specialCharRegex.test(formData.product_id)) {
      errors.product_id = "Product ID cannot contain special characters";
    }

    // Validate product name: cannot start with a number
    const productNameRegex = /^[a-zA-Z][a-zA-Z0-9\s]*$/; // Validates if the name starts with a letter and contains only letters, numbers, and spaces
    // const specialCharRegex = /[^a-zA-Z0-9\s]/; // Regex to detect special characters (only allows letters, numbers, and spaces)

    if (!formData.name) {
      errors.name = "Product Name is required";
    } else if (!productNameRegex.test(formData.name)) {
      errors.name =
        "Product Name should start with an alphabet and can contain only letters, numbers";
    } else if (specialCharRegex.test(formData.name)) {
      errors.name = "Product Name cannot contain special characters";
    } else if (formData.name.length > 20) {
      errors.name = "Product Name cannot be more than 20 characters";
    }

    // Validate price: must be positive and greater than 0
    if (!formData.price || formData.price <= 0) {
      errors.price = "Price must be a positive number greater than 0";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      errors.price = "Price can only have up to 2 decimal places";
    }

    // Validate stock: must be a whole number and cannot be negative
    const stockRegex = /^\d+$/;
    if (!formData.stock) {
      errors.stock = "Stock is required";
    } else if (!stockRegex.test(formData.stock)) {
      errors.stock = "Stock must be a whole number and cannot be negative";
    } else if (parseInt(formData.stock, 10) === 0) {
      errors.stock = "Stock cannot be zero";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // returns true if there are no errors
  };

  // const validateFields = () => {
  //   const errors = {};
  //   if (!formData.product_id) errors.product_id = 'Product ID is required';
  //   if (!formData.name) errors.name = 'Product Name is required';
  //   if (!formData.price || formData.price <= 0) errors.price = 'Price must be a positive number';
  //   if (!formData.stock || formData.stock < 0) errors.stock = 'Stock cannot be negative';

  //   setFieldErrors(errors);
  //   return Object.keys(errors).length === 0; // returns true if there are no errors
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFields()) {
      handleFormSubmit(e); // Submit the form if fields are valid
    } else {
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold dark:!text-white">Manual Entry</h4>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 dark:!text-gray-400">
            Product ID
          </label>
          <input
            type="text"
            name="product_id"
            id="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-2 dark:bg-black-700 dark:text-white dark:border-gray-600 ${fieldErrors.product_id ? "border-red-500" : ""
              }`}
          />
          {fieldErrors.product_id && (
            <p className="text-xs text-red-500">{fieldErrors.product_id}</p>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:!text-gray-400">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-2 dark:bg-black-700 dark:text-white dark:border-gray-600 ${fieldErrors.name ? "border-red-500" : ""
              }`}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-500">{fieldErrors.name}</p>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:!text-gray-400">
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-2 dark:bg-black-700 dark:text-white dark:border-gray-600 ${fieldErrors.price ? "border-red-500" : ""
              }`}
          />
          {fieldErrors.price && (
            <p className="text-xs text-red-500">{fieldErrors.price}</p>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:!text-gray-400">
            Stock
          </label>
          <input
            type="number"
            name="stock"
            id="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            className={`w-full rounded-lg border px-4 py-2 dark:bg-black-700 dark:text-white dark:border-gray-600 ${fieldErrors.stock ? "border-red-500" : ""
              }`}
          />
          {fieldErrors.stock && (
            <p className="text-xs text-red-500">{fieldErrors.stock}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 py-2 text-white hover:bg-brand-600 disabled:bg-gray-400"
        >
          {loading ? "Submitting..." : "Submit Data"}
        </button>
      </form>
    </div>
  );
};

export default ManualEntryPopup;
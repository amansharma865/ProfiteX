const Product = require("../models/Product");
const { validateStorageCapacity } = require("../helper/validateStorage");
const { checkLowStockAndNotify } = require("../helper/lowStockHelper");

// Create Product (Manual Entry)
const createProduct = async (req, res) => {
  const { product_id, name, price, stock } = req.body;
  const userId = req.user._id;
  if (!userId) {
    return res.status(400).json({ message: "User ID is missing." });
  }
  try {
    // Validate storage capacity before creating product
    const validation = await validateStorageCapacity(userId, stock, false);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        capacityInfo: validation.details
      });
    }

    const newProduct = new Product({
      product_id,
      name,
      price,
      stock,
      user: userId,
    });

    await newProduct.save();

    // Check if stock is now below minimum and create notification
    await checkLowStockAndNotify(userId, false);

    res.status(200).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    if (error.code === 11000) {
      res.status(400).json({
        message: `Product ID '${product_id}' already exists for this user.`,
      });
    } else {
      res.status(500).json({
        message: "Error creating product",
        error: error.message,
      });
    }
  }
};

// Read Products (Fetch All)
const getAllProducts = async (req, res) => {
  const userId = req.user._id;

  try {
    const products = await Product.find({ user: userId }).sort({ updatedAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};


// Update Product
const updateProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  const { product_id } = req.params;
  const userId = req.user._id;

  if (!name || !price || !stock) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // First, get the existing product to calculate stock delta
    const existingProduct = await Product.findOne({ product_id, user: userId });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate stock change
    const stockDelta = stock - existingProduct.stock;

    // Validate storage capacity only if increasing stock
    if (stockDelta > 0) {
      const validation = await validateStorageCapacity(userId, stockDelta, false);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
          capacityInfo: validation.details
        });
      }
    }

    // Find the product by product_id and update it with the new values
    const product = await Product.findOneAndUpdate(
      { product_id, user: userId }, // Use product_id from the URL parameter
      { name, price, stock },
      { new: true }
    );

    // Check if stock is now below minimum and create notification
    await checkLowStockAndNotify(userId, false);

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  const { product_id } = req.params;
  const userId = req.user._id;
  try {
    const product = await Product.findOneAndDelete({ product_id, user: userId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if stock is now below minimum and create notification
    await checkLowStockAndNotify(userId, false);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Handle JSON Data Submission (not Excel)
const uploadExcel = async (req, res) => {
  const data = req.body; // Assuming JSON data is submitted via API
  const userId = req.user._id;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "No valid data submitted" });
  }

  // Validate each row
  const errors = [];
  const validData = data.filter((row, index) => {
    const isValid =
      row.product_id &&
      typeof row.product_id === "string" &&
      row.name &&
      typeof row.name === "string" &&
      row.price > 0 &&
      typeof row.price === "number" &&
      row.stock >= 0 &&
      typeof row.stock === "number";

    if (!isValid) {
      errors.push({
        row: index + 1,
        message: "Invalid fields or missing required values.",
      });
    } else {
      row.user = userId; // Assign authenticated user ID to each product
    }

    return isValid;
  });

  if (validData.length === 0) {
    return res.status(400).json({
      message: "No valid rows to upload. Please check your data.",
      errors,
    });
  }

  try {
    // Validate storage capacity before bulk upload
    const uploadTotalStock = validData.reduce((sum, row) => sum + row.stock, 0);
    const validation = await validateStorageCapacity(userId, uploadTotalStock, false);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Bulk upload exceeds storage capacity.`,
        capacityInfo: validation.details,
        suggestion: `Maximum you can add: ${validation.details.remainingCapacity} units. Your upload contains: ${uploadTotalStock} units.`
      });
    }

    // Check for duplicate product_id under the same user
    const existingProducts = await Product.find({
      product_id: { $in: validData.map((row) => row.product_id) },
      user: userId,
    }).select("product_id");

    const duplicates = validData.filter((row) =>
      existingProducts.some(
        (existing) => existing.product_id === row.product_id
      )
    );

    if (duplicates.length > 0) {
      return res.status(400).json({
        message: "Some rows failed due to duplicate Product IDs for this user.",
        duplicateErrors: duplicates.map((dup) => ({
          product_id: dup.product_id,
          message: "Duplicate Product ID for this user.",
        })),
        otherErrors: errors.length > 0 ? errors : undefined,
      });
    }

    // Insert validated data
    const products = await Product.insertMany(validData, { ordered: false });

    res.status(200).json({
      message: "Products added successfully",
      products,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error during Excel upload:", error);

    if (error.code === 11000) {
      const duplicateErrorRows = validData
        .map((row, index) => {
          if (error.message.includes(row.product_id)) {
            return {
              row: index + 1,
              product_id: row.product_id,
              message: "Duplicate Product ID",
            };
          }
          return null;
        })
        .filter(Boolean);

      return res.status(400).json({
        message: "Some rows failed due to duplicate Product IDs.",
        duplicateErrors: duplicateErrorRows,
        otherErrors: errors.length > 0 ? errors : undefined,
      });
    }

    res.status(500).json({
      message: "Error uploading products",
      error: error.message,
      errors,
    });
  }
};


const calculateTotalStocksForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Product.aggregate([
      {
        $match: { user: userId },
      },
      {
        $group: {
          _id: null,
          totalStocks: { $sum: "$stock" },
        },
      },
    ]);

    const totalStocks = result.length > 0 ? result[0].totalStocks : 0;

    res.status(200).json({
      success: true,
      message: "Total stocks calculated successfully for the user.",
      totalStocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while calculating total stocks.",
      error: error.message,
    });
  }
};

// Count out of stock products (stock = 0) for user
const countOutOfStockProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Product.countDocuments({
      user: userId,
      stock: 0
    });

    res.status(200).json({
      success: true,
      message: "Out of stock products counted successfully.",
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error counting out of stock products",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  uploadExcel,
  getTotalStocksOfUser: calculateTotalStocksForUser,
  countOutOfStockProducts
};

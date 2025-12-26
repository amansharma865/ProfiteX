const Product = require("../models/superProduct");
const user = require("../models/user");
const warehouse = require("../models/warehouse");
const { validateStorageCapacity } = require("../helper/validateStorage");
const { checkLowStockAndNotify } = require("../helper/lowStockHelper");

// Create Product (Manual Entry)
const createProduct = async (req, res) => {
  const { product_id, name, price, stock } = req.body;
  const admin = req.user._id;
  if (!admin) {
    return res.status(400).json({ message: "Admin ID is missing." });
  }
  try {
    // Validate storage capacity before creating product
    const validation = await validateStorageCapacity(admin, stock, true);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        capacityInfo: validation.details
      });
    }

    const newProduct = new Product({ product_id, name, price, stock, admin: admin, });
    await newProduct.save();

    // Check if stock is now below minimum and create notification
    await checkLowStockAndNotify(admin, true);

    res.status(200).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({
        message: `Product ID '${product_id}' already exists for this admin.`,
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
  const admin = req.user._id;
  try {
    const products = await Product.find({ admin: admin }).sort({ updatedAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  const { name, price, stock } = req.body;
  const { product_id } = req.params; // Retrieve product_id from the URL parameter
  const admin = req.user._id;

  if (!name || !price || !stock) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // First, get the existing product to calculate stock delta
    const existingProduct = await Product.findOne({ product_id, admin: admin });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate stock change
    const stockDelta = stock - existingProduct.stock;

    // Validate storage capacity only if increasing stock
    if (stockDelta > 0) {
      const validation = await validateStorageCapacity(admin, stockDelta, true);
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
      { product_id, admin: admin }, // Use product_id from the URL parameter
      { name, price, stock },
      { new: true }
    );

    // Check if stock is now below minimum and create notification
    await checkLowStockAndNotify(admin, true);

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  const { product_id } = req.params;
  const admin = req.user._id;
  try {
    const product = await Product.findOneAndDelete({ product_id, admin: admin });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if stock is now below minimum and create notification
    await checkLowStockAndNotify(admin, true);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Handle JSON Data Submission (not Excel)
const uploadExcel = async (req, res) => {
  const data = req.body;
  const admin = req.user._id; // Fetch admin ID from the authenticated user

  // Validate the data structure
  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: "No valid data submitted" });
  }

  // Validate each row for required fields and valid values
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
      row.admin = admin; // Assign authenticated admin ID to each product
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
    const validation = await validateStorageCapacity(admin, uploadTotalStock, true);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: `Bulk upload exceeds storage capacity.`,
        capacityInfo: validation.details,
        suggestion: `Maximum you can add: ${validation.details.remainingCapacity} units. Your upload contains: ${uploadTotalStock} units.`
      });
    }

    // Check for duplicates within the same admin scope
    const existingProductIds = await Product.find({
      product_id: { $in: validData.map((row) => row.product_id) },
      admin, // Only check within the same admin
    }).select("product_id");

    const duplicateRows = validData.filter((row) =>
      existingProductIds.some(
        (existingProduct) => existingProduct.product_id === row.product_id
      )
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        message: "Some rows failed due to duplicate Product IDs for this admin.",
        duplicateErrors: duplicateRows.map((row, index) => ({
          row: index + 1,
          product_id: row.product_id,
          message: "Duplicate Product ID for this admin.",
        })),
        otherErrors: errors.length > 0 ? errors : undefined,
      });
    }

    // Insert the validated data into the database
    const products = await Product.insertMany(validData, { ordered: false });

    res.status(200).json({
      message: "Products added successfully",
      products,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    // Handle specific errors like duplicates (code 11000)
    if (error.code === 11000) {
      const duplicateErrorRows = validData
        .map((row, index) => {
          if (error.message.includes(row.product_id)) {
            return {
              row: index + 1,
              product_id: row.product_id,
              message: "Duplicate Product ID for this admin.",
            };
          }
          return null;
        })
        .filter(Boolean);

      return res.status(400).json({
        message: "Some rows failed due to duplicate Product IDs for this admin.",
        duplicateErrors: duplicateErrorRows,
        otherErrors: errors.length > 0 ? errors : undefined,
      });
    }

    // General error handling
    res.status(500).json({
      message: "Error uploading products",
      error: error.message,
      errors,
    });
  }
};
const getProdutsFromAdmin = async (req, res) => {
  const id = req.user._id;
  try {
    const findUser = await user.findById(id);

    const products = await Product.find({ admin: findUser.user_admin });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
}


const calculateTotalStocksForAdmin = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Product.aggregate([
      {
        $match: { admin: userId },
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

// Count out of stock products (stock = 0)
const countOutOfStockProducts = async (req, res) => {
  try {
    const adminId = req.user._id;
    const count = await Product.countDocuments({
      admin: adminId,
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
  getProdutsFromAdmin,
  calculateTotalStocksForAdmin,
  countOutOfStockProducts
};

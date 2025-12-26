const express = require("express");
const crypto = require("crypto");
const order = require("../models/order");
const mail = require("../helper/orderMail");
const Product = require("../models/Product");
const SuperProduct = require("../models/superProduct");
const { createNotification } = require("../helper/notificationHelper");
const { checkLowStockAndNotify } = require("../helper/lowStockHelper");
// const superProduct = require("../models/superProduct");

const placeorder = async (req, res) => {

  try {

    const { product_id, product_quantity } = req.body;
    const id = req.user._id;
    const admin = req.user.user_admin;

    if (!product_id || !product_quantity) {
      return res.status(400).json({ message: "Product ID and quantity are required" });
    }

    //find the superProduct name
    const superProduct = await SuperProduct.findById(product_id);
    if (!superProduct) res.json({
      status: 401,
      message: "product not found",
    })
    const product_name = superProduct.name;
    const productId = superProduct.product_id;

    const createOrder = await order.create({
      order_id: `profitex${productId}${parseInt(Math.random() * 100)}`,
      product_quantity: product_quantity,
      product_name: product_name
    });


    // Generate unique tokens for accept/reject links
    const acceptToken = crypto.randomBytes(16).toString("hex");
    const rejectToken = crypto.randomBytes(16).toString("hex");

    createOrder.acceptToken = acceptToken;
    createOrder.rejectToken = rejectToken;
    createOrder.orderFrom = id;
    createOrder.orderTo = admin;
    createOrder.productOrdered_id = product_id;
    await createOrder.save();

    // Create notifications
    await createNotification(
      'order_placed',
      'New Order Received',
      `New order #${createOrder.order_id} for ${product_name} (Qty: ${product_quantity})`,
      admin,
      'admin',
      createOrder._id
    );

    await createNotification(
      'order_placed',
      'Order Placed Successfully',
      `Your order #${createOrder.order_id} has been placed`,
      id,
      'user',
      createOrder._id
    );

    return res.status(200).json({
      message: "success",
      status: 200,
      data: createOrder,
    });
  } catch (err) {
    console.error("Error in placeorder:", err.message);
    return res.status(500).json({
      message: err.message,
    });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { id, token } = req.params;

    const orderData = await order.findById(id);

    if (!orderData) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (orderData.acceptToken !== token) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const productName = orderData.product_name;
    const productQuantity = orderData.product_quantity;


    // Check if the product exists in SuperProduct
    const superProductItem = await SuperProduct.findOne({
      name: new RegExp(`^${productName}$`, "i"), // Case-insensitive search
    });

    if (!superProductItem) {
      return res.status(404).json({
        message: `Product "${productName}" not found in SuperProduct`,
      });
    }

    if (superProductItem.stock < productQuantity) {
      return res.status(400).json({
        message: `Insufficient stock in SuperProduct. Available: ${superProductItem.stock}, Requested: ${productQuantity}`,
      });
    }

    // Deduct the ordered quantity from SuperProduct stock
    superProductItem.stock -= productQuantity;
    await superProductItem.save();

    // Check if admin's inventory is now below minimum threshold
    await checkLowStockAndNotify(superProductItem.admin, true);

    // Check if the product exists in Product for THIS USER
    const fs = require('fs');
    const logMsg = `\n[${new Date().toISOString()}] Checking product: Name="${productName}", User="${orderData.orderFrom}"\n`;
    fs.appendFileSync('debug_log.txt', logMsg);

    let productItem = await Product.findOne({
      name: productName,
      user: orderData.orderFrom // Find product for specific user
    });

    if (productItem) {
      const msg = `[${new Date().toISOString()}] Product exists. Updating stock. Prev: ${productItem.stock}, Add: ${productQuantity}\n`;
      fs.appendFileSync('debug_log.txt', msg);
      productItem.stock += productQuantity;
    } else {
      const msg = `[${new Date().toISOString()}] Product NOT found. Creating new. User: ${orderData.orderFrom}\n`;
      fs.appendFileSync('debug_log.txt', msg);

      const uniqueProductId = `product_${productName}_${Date.now()}`;

      productItem = new Product({
        product_id: uniqueProductId,
        name: productName,
        price: superProductItem.price, // Use price from SuperProduct
        stock: productQuantity,
        user: orderData.orderFrom // CRITICAL: Link product to the user who ordered
      });
      fs.appendFileSync('debug_log.txt', `[${new Date().toISOString()}] New Product Object: ${JSON.stringify(productItem)}\n`);
    }

    await productItem.save();
    fs.appendFileSync('debug_log.txt', `[${new Date().toISOString()}] Product saved successfully.\n`);

    // Update order status
    orderData.status = "accepted";
    await orderData.save();

    res.status(200).json({
      message: "Order accepted, SuperProduct stock deducted, and Product stock updated",
      data: orderData,
    });
  } catch (err) {
    console.error("Error in acceptOrder:", err.message);
    res.status(500).json({
      message: err.message,
    });
  }
};


// Reject Order
const rejectOrder = async (req, res) => {
  try {
    const { id, token } = req.params;

    const orderData = await order.findById(id);

    if (!orderData) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (orderData.rejectToken !== token) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    orderData.status = "rejected";
    await orderData.save();

    res.status(200).json({
      message: "Order rejected",
      data: orderData,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Orders
const getOrder = async (req, res) => {
  try {
    const id = req.user._id;
    // const getData = await order.find({orderFrom:id});
    const getData = await order.find({ orderFrom: id }).sort({ updatedAt: -1 });

    res.json({
      status: 200,
      message: "Order Found",
      data: getData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
const getOrderForAdmin = async (req, res) => {
  try {
    const id = req.user._id;
    // const getData = await order.find({orderTo:id});
    const getData = await order
      .find({ orderTo: id }).populate('orderFrom');


    res.json({
      status: 200,
      message: "Order Found",
      data: getData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get Order by ID
const getOrderById = async (req, res) => {
  try {
    const orderData = await order.findById(req.params.id);
    if (!orderData) {
      return res.status(404).json({
        message: "Order not found",
      });
    }
    return res.status(200).json({
      message: "Order retrieved successfully",
      data: orderData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error retrieving order",
      error: err.message,
    });
  }
};

// Update Order
const updateorder = async (req, res) => {
  try {
    const { adminOutput, orderId } = req.body;
    if (adminOutput == 'rejected') {
      const updateData = await order.findOneAndUpdate({ order_id: orderId }, { status: adminOutput }, {
        new: true,
      });
      if (!updateData) {
        return res.status(404).json({
          message: "order not found"
        })
      }

      // Create notification for user about rejection
      await createNotification(
        'order_rejected',
        'Order Rejected ❌',
        `Your order #${updateData.order_id} has been rejected`,
        updateData.orderFrom,
        'user',
        updateData._id
      );

      return res.status(200).json({
        status: 200,
        message: "Order Updated",
        data: updateData,
      })
    }
    const Data = await order.findOne({ order_id: orderId });

    if (!Data) {
      return res.status(400).json({
        message: "order or order not found",
      });
    }
    const productOrdered_id = Data.productOrdered_id;
    const quantityNeeded = Data.product_quantity;
    //check if product under superinventory are greater than quantity ordered
    // FIX: Use findById for looking up by ID
    const superInventoryProduct = await SuperProduct.findById(productOrdered_id);
    if (!superInventoryProduct) {
      res.status(404).json({
        message: "product not found",
      })
    }

    const quantityHaving = superInventoryProduct.stock;
    const productId = superInventoryProduct.product_id;
    if (quantityHaving < quantityNeeded) {
      // Business rule: not enough stock. Return 200 with a clear message
      return res.status(200).json({
        success: false,
        message: "Insufficient stock. Please reject the order or restock before accepting.",
      });
    }
    //find product in inventory of user if got than update the count else add new product
    const minusValue1 = quantityHaving - quantityNeeded;
    // FIX: Update the specific document by ID to ensure correct stock deduction
    const updatedSuperInventory = await SuperProduct.findByIdAndUpdate(superInventoryProduct._id, { stock: minusValue1 }, { new: true })

    // Check if admin's inventory is now below minimum threshold
    await checkLowStockAndNotify(updatedSuperInventory.admin, true);

    // CRITICAL FIX: Find product for THIS SPECIFIC USER
    const findProductInInventory = await Product.findOne({
      product_id: productId,
      user: Data.orderFrom
    });

    if (!findProductInInventory) {
      const newProductInInventory = await Product.create({
        product_id: productId,
        name: superInventoryProduct.name,
        stock: quantityNeeded,
        user: Data.orderFrom,
        price: superInventoryProduct.price

      })
      if (!newProductInInventory) {
        return res.status(500).json({ message: "error while adding product" })
      }
      const updateData = await order.findOneAndUpdate({ order_id: orderId }, { status: adminOutput }, {
        new: true,
      });

      if (!updateData) {
        return res.status(400).json({
          message: "error occured while updating order or order not found",
        });
      }
      return res.status(200).json({
        status: 200,
        message: "Order Updated",
        data: updateData,
      })
    }
    const addValue = findProductInInventory.stock + quantityNeeded;
    // CRITICAL FIX: Update product for THIS SPECIFIC USER
    const updatedInventory = await Product.findOneAndUpdate(
      { product_id: productId, user: Data.orderFrom },
      { stock: addValue },
      { new: true }
    );
    if (!updatedInventory) {
      return res.status(500).json({ message: "error while adding product" })
    }
    const updateData = await order.findOneAndUpdate({ order_id: orderId }, { status: adminOutput }, {
      new: true,
    });

    if (!updateData) {
      return res.status(400).json({
        message: "error occured while updating order or order not found",
      });
    }

    // Create notification for user
    if (adminOutput === 'accepted') {
      await createNotification(
        'order_accepted',
        'Order Accepted ✅',
        `Your order #${updateData.order_id} has been accepted by admin`,
        updateData.orderFrom,
        'user',
        updateData._id
      );
    } else if (adminOutput === 'rejected') {
      await createNotification(
        'order_rejected',
        'Order Rejected ❌',
        `Your order #${updateData.order_id} has been rejected`,
        updateData.orderFrom,
        'user',
        updateData._id
      );
    }

    return res.json({
      status: 200,
      message: "Order Updated",
      data: updateData,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Delete Order
const deleteorder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deleteData = await order.findOneAndDelete({ order_id: orderId });

    if (!deleteData) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      status: 200,
      message: "Order Deleted",
      data: deleteData,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Clear All Orders
const clearOrders = async (req, res) => {
  try {
    await order.deleteMany({});
    return res.status(200).json({
      message: "All orders have been cleared",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error clearing orders",
      error: err.message,
    });
  }
};

const countOrderForAdmin = async (req, res) => {
  try {
    const id = req.user._id;
    const countOrder = await order.find({
      $and: [
        { orderTo: id },
        { status: 'pending' }
      ]
    }).countDocuments();

    // Always return count (may be 0) with 200 so frontend can treat zero as empty
    return res.status(200).json({ success: true, message: "order counted successfully", count: countOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error counting order", error });
  }
}
const countOrderForUser = async (req, res) => {
  try {
    const id = req.user._id;
    const countOrder = await order.find({
      $and: [
        { orderFrom: id },
      ]
    }).countDocuments();

    // Always return count (may be 0) with 200 so frontend can treat zero as empty
    return res.status(200).json({ success: true, message: "order counted successfully", count: countOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error counting order", error });
  }
}




module.exports = {
  placeorder,
  getOrder,
  getOrderForAdmin,
  getOrderById,
  updateorder,
  deleteorder,
  acceptOrder,
  rejectOrder,
  clearOrders,
  countOrderForAdmin,
  countOrderForUser
};
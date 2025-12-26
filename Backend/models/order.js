const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    order_id: { type: String, unique: true, required:true}, // Retained for unique order tracking
    product_name: { type: String }, // Product name for the order
    product_quantity: { type: Number, required: true }, // Quantity of the product
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'], // Order status options
      default: 'pending',
    },
    productOrdered_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'SuperProduct'
    },
    orderFrom:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'user'
    },
    orderTo:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'admin'
    },
    acceptToken: { type: String }, // Token for accepting the order
    rejectToken: { type: String }, // Token for rejecting the order
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
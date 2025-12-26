const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// const InvoiceSchema = new mongoose.Schema({
//   invoiceNumber: {
//     type: String,
//     unique: true,
//     required: true,
//     index: true
//   },
//   customer: {
//     type: {
//       _id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Customer'
//       },
//       name: {
//         type: String,
//         required: true,
//         trim: true
//       },
//       email: {
//         type: String,
//         lowercase: true,
//         trim: true
//       },
//       phone: {
//         type: String,
//         trim: true
//       }
//     },
//     required: true
//   },
//   shop: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Shop',
//   },
//   items: [{
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true
//     },
//     name: String,
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1
//     },
//     unitPrice: {
//       type: Number,
//       required: true
//     },
//     totalPrice: {
//       type: Number,
//       required: true
//     }
//   }],
//   subtotal: {
//     type: Number,
//     required: true
//   },
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: [ 'PAID', 'CANCELLED'],
//     default: 'PAID'
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['UNPAID', 'PAID'],
//     default: 'UNPAID'
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   paymentHistory: [{
//     amount: Number,
//     date: Date,
//     paymentMethod: String,
//     notes: String
//   }]
// }, { 
//   timestamps: true 
// });

// InvoiceSchema.plugin(mongoosePaginate);
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  customer: {
    type: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      }
    },
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productId: {
      type: String,
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [ 'PAID', 'CANCELLED'],
    default: 'PAID'
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentHistory: [{
    amount: Number,
    date: Date,
    paymentMethod: String,
    notes: String
  }]
}, { 
  timestamps: true 
});

// Pre-save middleware to ensure productId is set
InvoiceSchema.pre('save', function(next) {
  this.items.forEach(item => {
    if (item.product && (!item.productId || item.productId !== item.product.toString())) {
      item.productId = item.product.toString();
    }
  });
  next();
});

// Method to add payment
// InvoiceSchema.methods.addPayment = function(amount, method, notes = '') {
//   this.paymentHistory.push({
//     amount,
//     date: new Date(),
//     paymentMethod: method,
//     notes
//   });
  
//   const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  
//   if (totalPaid >= this.totalAmount) {
//     this.paymentStatus = 'PAID';
//     this.status = 'PAID';
//   } else if (totalPaid > 0) {
//     this.paymentStatus = 'PARTIALLY_PAID';
//   }
  
//   return this;
// };

module.exports = mongoose.model('Invoice', InvoiceSchema);
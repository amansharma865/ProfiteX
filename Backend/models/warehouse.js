const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    min_quantity:{
        type: Number,
        default:1
    },
    storage:{
        type:Number,
        default:0
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    }
  },
  { timestamps: true }
);

const warehouse = mongoose.model('warehouse', warehouseSchema);
module.exports = warehouse;
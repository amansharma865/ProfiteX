const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branch_name: {
    type: String,
    required: true,
  },
  branch_location:{
    type:String,
    required:true,
  },
  branch_ref_code:{
    type: String,
    unique: true,
  },
  branch_managedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
  },
  branch_type:{
    type:String,
    required:true,
  },
  branch_isActive:{
    type: Boolean,
    default:true,
  },

}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    admin_name: { type: String },
    admin_email: { type: String, required: true, unique: true },
    admin_password: { type: String, required: true },
    admin_mobile_number: { type: Number , default:null },
    admin_profile_pic:{type:String, default: ""},
    admin_plan_type: { type: String },
    company_name: { type: String },
    company_address: { type: String },
    company_industry: { type: String },
    pan_number: { type: String },
    gst_number: { type: String },
    accessToken: { type: String },
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    forgotPasswordOTP: String,
    forgotPasswordOTPExpiration: Date,

}, { timestamps: true });


adminSchema.methods.generateAccessToken =  function(){
    //todo
    return  jwt.sign({
        _id: this._id,
        admin_email: this.admin_email,
        username: this.username,
        role: "admin"
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('admin', adminSchema)

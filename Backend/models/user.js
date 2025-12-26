const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    user_email: { type: String, required: true, unique: true },
    user_password: { type: String,},
    user_fullname: { type: String, trim:true},
    user_designation: {type: String, required:true,trim:true},
    user_status: { type: String ,enum:['Active','Inactive']},
    user_phone_number: { type: Number,},
    user_accessToken:{type:String},
    user_profile_pic:{type:String, default: ""},
    user_admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    forgotPasswordOTP: String,
    forgotPasswordOTPExpiration: Date,
    
}, { timestamps: true });


userSchema.methods.generateAccessToken =  function(){
    //todo
    return  jwt.sign({
        _id: this._id,
        user_email: this.user_email,
        role:'user',

    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
module.exports = mongoose.model('user', userSchema);

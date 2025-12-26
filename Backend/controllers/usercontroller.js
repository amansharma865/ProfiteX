const user = require("../models/user");
const bcrypt = require("bcryptjs");
const mail = require('../helper/sendMail')
const mongoose = require('mongoose');
const admin = require("../models/admin");
const Invoice = require("../models/Invoice");
const moment = require('moment');
const revenue = require("../models/revenue");
const nodemailer = require('nodemailer');
const multer = require("multer");
const path = require("path");
const fs = require('fs');



const generateRefreshToken =async (userId)=>{
  try {
    //find data
    //create refresh token
    // const banda = await user.findById(userId);
    // if (!banda) return "banda not found";
    const newUser = await user.findById(userId);
    const refreshToken = newUser.generateRefreshToken();
    newUser.user_refreshToken = refreshToken;
    await newUser.save({validateBeforeSave: false});
    return refreshToken;
  } catch (error) {
    // return res.status(500).json({
    //   success:false,
    //   messgae: "error generating refresh token",error,
    // })
  }
}
const generateAccessToken =async (userId)=>{
  try {
    //find data
    //create access token
    const banda = await user.findById(userId);
    if (!banda) return res.status(400).json({success:false,messgae: "banda not found"});
    const accessToken = banda.generateAccessToken();
    return accessToken;
  } catch (error) {
    // return res.status(500).json({
    //   success:false,
    //   messgae: "error generating Access token",error,
    // })
  }
}

const register = async (req, res) => {
    try {
      const inputData = req.body;
      if (!inputData) {
        return res.json({
          message: "failed",
          status: "400",
          error: "please fill the form completely"
        });
      }
  
      const {user_username,user_email,user_password} = inputData;
  
      if (!user_username || !user_email || !user_password) {
        return res.json({
          message: "failed",
          status: "400",
          error: "please fill the missed columns"
        });
      }
  
      // Check if data already exists
      const userExist = await user.findOne({
        $or: [{ user_username }, { user_email }]
      });
  
      if (userExist) {
        return res.json({
          message: "failed",
          status: 409,
          message: 'User already exists'
        });
      }
      // Hashing password 
      const encryptPassword = await bcrypt.hash(user_password,7);
      if (!encryptPassword) {
        return res.json({sucess: false,message:"dikkat aari hai"});
      }
    
  
      const createUser = new user({
        user_username: user_username,
        user_email: user_email,
        user_password:encryptPassword,
      });
      await createUser.save();
      
      const refreshToken = await generateRefreshToken(createUser._id);

      if (!refreshToken){
        res.status(500).json({
            sucess: false,
            message: "internal server error while creating refresh token"
        })
      }
      //token aagya
      const finalData  = await user.findByIdAndUpdate(
        createUser._id,
        {
          $set: {
              user_refreshToken: refreshToken 
          }
      },
      {
          new: true
      }
      )
  
      // Send email
      // await mail.SendGreetMail({
      //   email:user_email,
      //   name:user_username,
      //   pno:createUser.user_phone_number
      // });

      const registerUser = await user.findById(createUser._id).select("-user_password -user_refreshToken");
  
      return res.json({
        success:"true",
        status: 200,
        data: registerUser,
        msg: `Hey ${registerUser.user_username}, you have registered successfully`
      });
    } catch (err) {
      res.status(500).send("Error occurred while registering the user: " + err);
    }
  }
  
  const sendMessage = async (req, res) => {
    try {
      const sendMessage = await sms.sendAccountCreateGreetSms();
      res.json({
        status: 200,
        message: `Register successful`,
        messageSent: sendMessage
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  }

  // ------------------------------------login--------------------------------------
  const loginUser = async(req,res)=>{
    try {
      //take email and password
      //find user whether user exist
      //verify password using bcrypt
      //generate access token and refresh token
      //send cookies

      //data
      const inputData = req.body;
      //verify
      if (!inputData) {
        return res.status(400).json({
          success: false,
          status: "400",
          error: "please fill the form completely"
        });
      }
      //data coming
      const {user_email,user_password}=inputData;
      //check if every entry is valid
      if(!user_email || !user_password ){
        return res.status(400).json({
          success: false,
          status: "400",
          error: "please fill the missed columns"
        });
      }
      //valid hai bhai

      //find user in db
      const checkData = await user.findOne({
        user_email
      });
      if (!checkData){
        return res.status(500).json({
          success: false,
          status: 401,
          error: "user not found!!"
        });
      };
      //user hai 
      const checkPass = await bcrypt.compare(user_password,checkData.user_password);
      if (!checkPass){
        return res.json({
          success: false,
          status: 409,
          error: "Wrong Credentials!!"
        });
      };

      if (checkData.user_status=="Inactive"){
        return res.status(409).json({
          success: false,
          status: 409,
          error: "User Inactive!!"
        });
      };

      //access and refresh token bnao
      const accessToken = await generateAccessToken(checkData._id);
      const refreshToken = checkData.user_refreshToken;
      const finalUser = await user.findById(checkData._id).select("-user_password -user_refreshToken");

      
      const options = {
        httpOnly: true,
        sameSite:"none",
        secure: true,
        maxAge:3600000,
        //isme abh hamari cookie sirf server se hi modifiable hogi frontend par koi ese modify nhi kr skta.
    }
    return res.
    status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options).json({
      success:true,
      status:200,
      data:finalUser,
      message: "user sign in succesfully"
    })

      
    } catch (error) {
      res.status(500).json({
        success:false,
        error:error.message,
      })
    }
  }

  const logoutUser = async (req,res)=>{
    try {
      await user.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                user_refreshToken: undefined 
            }
        },
        {
            new: true
        }
    )

    const options = {
       httpOnly: true,
      sameSite:"none",
      secure: true,
      maxAge:3600000,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      success: true,
      status: 200,
      message: "user sucessfully logged out",
    })
      
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
    })
    }
  }


  const updateUserDetails = async (req, res) => {
    try {
        const {_id} = req.user;
        const id = _id;
      
        const { 
            user_username, 
            user_email,  
            user_fullname, 
            user_designation, 
            user_company_name,  
            user_phone_number 
        } = req.body;
        const userr = await user.findById(_id);

        if (!userr) {
            return res.json({status:404, message: "User not found" });
        }

        if (user_username) userr.user_username = user_username;
        if (user_email) userr.user_email = user_email;
        if (user_fullname) userr.user_fullname = user_fullname;
        if (user_designation) userr.user_designation = user_designation;
        if (user_company_name) userr.user_company_name = user_company_name;
        if (user_phone_number) userr.user_phone_number = user_phone_number;  
        await userr.save();

        return res.json({ status:200, message: "User details updated successfully", user });

    } catch (error) {
        return res.json({ status:500,message: "Server Error", error });
    }
};

const getDetails = async (req,res)=>{
  try {
    const {_id} = req.user;
    const userData = await user.findOne({_id}).select("-refreshToken -user_password");
    if (!userData) return res.status(404).json({success:false, message:"User not found"});
    return res.status(200).json({success:true,message:"successfully fetched user details",data:userData});
  } catch (error) {
    return res.status(500).json({ message: "error while fetching data of user", error });
  }
};

const getAdmin = async (req, res)=>{
  try {
    const admin_id = req.user.user_admin;
    const findAdmin = await admin.findById(admin_id);
    if (!findAdmin) return res.status(404).json({success:false,message:"admin not found"});
    return res.status(200).json({success:true,message:"successfully found admin",admin:findAdmin});
  } catch (error) {
    return res.status(500).json({message: "error while fetching your admin"});
  }
}

const getDailySalees = async (req, res) => {
  try {
    // Get the user from the authorized request
    const userId = req.user._id;

    // Calculate the date 9 days ago
    const nineDaysAgo = new Date();
    nineDaysAgo.setDate(nineDaysAgo.getDate() - 9);

    // Generate an array of last 9 days
    const last9Days = Array.from({ length: 9 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse(); // Reverse to get ascending order

    // Aggregate sales data
    const dailySales = await Invoice.aggregate([
      // Match invoices created by the specific user in the last 9 days
      {
        $match: {
          createdBy: userId,
          status: 'PAID', // Only consider paid invoices
          createdAt: { $gte: nineDaysAgo }
        }
      },
      // Unwind the items array to create a document for each item
      { $unwind: '$items' },
      // Group by date
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }
            }
          },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      // Project the final format
      {
        $project: {
          date: '$_id.date',
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);

    // Create a map of existing sales data by date
    const salesMap = new Map(
      dailySales.map(sale => [sale.date, sale])
    );

    // Prepare final results with all 9 days
    const formattedSales = last9Days.map(day => {
      const formattedDate = day.toISOString().split('T')[0];
      return salesMap.get(formattedDate) || {
        date: formattedDate,
        totalQuantity: 0,
        totalRevenue: 0
      };
    });

    res.json({
      success: true,
      data: formattedSales
    });
  } catch (error) {
    console.error('Daily Sales Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily sales',
      error: error.message
    });
  }
};




// Controller to get weekly revenue
const getWeeklyRevenue = async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Generate an array of weeks in the current month
    const weeksInMonth = Array.from({ length: 4 }, (_, i) => ({ week: i + 48 })); // Adjust as needed for actual weeks

    // Aggregate revenue data
    const weeklyRevenue = await Invoice.aggregate([
      {
        $match: {
          createdBy: userId,
          status: "PAID",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: { week: { $week: "$createdAt" } },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
        },
      },
      {
        $project: {
          week: "$_id.week",
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);

    // Create a map for easy access
    const revenueMap = new Map(weeklyRevenue.map((entry) => [entry.week, entry]));

    // Format the final response
    const formattedRevenue = weeksInMonth.map((weekEntry) => {
      const weekNumber = weekEntry.week;
      const weekData = revenueMap.get(weekNumber);
      return {
        week: `Week ${weekNumber}`,
        totalQuantity: weekData ? weekData.totalQuantity : 0,
        totalRevenue: weekData ? weekData.totalRevenue : 0,
      };
    });

    res.json({
      success: true,
      data: formattedRevenue,
    });
  } catch (error) {
    console.error("Weekly Revenue Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching weekly revenue",
      error: error.message,
    });
  }
};


// Utility to get ISO week number
Date.prototype.getWeek = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) /
        7
    )
  );
};


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_USER, // replace with your email
    pass:process.env.OTP_PASS // replace with your email password
  },
});


const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  // Check if both email and role are provided
  if (!email || !role) {
    return res.status(400).json({ success: false, error: 'Email and role are required' });
  }

  try {
    let userdoc = await user.findOne({ user_email: email });
    // Logic for finding user or admin
    // if (role === 'user') {
      // user = 
    // } else if (role === 'admin') {
    //   user = await admin.findOne({ email });
    // }

    if (!userdoc) {
      return res.status(404).json({ success: false, error: 'User or Admin not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in the database
    userdoc.forgotPasswordOTP = otp;
    userdoc.forgotPasswordOTPExpiration = Date.now() + 5 * 60 * 1000;
    await userdoc.save();

    // Send OTP email
    const mailOptions = {
      from: 'aman1249.be22@chitkara.edu.in',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'OTP has been sent to your email' , generatedotp:otp});
  } catch (error) {
    console.error('Error during forgot password process:', error);
    return res.status(500).json({ success: false, error: 'Server error, please try again later' });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find the user by email
    const userdoc = await user.findOne({ user_email: email });

    if (!userdoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    // Hash the new password before saving
    userdoc.user_password = await bcrypt.hash(newPassword, 10);

    // Save the updated user document
    await userdoc.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error during password reset:", error); // Log the error to help debug
    return res.status(500).json({ success: false, message: "An error occurred while updating the password" });
  }
};

// Define the storage for the profile picture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/user-profile-pics');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `user-profile-${req.user._id}${fileExtension}`;  // Name the file based on user ID
    cb(null, fileName);
  },
});

// Filter to ensure only image files are uploaded
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (extname && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer for the profile pic upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit
}).single('profilePic');  // 'profilePic' is the field name in the form

// Upload profile picture
const uploadProfilePic = async (req, res) => {
  try {
    // Handle file upload via multer
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded.',
        });
      }

      // Update the user profile with the uploaded image path
      const userId = req.user._id;
      const profilePicPath = `/uploads/user-profile-pics/${req.file.filename}`;

      // Find the user and update the profile picture path
      const userToUpdate = await user.findById(userId);
      if (!userToUpdate) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update profile picture in user model
      userToUpdate.user_profile_pic = profilePicPath; // Add this field to your user model if not already present
      await userToUpdate.save();

      // Return response with the updated user data
      return res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profilePic: profilePicPath,  // Send the path of the uploaded image
        },
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message,
    });
  }
};




  module.exports= {register,loginUser,logoutUser,updateUserDetails,getDetails,getAdmin,getDailySalees,getWeeklyRevenue, forgotPassword, resetPassword,uploadProfilePic};


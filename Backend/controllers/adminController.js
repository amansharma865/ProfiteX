require("dotenv").config();
const express = require('express');
const app = express();
const admin = require('../models/admin')
const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const mail = require('../helper/sendMail')
const sms = require('../helper/smsService')
const whatsapp = require('../helper/whatsapp');
const user = require('../models/user');
const Invoice = require('../models/Invoice');
const nodemailer = require('nodemailer');
const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Configure nodemailer transporter once so it's available to all controller functions
// Priority for credentials: CRD_USER/CRD_PASS -> OTP_USER/OTP_PASS -> SMTP_USER/SMTP_PASS
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.CRD_USER || process.env.OTP_USER || process.env.SMTP_USER,
//     pass: process.env.CRD_PASS || process.env.OTP_PASS || process.env.SMTP_PASS,
//   },
//   tls: { rejectUnauthorized: false },
// });


const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  port:465,
  secure:true,
  auth:{
    user:process.env.CRD_USER,
    pass:process.env.CRD_PASS
  }
});

transporter.verify((e)=>{
});


const generateAccessToken = async (userId) => {
  try {
    
    // Validate user ID
    const newAdmin = await admin.findById(userId);
    if (!newAdmin) {
      console.error("Admin not found for ID:", userId);
      return null; // Return null to indicate failure
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      {
        _id: newAdmin._id,
        admin_email: newAdmin.admin_email,
        username: newAdmin.username,
        role: "admin"
      },
      process.env.ACCESS_TOKEN_SECRET ,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    return accessToken;
  } catch (error) {
    console.error("Error while creating access token:", error.message);
    return null; // Return null to indicate failure
  }
};


const register = async (req, res) => {
  try {
    const inputData = req.body;

    // Input validation
    if (!inputData || !inputData.username || !inputData.admin_email || !inputData.admin_password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const { username, admin_email, admin_password } = inputData;

    // Check if admin already exists
    const userExist = await admin.findOne({
      $or: [{ username }, { admin_email }],
    });

    if (userExist) {
      return res.status(409).json({
        success: false,
        message: "Admin with email or username already exists",
      });
    }

    // Hash password
    const encryptPassword = await bcrypt.hash(admin_password, 10);
    if (!encryptPassword) {
      return res.status(500).json({
        success:false,
        message:"error occured while encrypting password please try again"
       })
    }

    // Create new admin
    const createAdmin = new admin({
      username,
      admin_email,
      admin_password: encryptPassword,
    });

    await createAdmin.save();


    // Generate access token
    const accessToken = await generateAccessToken(createAdmin._id);

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "Internal server error while creating access token",
      });
    }

    // Update admin with access token
    const finalData = await admin.findByIdAndUpdate(
      createAdmin._id,
      { $set: { accessToken } },
      { new: true }
    ).select("-admin_password -accessToken");

    // await mail.SendGreetMail({
    //   email: admin_email,
    //   name: username,
    // });

    const options = {
      httpOnly: true,
      sameSite:"none",
      secure: true,
      maxAge:3600000,
      //isme abh hamari cookie sirf server se hi modifiable hogi frontend par koi ese modify nhi kr skta.
  }

    return res.status(200).cookie("accessToken",accessToken,options).json({
      success: true,
      data: finalData,
      message: `Hey ${finalData.username}, you have registered successfully`,
    });
  } catch (err) {
    console.error("Error in register function:", err.message);
    return res.status(500)
    .json({
      success: false,
      message: "An error occurred while creating the admin. Please try again.",
    });
  }
};


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



const sendWhatsapp = async (req, res) => {
  try {
    const sendMessage = await whatsapp.sendAccountCreateGreetWhatsapp();
    res.json({
      status: 200,
      message: `Register successful`,
      messageSent: sendMessage
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// loginn

// const loginAdmin = async(req,res)=>{
//   try {
//     //take email and password
//     //find user whether user exist
//     //verify password using bcrypt
//     //generate access token and refresh token
//     //send cookies

//     //data
//     const inputData = req.body;
//     //verify
//     if (!inputData) {
//       return res.json({
//         success: false,
//         status: 400,
//         message: "please fill the form completely"
//       });
//     }
//     //data coming
//     const {admin_email,admin_password}=inputData;
//     //check if every entry is valid
//     if(!admin_email || !admin_password ){
//       return res.json({
//         success: false,
//         status: 400,
//         message: "please fill the missed columns"
//       });
//     }
//     //valid hai bhai

//     //find user in db
//     const checkData = await admin.findOne({
//       admin_email
//     });
//     if (!checkData){
//       return res.json({
//         success: false,
//         status: 500,
//         error: "admin not found"
//       });
//     };
//     //user hai 
//     const checkPass = await bcrypt.compare(admin_password,checkData.admin_password);
//     if (!checkPass){
//       return res.json({
//         success: false,
//         status: 500,
//         error: "Wrong Credentials"
//       });
//     };

//     //access and refresh token bnao
//     let accessToken = checkData.accessToken;
//     if (!checkData.accessToken || checkData.accessToken==null){
//       accessToken = await generateAccessToken(checkData._id);
//       if (!accessToken){
//         return res.status(409).json({
//           success:false,
//           message:"while login not able to create your session token"
//         });
//       }
//       await admin.findByIdAndUpdate(
//         createAdmin._id,
//       { $set: { accessToken } },
//       { new: true });
//     }
//     // const accessToken = await generateAccessToken(checkData._id);

//     const finalAdmin = await admin.findById(checkData._id).select("-admin_password -accessToken");

    
//     const options = {
//      httpOnly: true,
//       sameSite:"none",
//       secure: true,
//       maxAge:3600000,
//       //isme abh hamari cookie sirf server se hi modifiable hogi frontend par koi ese modify nhi kr skta.
//   }
//   return res.status(200).cookie("accessToken",accessToken,options)
//   .json({
//     success:true,
//     status:200,
//     data:finalAdmin,
//     message: "admin sign in succesfully"
//   })

    
//   } catch (error) {
//     res.status(500).json({
//       success:false,
//       error:error.message,
//     })
//   }
// }


const loginAdmin = async (req, res) => {
  try {
    const { admin_email, admin_password } = req.body;

    if (!admin_email || !admin_password) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    const checkData = await admin.findOne({ admin_email });
    if (!checkData) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // const checkPass = await bcrypt.compare(admin_password, checkData.admin_password);
    // if (!checkPass) {
    //   return res.status(401).json({ success: false, message: "Wrong Credentials" });
    // }

    //user hai 

const compareResult = await bcrypt.compare(admin_password, checkData.admin_password);

if (!compareResult){
  return res.status(401).json({
    success: false,
    status: 401,
    error: "Wrong Credentials"
  });
};


    let accessToken = checkData.accessToken;
    if (!accessToken) {
      accessToken = await generateAccessToken(checkData._id);

      await admin.findByIdAndUpdate(
        checkData._id,
        { $set: { accessToken } },
        { new: true }
      );
    }

    const finalAdmin = await admin.findById(checkData._id)
      .select("-admin_password -accessToken");

    return res.status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 3600000,
      })
      .json({
        success: true,
        data: finalAdmin,
        message: "Admin logged in successfully",
      });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const logoutAdmin = async (req,res)=>{
  try {
    await admin.findByIdAndUpdate(
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
    message: "admin sucessfully logged out",
  })
    
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
  })
  }
}


const createUser = async (req, res) => {
  try {
    const adminn = req.user;
    const { user_email, user_designation } = req.body;

    // Check if user already exists
    const checkUser = await user.findOne({ user_email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Encrypt default password
    const defaultPassword = "User@1234";
    const encryptPassword = await bcrypt.hash(defaultPassword, 10);

    // Create new user
    const newUser = await user.create({
      user_email,
      user_designation,
      user_admin: adminn._id,
      user_password: encryptPassword,
      user_status: "Active",
    });

    // Update admin's user list
    await admin.findByIdAndUpdate(
      adminn._id,
      { $push: { users: newUser._id } },
      { new: true }
    );

    // Email content
    const mailOptions = {
      from: process.env.CRD_USER,
      to: user_email,
      subject: 'Welcome to Profitex! Your Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #0b1437; text-align: center;">Welcome to ProfitX!</h2>
          <p>Hi there,</p>
          <p>We're excited to have you join ProfitX. Below are your credentials to access your account:</p>
          <div style="padding: 15px; background-color: #eef5ff; border-radius: 8px; border: 1px solid #ccd9ee; margin: 10px 0;">
            <p><strong>Email:</strong> ${user_email}</p>
            <p><strong>Password:</strong> ${defaultPassword}</p>
          </div>
          <p>Please change your password after logging in for the first time to keep your account secure.</p>
          <p>Thank you,</p>
          <p><strong>The ProfitX Team</strong></p>
        </div>
      `,
    };

    // Send email (but don't fail user creation if it errors)
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Error sending welcome email to', user_email, mailError);
      // User is still created successfully
      return res.status(200).json({
        success: true,
        message: "User created successfully (email failed to send)",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User created successfully and email sent",
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while creating user",
    });
  }
};


// const createUser = async(req,res)=>{
//   try {
//     const adminn = req.user;
//     const {user_email,user_designation} = req.body;

//     //check if user already exists
//     const checkUser = await user.findOne({user_email});
//     if (checkUser){
//       return res.status(400).json({
//         success:false,
//         message:"user already exist"
//       })
//     }
    
//     const encryptPassword = await bcrypt.hash("User@1234", 10);
//     if (!encryptPassword) {
//      return res.status(500).json({
//       success:false,
//       message:"error occured while encrypting password please try again"
//      })
//     }
//     const newUser = await user.create({
//       user_email: user_email,
//       user_designation: user_designation,
//       user_admin:adminn._id,
//       user_password:encryptPassword,
//       user_status:"Active"
//     });
//     if (!newUser){
//       return res.status(409).json({
//         success:false,
//         message:"can't create user please try again",
//       })
//     }
//     await admin.findByIdAndUpdate(
//       adminn._id,{
//         $push: {
//             users: newUser._id
//         }
//     },
//     {
//         new: true
//     }
//     )
//     // const mailOptions = {
//     //   from: 'aman1249.be22@chitkara.edu.in',
//     //   to: user_email,
//     //   subject: 'welcome to profitex',
//     //   text: `your credentials is email: ${user_email} and password: User@1234`,
//     // };
//     const mailOptions = {
//       from: process.env.CRD_USER,
//       to: user_email,
//       subject: 'Welcome to Profitex!',
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
//           <h2 style="color: #0b1437; text-align: center;">Welcome to ProfitX!</h2>
//           <p>Hi there,</p>
//           <p>We're excited to have you join ProfitX, your go-to solution for smart billing and management. Below are your credentials to access your account:</p>
//           <div style="padding: 15px; background-color: #eef5ff; border-radius: 8px; border: 1px solid #ccd9ee; margin: 10px 0;">
//             <p><strong>Email:</strong> ${user_email}</p>
//             <p><strong>Password:</strong> User@1234</p>
//           </div>
//           <p>To keep your account secure, we strongly recommend changing your password after logging in for the first time. You can do this by selecting the <strong>"Forgot Password"</strong> option on the sign-in page and following the instructions.</p>
//           <p>If you have any questions or need support, feel free to reply to this email.</p>
//           <p>Thank you,</p>
//           <p><strong>The ProfitX Team</strong></p>
//           <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #777;">
//             <p>ProfitX © 2024 | All rights reserved.</p>
//             <p>This is an automated email. Please do not reply.</p>
//           </div>
//         </div>
//       `,
//     };
    

//     // Send welcome email but do not fail user creation if email sending errors
//     try {
//       await transporter.sendMail(mailOptions);
//     } catch (mailError) {
//       console.error('Error sending welcome email to', user_email, mailError);
//       // Return success for user creation but indicate email failure in server log
//       return res.status(200).json({
//         success: true,
//         message: "user created successfully (email failed to send)",
//       });
//     }

//     return res.status(200).json({
//       success:true,
//       message:"user created successfully"
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success:false,
//       message:"error occured while creating user"
//     })
//   }
// }

const getAllUsersUnderAdmin = async (req, res) => {
  try {
      const adminn = await admin.findById(req.user._id).populate('users');

      if (!adminn) {
          return res.status(404).json({ message: 'Admin not found' });
      }

      // Return the users
      res.status(200).json({
          success:true,
          message: 'Users retrieved successfully',
          users: adminn.users
      });
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const completeProfile = async(req,res)=>{
  try {
    
    const id = req.user._id;
    // const updatedAdmin = await admin.findById(id);
    
    const {admin_name,admin_mobile_number,company_name,company_address,pan_number,gst_number,company_industry} = req.body;
    const updatedAdmin = await admin.findByIdAndUpdate(id,{$set:{admin_name:admin_name,admin_mobile_number:admin_mobile_number,company_name:company_name,company_address:company_address,
    pan_number:pan_number,
     gst_number:gst_number,
     company_industry:company_industry
    }},
  {
    new:true
  });
  // if (admin_name) updatedAdmin.admin_name = admin_name;
  // if(admin_mobile_number) updatedAdmin.admin_mobile_number = admin_mobile_number;
  // if(company_name) updatedAdmin.company_name = company_name;
  // if(company_address) updatedAdmin.company_address = company_address;
  // if(pan_number) updatedAdmin.pan_number = pan_number;
  // if(gst_number) updatedAdmin.gst_number = gst_number;
  // await updatedAdmin.save();
  if(!updatedAdmin){
    res.status(409).json({
      success:false,
      message:"error occured while updating please try again"
    })
  }
  res.status(200).json({
    success:true,
    message:"profile updated successfully"
  })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:"error occured "+error,
    })
  }
}


const getUsers = async (req, res) => {
  try {
    const id = req.user._id;
    const getData = await admin.findOne(id);
    res.json({
      status: 200,
      message: 'Users Found',
      data: getData
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

const updateUser = async (req, res) => {
  try {
    const id = req.params._id;
    const inputData = req.body;
    const updateData = await admin.findByIdAndUpdate(id, inputData, {
      new: true
    });
    res.json({
      status: 200,
      message: 'User Updated',
      data: updateData
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

const updateUserStatus = async (req, res) => {
  const { userId, newStatus } = req.body;

  // Validate input
  if (!userId || !newStatus) {
    return res.status(400).json({ message: 'User ID and new status are required.' });
  }

  // Check if the new status is valid
  if (!['Active', 'Inactive'].includes(newStatus)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    // Update user status in the database
    const updatedUser = await user.findByIdAndUpdate(
      userId,
      { user_status: newStatus },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User status updated successfully.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


const deleteUser = async (req, res) => {
  try {
    const id = req.params._id;
    const deleteData = await admin.findByIdAndDelete(id);
    res.json({
      status: 200,
      message: 'User Deleted',
      data: deleteData
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

const getUserCount = async(req,res)=>{
  try {
    const id = req.user._id;
    const countUser = await user.findById({user_admin:id}).count();
    if (!countUser){
      return res.status(401).json({
        success: false,
        message:"no user found"
      })
    }
    return res.status(200).json({
      success: true,
      count: countUser
    });
  } catch (error) {
    return res.status(500).json({success: false, message: error.message});
  }
}

const getTotalEarningsForAdmin = async (req, res) => {
  try {
    const adminId = req.user._id; 
    const findAdmin = await admin.findById(adminId);
    if (!findAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    const users = findAdmin.users;
    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        earnings: 0,
      });
    }
    const result = await Invoice.aggregate([
      {
        $match: {
          status: 'PAID',
          createdBy: { $in: users }, 
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalEarnings = result[0]?.totalEarnings || 0;

    // Respond with success
    res.status(200).json({
      success: true,
      earnings: totalEarnings,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Failed to calculate total earnings',
      error: error.message,
    });
  }
};

const getDailySalesForAdmin = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminn = await admin.findById(adminId);
    if (!adminn) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    const userIds = adminn.users; 
    if (!userIds || userIds.length === 0) {
      return res.json({
        success: true,
        data: [], // No users under admin means no sales data
      });
    }

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
      // Match invoices created by users under the admin in the last 9 days
      {
        $match: {
          createdBy: { $in: userIds }, // Match invoices from users under the admin
          status: 'PAID', // Only consider paid invoices
          createdAt: { $gte: nineDaysAgo }, // Only last 9 days
        },
      },
      // Unwind the items array to create a document for each item
      { $unwind: '$items' },
      // Group by date
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
          },
          totalQuantity: { $sum: '$items.quantity' }, 
          totalRevenue: { $sum: '$items.totalPrice' }, 
        },
      },
      {
        $project: {
          date: '$_id.date',
          totalQuantity: 1,
          totalRevenue: 1,
          _id: 0,
        },
      },
    ]);

    // Create a map of existing sales data by date
    const salesMap = new Map(
      dailySales.map((sale) => [sale.date, sale])
    );

    // Prepare final results with all 9 days
    const formattedSales = last9Days.map((day) => {
      const formattedDate = day.toISOString().split('T')[0];
      return salesMap.get(formattedDate) || {
        date: formattedDate,
        totalQuantity: 0,
        totalRevenue: 0,
      };
    });

    res.json({
      success: true,
      data: formattedSales,
    });
  } catch (error) {
    console.error('Daily Sales Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily sales',
      error: error.message,
    });
  }
};

const getAdminWeeklyRevenue = async (req, res) => {
  try {
    const adminId = req.user._id; // Admin ID from req.user

    // Fetch the admin's users array
    const adminn = await admin.findById(adminId).select("users");
    if (!adminn) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const userIds = [adminId, ...adminn.users]; // Include admin and their users

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const weeksInMonth = Array.from({ length: 4 }, (_, i) => ({ week: i + 48 }));

    const weeklyRevenue = await Invoice.aggregate([
      {
        $match: {
          status: "PAID", 
          createdBy: { $in: userIds }, // Match invoices created by admin or their users
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

    const revenueMap = new Map(weeklyRevenue.map((entry) => [entry.week, entry]));

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
    console.error("Admin Weekly Revenue Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching weekly revenue for admin",
      error: error.message,
    });
  }
};


// Utility to get ISO week number (if not already defined)
if (!Date.prototype.getWeek) {
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
}


// transporter is configured at top of file to be reused by all handlers




const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  // Check if both email and role are provided
  if (!email || !role) {
    return res.status(400).json({ success: false, error: 'Email and role are required' });
  }

  try {
    let admindoc = await admin.findOne({ admin_email: email });
    // Logic for finding user or admin
    // if (role === 'user') {
      // user = 
    // } else if (role === 'admin') {
    //   user = await admin.findOne({ email });
    // }

    if (!admindoc) {
      return res.status(404).json({ success: false, error: 'User or Admin not found !!!!' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in the database
    admindoc.forgotPasswordOTP = otp;
    admindoc.forgotPasswordOTPExpiration = Date.now() + 5 * 60 * 1000;
    await admindoc.save();

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
    // const admindoc = await admin.findOne({ admin_email: email });
    let admindoc = await admin.findOne({ admin_email: email });

    if (!admindoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    // Hash the new password before saving
    admindoc.admin_password = await bcrypt.hash(newPassword, 10);

    // Save the updated user document
    await admindoc.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error during password reset:", error); // Log the error to help debug
    return res.status(500).json({ success: false, message: "An error occurred while updating the password" });
  }
};

// Define the storage for the profile picture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/admin-profile-pics');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `admin-profile-${req.user._id}${fileExtension}`;  // Name the file based on user ID
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
      const profilePicPath =` /uploads/admin-profile-pics/${req.file.filename}`;

      // Find the user and update the profile picture path
      const adminToUpdate = await admin.findById(userId);
      if (!adminToUpdate) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
      }

      // Update profile picture in user model
      adminToUpdate.admin_profile_pic = profilePicPath; // Add this field to your user model if not already present
      await adminToUpdate.save();

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







module.exports = { register,createUser, getUsers, updateUser, deleteUser, sendMessage, sendWhatsapp,loginAdmin,logoutAdmin,getAllUsersUnderAdmin, updateUserStatus, getUserCount,completeProfile,getTotalEarningsForAdmin,getDailySalesForAdmin,getAdminWeeklyRevenue, forgotPassword, resetPassword,uploadProfilePic };

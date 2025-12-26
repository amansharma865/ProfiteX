const mongoose = require('mongoose');


const addBranch = async(req,res) => {
  try {
    const branchData = req.body;
  if (!branchData){
    return res.json({
      success: false,
      status: "400",
      error:"please fill the details completely"
    })
  }

  const {branch_name, branch_location, branch_type} = branchData;
  if (!branch_name || !branch_location || !branch_type){
    return res.json({
      success: false,
      status: "400",
      message:"fill the missed column"
    })
  }
  //check for already existing branch
  const alreadyExists = await Branch.findOne({$or: {branch_name,branch_location,branch_type}});
  if (alreadyExists){
    return res.json({
      success: false,
      status:"400",
      message:"branch already exists in your company",
    })
  }

  const newBranch = new Branch({
    branch_name:branch_name,
    branch_location:branch_location,
    branch_type:branch_type
  });
  const newBranchCreated = await newBranch.save();
  if (!newBranchCreated){
    return res.json({
      success:false,
      status:500,
      message:"internal server error please try again later",
    }
    )
  }
  return res.json({
    success:true,
    status:200,
    data:newBranchCreated,
    message:"sucessfully added you new branch"
  })
  } catch (error) {
    res.send("error occured while creating new branch",error);
  }
};

const branchDetails = async(req,res)=>{

};
const getAllBranches = async(req,res)=>{};
const updateBranches = async(req,res)=>{};
const deleteBranches = async(req,res)=>{};



module.exports = {addBranch,branchDetails};
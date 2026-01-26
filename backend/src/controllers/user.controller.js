import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Visit } from "../models/visit.model.js";
import { Flat } from "../models/flat.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL ,
    pass: process.env.EMAIL_PASSWORD
  }
    });


export const logoutUser=asyncHandler(async (req,res) => {
    console.log("Logging out user",req.user);
   try {
     const userId=req.user._id;
            await User.findByIdAndUpdate(
         userId,
      { $unset: { refreshToken: 1 } },
      { new: true }
      );
      
     const options={
    httpOnly:true,
    secure:false,
      sameSite: "lax"    
   }
   
     res.status(200)
     .
     clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json({ message: "User logged out successfully" });
   } catch (error) {
    console.log(" err",error);
      res.status(500).json({ message: "Error logging out user" });  
   }
})

export const getVisitorsSummary = asyncHandler(async (req, res) => {
   try {
      const { flatNo } = req.query;
      console.log("Fetching visitors summary for flatNo:", flatNo);
      if (!flatNo) {
     const activeVisitors= await Visit.countDocuments({ status: 'Approved' });
     const pendingVisitors= await Visit.countDocuments({ status: 'Pending' });
     const deniedVisitors= await Visit.countDocuments({ status: 'Denied' });
     const exitedVisitors= await Visit.countDocuments({ status: 'Exited' });
     const todayVisitors = await Visit.countDocuments({
         entryTime: {
             $gte: new Date(new Date().setHours(0, 0, 0, 0)),
             $lt: new Date(new Date().setHours(23, 59, 59, 999))
         }
     });
     res.status(200).json({
         activeVisitors,
         pendingVisitors,
         deniedVisitors,
         exitedVisitors,
         todayVisitors
     });}
    }catch (error) {

     res.status(500).json({ message: "Error fetching visitors summary" });

   }});

export const getRecentVisitorActivity = asyncHandler(async (req, res) => {
    try {
        const recentActivity = await Visit.find()
        .sort({ entryTime: -1 })
        .limit(5)
        .populate('visitor', 'name')
        .populate('resident', 'flatNo name')
        .select('visitor resident entryTime status');
    
        const formattedActivity = recentActivity.map((visit) => ({
        name: visit.visitor.name,
        resident: visit.resident.flatNo+ " -"+ visit.resident.name,
        time: visit.entryTime.toLocaleString(),
        status: visit.status
        }));
    
        res.status(200).json(formattedActivity);
    } catch (error) {
      console.log("error thre",error);
        res.status(500).json({ message: "Error fetching recent visitor activity" });
    }
    }
);
export const getVisitsOnFilter = asyncHandler(async (req, res) => {
  try {
   
    let { phoneNo, flatNo, status, startDate, endDate } = req.body;

    if (!phoneNo && !flatNo && !status && !startDate && !endDate) {
      throw new ApiError(400, "Please provide at least one filter parameter");
    }

    if (!startDate) {
      let d = new Date();
      d.setMonth(d.getMonth() - 1);
      startDate = d;
    } else {
      startDate = new Date(startDate);
    }

    if (!endDate) endDate = new Date();
    else endDate = new Date(endDate);

    const matchStage = {
      entryTime: { $gte: startDate, $lt: endDate }
    };
    if (status) matchStage.status = status;

    const pipeline = [
      { $match: matchStage },

      {
        $lookup: {
          from: "visitors",
          localField: "visitor",
          foreignField: "_id",
          as: "visitor"
        }
      },
      { $unwind: "$visitor" },

      {
        $lookup: {
          from: "users", 
          localField: "resident",
          foreignField: "_id",
          as: "resident"
        }
      },
      { $unwind: "$resident" }
    ];

    if (phoneNo) {
      pipeline.push({ $match: { "visitor.phoneNo": phoneNo } });
    }

    if (flatNo) {
      pipeline.push({ $match: { "resident.flatNo": flatNo } });
    }

    pipeline.push({ $sort: { entryTime: -1 } });

    const visits = await Visit.aggregate(pipeline);

    if (!visits.length) {
      throw new ApiError(404, "No visits found");
    }

    res.status(200).json({ visits });
  } catch (error) {
    console.error(error.message);
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Error while getting visits" });
  }
});


export const sendEmailOtp=asyncHandler(async(req,res)=>{
  try {
    const { email } = req.body;
    console.log("gotch",email);
    if (!email) {
      throw new ApiError(400, "Email is required to send OTP.");
    }
   
    const otp=
  Math.floor(100000 + Math.random() * 900000).toString();
   console.log("otp",otp);
    req.session.emailOtp = otp;
    req.session.emailOtpExpiry = Date.now() + 5 * 60 * 1000;
    req.session.emailVerified = false;

    await transporter.sendMail({
      from: `"Gate Security" <${process.env.EMAIL}>`,
      to: email,
      subject: "Visitor OTP Verification",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `
    });
    
   

    res.json({ success: true });

  } catch (error) {
     console.log(error);
    res.status(error.statuscode || 500).json({ message: error.message || "Error while sending OTP" });
  }

});
 
export const verifyEmailOtp=asyncHandler(async(req,res)=>{
  try {
    const { otp } = req.body;
    if (!otp) {
      throw new ApiError(400, "OTP is required for verification.");
    }
    if (req.session.emailOtp !== otp) {
      throw new ApiError(400, "Invalid OTP. Please try again.");
    }
    if (Date.now() > req.session.emailOtpExpiry) {
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }
    req.session.emailVerified = true;
    res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while verifying OTP" });
  }
});

export const getFlatNumbers = asyncHandler(async (req, res) => {
  try {
    console.log("inbcd");
    const flats =await Flat.find().sort({ flatNo: 1 }).select('flatNo -_id');
    const flatNumbers = flats.map(flat => flat.flatNo);
    res.status(200).json({ flatNumbers });
  }
    catch (error) {
    res.status(500).json({ message: "Error fetching flat numbers" });
  }
}
);

export const updateProfile=asyncHandler(async(req,res)=>{
  try {
    console.log(req.body);
    const {name,phoneNo,email}=req.body;
    const userId=req.user._id;
    const user=await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const updatedFields={};
    if (name) updatedFields.name=name;
    if (phoneNo) updatedFields.phoneNo=phoneNo;
    if (email) updatedFields.email=email;
    await User.findByIdAndUpdate(userId,
      { $set: updatedFields } 
  );
    res.status(200).json({message:"Profile updated successfully"});
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while updating profile" });
  }
});

export const updatePassword=asyncHandler(async(req,res)=>{
  try {
    const { currentPassword,newPassword }=req.body;
    const userId=req.user._id;
    const user=await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if(newPassword.length<8){
      throw new ApiError(409, "New password must be at least 8 characters long");
    }
    const isMatch=await user.isPasswordCorrect(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, "Current password is incorrect");
    } 
    user.password=newPassword;
    await user.save();
    res.status(200).json({message:"Password updated successfully"});
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while updating password" });
  } 
});

export const loginUser=async (phoneNo,password,role)=>{

 try {
   if (!phoneNo || !password || !role) {
     throw new ApiError(400, "Please provide all fields");
   }
 
   const user = await User.findOne({ phoneNo, role }).select("+password");
 
   if (!user) {
     throw new ApiError(404, "User not found");
   }
 
   const isPasswordValid = await user.isPasswordCorrect(password);
   if (!isPasswordValid) {
     throw new ApiError(401, "Invalid password");
   }
 
   const accessToken = user.generateAccessToken();
   const refreshToken = user.generateRefreshToken();
 
   user.refreshToken = refreshToken;
   await user.save({ validateBeforeSave: false });
 
   const userDetails = await User.findById(user._id).select("-refreshToken -password");
 
   return {  userDetails, accessToken, refreshToken };
 } catch (error) {
  throw error;
 }

}
export const loginAsGuest = asyncHandler(async (req, res) => {
  try {
    const { role } = req.body;
  
    if (!["manager", "guard", "resident"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
  let response={};
  if(role==="manager"){
    response= await loginUser("9000000001","guest12345","manager");
  
  }
    else if (role === "resident") {
     response=await loginUser("9000000002", "guest12345", "resident");
     
    }
  
    else if (role === "guard") {
      response=await loginUser("9000000003", "guest12345", "guard");
    }
    const options={
    httpOnly:true,
    secure:true,
      sameSite: "none"    
   }
    res.status(200).cookie("accessToken",response.accessToken,options).
    cookie("refreshToken",response.refreshToken,options).
    json({ user: response.userDetails });
  
  } catch (error) {
     res.status(error.statusCode || 500).json({ message: error.message || "Error while logging in Guard" });
  }
});
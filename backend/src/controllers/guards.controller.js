import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Visitor } from "../models/visitors.model.js";
import { Visit } from "../models/visit.model.js";
import { io } from "../index.js";
const loginGuard = asyncHandler(async (req, res) => {
  try {
    const { phoneNo, password, role } = req.body;
    if (!phoneNo || !password || !role) {
      throw new ApiError(400, "Please provide all fields");
    }
    const user = await User.findOne({ phoneNo, role }).select("+password");
    if (!user) {
      throw new ApiError(404, "Guard not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }
     const accessToken = await user.generateAccessToken();
     console.log(accessToken);
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save();
   const userDetails = await User.findOne({ phoneNo, role: "guard" }).select("-refreshToken");
   const options={
    httpOnly:true,
    secure:false,
      sameSite: "lax"    
   }
    res.
    cookie("accessToken",accessToken).
    cookie("refreshToken",refreshToken).
    status(200).json({ user: userDetails });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Error while logging in Guard" });
  }
});

 const checkVisitor = asyncHandler(async (req, res) => {
 try {
   const { email } = req.body; 
   if (!email) {
     throw new ApiError(400, "Email is required to check visitor status.");
   }
   console.log("e",email);
   const visitor = await Visitor.findOne({ email });
 
   if (visitor) {
     return res.status(200).json({
       exists: true,
       message: "Existing visitor found."
     });
   }
 
   return res.status(200).json({
     exists: false,
     message: "New visitor. OTP verification required."
   });
 } catch (error) {
     res.status(error.statuscode||500).json({
      message:error.message
    })
  }
});

const markEntry = asyncHandler(async (req, res) => {
  try {
  
    const { name, phoneNo, flatNo,purpose,email,employeeId } = req.body;
    if (!name || !phoneNo || !flatNo || !purpose || !email) {
      throw new ApiError(400, "Name, phone number,email and flat number  and purpose of visit are required.");
    }
    if(!employeeId){
      throw new ApiError(400,"Employee ID of guard is required.");
      }

  
    const resident = await User.findOne({ flatNo: flatNo, role: 'resident' });
    if (!resident) {
      throw new ApiError(404, "Invalid flat number: No resident found for this flat.");
    }
    const guard = await User.findOne({  employeeId, role: 'guard' });
    if (!guard) {
      throw new ApiError(404, "Invalid employee ID: No guard found with this ID.");
    }

    let visitor = await Visitor.findOne({  email });
    if (!visitor) {
      //return first register
      visitor = await Visitor.create({
        name,
        phoneNo,
        email
      });
    }
  console.log("started");
    const existingActiveVisit = await Visit.findOne({ 
    visitor: visitor._id, 
    status: 'Active' 
  });
  if (existingActiveVisit) {
    throw new ApiError(409, "This visitor is already marked as 'Active'. Please mark their previous exit before creating a new entry.");
  }
  
    const newVisit = await Visit.create({
      visitor: visitor._id,
      resident: resident._id,
      approvedGuardId: guard._id,
      flatNo: flatNo,
      purpose: purpose,
      entryTime: new Date(),
    });
    if (!newVisit) {
      throw new ApiError(500, "Failed to create a new visit record.");
    }
    const populatedVisit = await Visit.findById(newVisit._id)
                                 .populate('visitor', 'name phoneNo');
if (populatedVisit) {
  io.to(flatNo).emit("new-visitor", populatedVisit);
}
    return res.status(201).json(
      newVisit
    );
  } catch (error) {
     res.status(error.statuscode||500).json({
      message:error.message
    })
  }
});

const markExit=asyncHandler(async(req,res)=>{
  try {
    const {phoneNo}=req.body;
    console.log("Marking exit for phone number:", phoneNo);
    const visitor=await Visitor.findOne({phoneNo});
    if(!visitor){
      throw new ApiError(404,"Invalid phone number: No visitor found for this phoneNo.");
      }
      const existingActiveVisit=await Visit.findOne({visitor:visitor._id,status:'Approved'});
      if(!existingActiveVisit){
        throw new ApiError(404,"No active visit found for this visitor.");
        }
        const newVisit=await Visit.updateOne({visitor:visitor._id,status:'Approved'},
          {
            $set:{
              status:'Exited',
              exitTime:new Date(),
              }
              }
          );
          if(!newVisit){
            throw new ApiError(500,"Failed to update the visit record.");
            }
          res.status(201).json({
            message:"Visitor has exited successfully.",
            data:newVisit
          })
  } catch (error) {
    res.status(error.statuscode||500).json({
      message:error.message
    })
  }
});


const getTodaysActivity=asyncHandler(async(req,res)=>{
     try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
        const recentActivity = await Visit.find(
        { entryTime: { $gte: startOfDay, $lte: endOfDay } }
        )
        .sort({ updatedAt: -1 })
        .populate('visitor', 'name phoneNo')
        .populate('resident', 'flatNo name')
        .select('visitor resident entryTime status');
    
        const formattedActivity = recentActivity.map((visit) => ({
        name: visit.visitor.name,
        phoneNo: visit.visitor.phoneNo,
        resident: visit.resident.flatNo+ " -"+ visit.resident.name,
        time: visit.entryTime.toLocaleString(),
        status: visit.status
        }));
    
        res.status(200).json(formattedActivity);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recent visitor activity" });
    }
    }
);
export { loginGuard,markEntry,markExit,getTodaysActivity,checkVisitor };
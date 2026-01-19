import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.models.js";
import { Visit } from "../models/visit.model.js";

const getNextEmployeeId = async () => {
  const lastGuard = await User.findOne({ role: "guard" })
    .sort({ createdAt: -1 })
    .select("employeeId");

  if (!lastGuard || !lastGuard.employeeId) {
    return "G-001";
  }

  const lastNum = parseInt(lastGuard.employeeId.split("-")[1]);
  return `G-${String(lastNum + 1).padStart(3, "0")}`;
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const { name, phoneNo, email, password, role, flatNo } = req.body;

    if (!name || !phoneNo || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    if (role === 'resident' && !flatNo) {
      throw new ApiError(409, "resident must have flatNo");
    }

    if (phoneNo.length !== 10) {
      throw new ApiError(409, "phoneNo must be 10 digits");
    }
    if(password.length<8){
      throw new ApiError(409, "Password must be at least 8 characters long");
    }
const occupiedFlat = await User.findOne({ 
  flatNo, 
  role: 'resident' ,
  isActive:true
});

if (occupiedFlat) {
  throw new ApiError(
    400, 
    `Remove old resident of flatNo: ${flatNo} to add new Resident`
  );
}
    const existingUser = await User.findOne({
      $or: [{ phoneNo }]
    });

    if (existingUser ) {
      throw new ApiError(400, 'User already exists');
    }

    const userData = {
      name,
      phoneNo,
      email,
      password,
      role,
    };

    if (role === "resident") userData.flatNo = flatNo;
    if (role === "guard") userData.employeeId = await getNextEmployeeId();

    const user = await User.create(userData);

    const createdUser = await User.findById(user._id).select("-refreshToken");
    if (!createdUser) {
      throw new ApiError(500, 'Error occurred while registering new User');
    }

    res.status(201).json({ message: "User created successfully", user: createdUser });

  } catch (error) {
    console.log(error);
    res.status(error.statuscode || 500).json({ message: error.message || "Internal Server Error" });
  }
});



const loginManager = asyncHandler(async (req, res) => {
  try {
    const { phoneNo, password, role } = req.body;
    if (!phoneNo || !password || !role) {
      throw new ApiError(400, "Please provide all fields");
    }
    const user = await User.findOne({ phoneNo, role: "manager" }).select("+password");
    if (!user) {
      throw new ApiError(404, "Manager not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken=refreshToken
    await user.save();
   const userDetails = await User.findOne({ phoneNo, role: "manager" }).select("-refreshToken");
   const options={
    httpOnly:true,
    secure:false,
      sameSite: "lax"    
   }
   
    res.
    cookie("accessToken",accessToken,options).
    cookie("refreshToken",refreshToken,options).
    status(200).json({ user: userDetails });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Error while logging in Manager" });
  }
});


const deactivateResident=asyncHandler(async(req,res)=>{
  try {
    const { flatNo } = req.body;
    if (!flatNo) {
      throw new ApiError(400, "Please provide FlatNo to deactivate Resident");
    }
    const resident = await User.findOne({ flatNo, role: "resident", isActive: true });
    if (!resident) {
      throw new ApiError(404, "Active Resident not found for the provided FlatNo");
    } 
    resident.isActive = false;
    await resident.save();
    res.status(200).json({ message: `Resident of FlatNo: ${flatNo} has been deactivated successfully.` });
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while deactivating Resident" });
  }
});

const deactivateGuard=asyncHandler(async(req,res)=>{
  try {
    const { employeeId } = req.body;  
    if (!employeeId) {
      throw new ApiError(400, "Please provide EmployeeId to deactivate Guard");
    }
    const guard = await User.findOne({ employeeId, role: "guard", isActive: true });
    if (!guard) {
      throw new ApiError(404, "Active Guard not found for the provided EmployeeId");
    }
    guard.isActive = false;
    await guard.save();
    res.status(200).json({ message: `Guard with EmployeeId: ${employeeId} has been deactivated successfully.` });
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while deactivating Guard" });
  }
});

const getResidentDetails=asyncHandler(async(req,res)=>{
  try {
    const residents= await User.find({ role: "resident" }).select(" +flatNo +phoneNo  +name +isActive");
    res.status(200).json({ residents });
  } catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while fetching Resident details" });
  }
});

const getGuardDetails=asyncHandler(async(req,res)=>{
  try {
    const guards= await User.find({ role: "guard"}).select(" +employeeId +phoneNo  +name +isActive");
    res.status(200).json({ guards });
  }
  catch (error) {
    res.status(error.statuscode || 500).json({ message: error.message || "Error while fetching Guard details" });
  }
});

export {
  registerUser,
  loginManager,
  deactivateResident,
  deactivateGuard,
  getResidentDetails,
  getGuardDetails
 
}
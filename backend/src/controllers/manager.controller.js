import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.models.js";
import { Visit } from "../models/visit.model.js";
const registerUser = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const { name, phoneNo, email, password, role, flatNo, employeeId } = req.body;

    if (!name || !phoneNo || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (role === 'guard' && !employeeId) {
      throw new ApiError(409, "guard must have employeeId");
    }

    if (role === 'resident' && !flatNo) {
      throw new ApiError(409, "resident must have flatNo");
    }

    if (phoneNo.length !== 10) {
      throw new ApiError(409, "phoneNo must be 10 digits");
    }

    const existingUser = await User.findOne({
      $or: [{ phoneNo }]
    });

    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    // 👇 only include relevant fields
    const userData = {
      name,
      phoneNo,
      email,
      password,
      role,
    };

    if (role === "resident") userData.flatNo = flatNo;
    if (role === "guard") userData.employeeId = employeeId;

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


export {
  registerUser,
  loginManager,
 
}
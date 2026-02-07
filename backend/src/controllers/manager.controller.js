import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

const getNextEmployeeId = async () => {
  const lastGuard = await User.findOne({ role: "guard" })
    .sort({ employeeId: -1 }) // Sort by ID directly to find the highest
    .select("employeeId");

  if (!lastGuard || !lastGuard.employeeId) {
    return "G-001";
  }

  const lastNum = parseInt(lastGuard.employeeId.split("-")[1]);
  return `G-${String(lastNum + 1).padStart(3, "0")}`;
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, phoneNo, email, password, role, flatNo } = req.body;

  if (!name || !phoneNo || !email || !password || !role) {
    throw new ApiError(400, "All fields are required");
  }

  if (role === 'resident' && !flatNo) {
    throw new ApiError(400, "Residents must be assigned a flat number");
  }

  if (phoneNo.length !== 10) {
    throw new ApiError(400, "Phone number must be exactly 10 digits");
  }

  if (role === 'resident') {
    const occupiedFlat = await User.findOne({ flatNo, role: 'resident', isActive: true });
    if (occupiedFlat) {
      throw new ApiError(400, `Flat ${flatNo} is already occupied by an active resident`);
    }
  }

  const existingUser = await User.findOne({ phoneNo });
  if (existingUser) {
    throw new ApiError(409, "User with this phone number already exists");
  }

  const userData = { name, phoneNo, email, password, role };

  if (role === "resident") userData.flatNo = flatNo;
  if (role === "guard") userData.employeeId = await getNextEmployeeId();

  const user = await User.create(userData);
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  res.status(201).json({ 
    success: true, 
    message: "User registered successfully", 
    user: createdUser 
  });
});

export const loginManager = asyncHandler(async (req, res) => {
  const { phoneNo, password } = req.body;

  if (!phoneNo || !password) {
    throw new ApiError(400, "Phone number and password are required");
  }

  const user = await User.findOne({ phoneNo, role: "manager" }).select("+password");
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid manager credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userDetails = await User.findById(user._id).select("-password -refreshToken");

  res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json({ 
      success: true,
      user: userDetails, 
      accessToken 
    });
});

export const deactivateResident = asyncHandler(async (req, res) => {
  const { flatNo } = req.body;
  if (!flatNo) throw new ApiError(400, "Flat number is required");

  const resident = await User.findOneAndUpdate(
    { flatNo, role: "resident", isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!resident) throw new ApiError(404, "No active resident found for this flat");

  res.status(200).json({ message: `Resident of Flat ${flatNo} deactivated` });
});

export const deactivateGuard = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) throw new ApiError(400, "Employee ID is required");

  const guard = await User.findOneAndUpdate(
    { employeeId, role: "guard", isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!guard) throw new ApiError(404, "No active guard found with this ID");

  res.status(200).json({ message: `Guard ${employeeId} deactivated` });
});

export const getResidentDetails = asyncHandler(async (req, res) => {
  const residents = await User.find({ role: "resident" })
    .select("name flatNo phoneNo isActive")
    .sort({ flatNo: 1 });
  res.status(200).json({ residents });
});

export const getGuardDetails = asyncHandler(async (req, res) => {
  const guards = await User.find({ role: "guard" })
    .select("name employeeId phoneNo isActive")
    .sort({ employeeId: 1 });
  res.status(200).json({ guards });
});
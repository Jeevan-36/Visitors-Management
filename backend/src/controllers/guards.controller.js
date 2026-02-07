import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Visitor } from "../models/visitors.model.js";
import { Visit } from "../models/visit.model.js";
import { io } from "../index.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

export const loginGuard = asyncHandler(async (req, res) => {
  const { phoneNo, password, role } = req.body;
  if (!phoneNo || !password || !role) {
    throw new ApiError(400, "Please provide all fields");
  }

  const user = await User.findOne({ phoneNo, role }).select("+password");
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid guard credentials");
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
    .json({ user: userDetails, accessToken });
});

export const checkVisitor = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const visitor = await Visitor.findOne({ email });
  res.status(200).json({
    exists: !!visitor,
    message: visitor ? "Existing visitor found" : "New visitor verification required"
  });
});

export const markEntry = asyncHandler(async (req, res) => {
  const { name, phoneNo, flatNo, purpose, email, employeeId } = req.body;

  if (!name || !phoneNo || !flatNo || !purpose || !email) {
    throw new ApiError(400, "All visitor details are required");
  }

  const [resident, guard] = await Promise.all([
    User.findOne({ flatNo, role: 'resident', isActive: true }),
    User.findOne({ employeeId, role: 'guard', isActive: true })
  ]);

  if (!resident) throw new ApiError(404, "Target flat is currently vacant or inactive");
  if (!guard) throw new ApiError(404, "Invalid guard credentials");

  let visitor = await Visitor.findOne({ email });
  if (!visitor) {
    visitor = await Visitor.create({ name, phoneNo, email });
  }

  const activeVisit = await Visit.findOne({ visitor: visitor._id, status: { $in: ['Pending', 'Approved'] } });
  if (activeVisit) {
    throw new ApiError(409, "Visitor already has an active or pending session");
  }

  const newVisit = await Visit.create({
    visitor: visitor._id,
    resident: resident._id,
    approvedGuardId: guard._id,
    flatNo,
    purpose,
    entryTime: new Date(),
    status: 'Pending'
  });

  const populatedVisit = await Visit.findById(newVisit._id).populate('visitor', 'name phoneNo');
 
  io.to(flatNo).emit("new-visitor", populatedVisit);

  res.status(201).json(newVisit);
});

export const markExit = asyncHandler(async (req, res) => {
  const { phoneNo } = req.body;
  if (!phoneNo) throw new ApiError(400, "Visitor phone number required");

  const visitor = await Visitor.findOne({ phoneNo });
  if (!visitor) throw new ApiError(404, "Visitor not found");

  const activeVisit = await Visit.findOneAndUpdate(
    { visitor: visitor._id, status: 'Approved' },
    { $set: { status: 'Exited', exitTime: new Date() } },
    { new: true }
  );

  if (!activeVisit) {
    throw new ApiError(404, "No approved active visit found for this visitor");
  }

  res.status(200).json({ message: "Exit marked successfully", data: activeVisit });
});

export const getTodaysActivity = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const visits = await Visit.find({ entryTime: { $gte: startOfDay } })
    .sort({ updatedAt: -1 })
    .populate('visitor', 'name phoneNo')
    .populate('resident', 'flatNo name');

  const formatted = visits.map(v => ({
    name: v.visitor?.name || "Unknown",
    phoneNo: v.visitor?.phoneNo || "N/A",
    resident: `${v.resident?.flatNo} - ${v.resident?.name}`,
    time: v.entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: v.status
  }));

  res.status(200).json(formatted);
});
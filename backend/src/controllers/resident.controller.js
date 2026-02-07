import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Visit } from "../models/visit.model.js";
import { io } from "../index.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

export const loginResident = asyncHandler(async (req, res) => {
  const { phoneNo, password, role } = req.body;

  if (!phoneNo || !password || !role) {
    throw new ApiError(400, "Please provide all fields");
  }

  const user = await User.findOne({ phoneNo, role }).select("+password");
  if (!user) throw new ApiError(404, "Resident not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid password");

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
      user: userDetails,
      accessToken
    });
});

export const getPendingApprovals = asyncHandler(async (req, res) => {
  const { flatNo } = req.body;
  if (!flatNo) throw new ApiError(400, "Flat number is required");

  
  const pendingVisits = await Visit.find({
    status: "Pending",
    flatNo: flatNo
  }).populate('visitor', 'name phoneNo');

  res.status(200).json({ pendingVisits });
});

export const approveVisitor = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  if (!_id) throw new ApiError(400, "Visit ID is required");

  const visit = await Visit.findById(_id).populate('approvedGuardId');
  if (!visit) throw new ApiError(404, "Visit not found");

  if (["Exited", "Approved"].includes(visit.status)) {
    throw new ApiError(400, `Visitor already ${visit.status.toLowerCase()}`);
  }

  visit.status = "Approved";
  const updatedVisit = await visit.save();

  
  if (visit.approvedGuardId?.employeeId) {
    io.to(visit.approvedGuardId.employeeId).emit("resident-response", { updatedVisit });
  }

  res.status(200).json({ updatedVisit });
});

export const denyVisitor = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  if (!_id) throw new ApiError(400, "Visit ID is required");

  const visit = await Visit.findById(_id).populate('approvedGuardId');
  if (!visit) throw new ApiError(404, "Visit not found");

  if (["Exited", "Denied"].includes(visit.status)) {
    throw new ApiError(400, `Visitor already ${visit.status.toLowerCase()}`);
  }

  visit.status = "Denied";
  const updatedVisit = await visit.save();

  if (visit.approvedGuardId?.employeeId) {
    io.to(visit.approvedGuardId.employeeId).emit("resident-response", { updatedVisit });
  }

  res.status(200).json({ updatedVisit });
});

export const getResidentVisitorsCount = asyncHandler(async (req, res) => {
  const { flatNo } = req.body;
  if (!flatNo) throw new ApiError(400, "Flat number is required");

  const results = await Visit.aggregate([
    { $match: { flatNo: flatNo } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = {
    activeVisitors: 0,
    pendingVisitors: 0,
    exitedVisitors: 0
  };

  results.forEach(item => {
    if (item._id === "Approved") summary.activeVisitors = item.count;
    if (item._id === "Pending") summary.pendingVisitors = item.count;
    if (item._id === "Exited") summary.exitedVisitors = item.count;
  });

  res.status(200).json(summary);
});

export const getResidentRecentActivity = asyncHandler(async (req, res) => {
  const { flatNo } = req.body;
  if (!flatNo) throw new ApiError(400, "Flat number is required");

  const recentActivity = await Visit.find({ flatNo })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('visitor', 'name');

  const formattedActivity = recentActivity.map(visit => ({
    name: visit.visitor?.name || "Unknown",
    purpose: visit.purpose,
    status: visit.status,
    time: visit.createdAt ? new Date(visit.createdAt).toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    }) : "N/A"
  }));

  res.status(200).json(formattedActivity);
});
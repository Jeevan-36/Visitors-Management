import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Visit } from "../models/visit.model.js";
import { Flat } from "../models/flat.model.js";
import { Otp } from "../models/otp.model.js";
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, 
  sameSite: "none"
};

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json({ success: true, message: "User logged out successfully" });
});

export const getVisitorsSummary = asyncHandler(async (req, res) => {
  const { flatNo } = req.query;

  if (!flatNo) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [active, pending, denied, exited, today] = await Promise.all([
      Visit.countDocuments({ status: 'Approved' }),
      Visit.countDocuments({ status: 'Pending' }),
      Visit.countDocuments({ status: 'Denied' }),
      Visit.countDocuments({ status: 'Exited' }),
      Visit.countDocuments({ createdAt: { $gte: startOfToday } })
    ]);

    return res.status(200).json({
      activeVisitors: active,
      pendingVisitors: pending,
      deniedVisitors: denied,
      exitedVisitors: exited,
      todayVisitors: today
    });
  }
});

export const getRecentVisitorActivity = asyncHandler(async (req, res) => {
  const recentActivity = await Visit.find()
    .sort({ entryTime: -1 })
    .limit(5)
    .populate('visitor', 'name')
    .populate('resident', 'flatNo name');

  const formattedActivity = recentActivity.map((visit) => ({
    name: visit.visitor?.name || "Unknown",
    resident: `${visit.resident?.flatNo || ""} - ${visit.resident?.name || ""}`,
    time: visit.entryTime ? new Date(visit.entryTime).toLocaleString('en-IN') : "N/A",
    status: visit.status
  }));

  res.status(200).json(formattedActivity);
});

export const getVisitsOnFilter = asyncHandler(async (req, res) => {
  let { phoneNo, flatNo, status, startDate, endDate } = req.body;

  if (req.user && req.user.role === 'resident') {
    flatNo = req.user.flatNo;
  }

  const queryStart = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const queryEnd = endDate ? new Date(endDate) : new Date();

  const matchStage = {
    entryTime: { $gte: queryStart, $lte: queryEnd }
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

  if (phoneNo) pipeline.push({ $match: { "visitor.phoneNo": phoneNo } });
  if (flatNo) pipeline.push({ $match: { "resident.flatNo": flatNo } });

  pipeline.push({ $sort: { entryTime: -1 } });

  const visits = await Visit.aggregate(pipeline);
  res.status(200).json({ visits });
});

export const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete existing OTPs for this email address to avoid cluttering
  await Otp.deleteMany({ email: normalizedEmail });
  // Save new OTP
  await Otp.create({ email: normalizedEmail, otp });

  try {
    await transporter.sendMail({
      from: `"Gate Security" <${process.env.EMAIL}>`,
      to: normalizedEmail,
      subject: "Visitor OTP Verification",
      html: `<h1>${otp}</h1><p>Your OTP for building entry. Valid for 5 minutes.</p>`
    });
  } catch (err) {
    console.error("Mail error:", err);
    throw new ApiError(500, "Failed to send verification email");
  }

  res.json({ success: true });
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOtp = otp.trim();

  const record = await Otp.findOne({ email: normalizedEmail, otp: normalizedOtp });
  if (!record) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Delete valid OTP after verification
  await Otp.deleteOne({ _id: record._id });

  res.json({ success: true, message: "Email verified successfully" });
});

export const getFlatNumbers = asyncHandler(async (req, res) => {
  const flats = await Flat.find().sort({ flatNo: 1 });
  res.status(200).json({ flatNumbers: flats.map(f => f.flatNo) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phoneNo, email } = req.body;
  await User.findByIdAndUpdate(req.user._id, { $set: { name, phoneNo, email } });
  res.status(200).json({ message: "Profile updated" });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.isPasswordCorrect(currentPassword))) {
    throw new ApiError(400, "Invalid current password");
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: "Password updated" });
});


const performLogin = async (phoneNo, password, role) => {
  console.log(password+" "+role);
  const user = await User.findOne({ phoneNo, role }).select("+password");
  console.log("pl"+user);
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { 
    userDetails: await User.findById(user._id).select("-password -refreshToken"), 
    accessToken, 
    refreshToken 
  };
};

export const loginAsGuest = asyncHandler(async (req, res) => {
  const { role } = req.body;
  console.log(role);
  const guestCredentials = {
    manager: ["9000000001", "guest12345"],
    resident: ["9000000002", "guest12345"],
    guard: ["9000000003", "guest12345"]
  };

  if (!guestCredentials[role]) throw new ApiError(400, "Invalid role");

  const [phone, pass] = guestCredentials[role];
  const response = await performLogin(phone, pass, role);

  res.status(200)
    .cookie("accessToken", response.accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", response.refreshToken, COOKIE_OPTIONS)
    .json({ user: response.userDetails, accessToken: response.accessToken });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: Refresh token is missing");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token: User not found");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or already used");
    }

    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
      .json({
        success: true,
        accessToken,
        message: "Access token refreshed successfully"
      });
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
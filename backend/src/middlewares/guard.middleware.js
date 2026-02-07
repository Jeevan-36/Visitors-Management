import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyGuard = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized access: No token provided");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  if (user.role !== 'guard') {
    throw new ApiError(403, "Forbidden: Only Guards can access this resource");
  }

  req.user = user;
  next();
});
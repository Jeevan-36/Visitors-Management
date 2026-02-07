import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    const statusCode = error.name === "TokenExpiredError" ? 401 : (error.statusCode || 500);
    
    res.status(statusCode).json({
      success: false,
      message: error.message || "Error in verifying User"
    });
  }
};
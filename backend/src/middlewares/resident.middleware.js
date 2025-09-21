import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyResident = asyncHandler( async (req, res, next) => {
  try {
   
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
   
    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided.");
    }
   
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       
    const user = await User.findById(decodedToken?._id);
    console.log(user.role !== 'resident');

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (user.role !== 'resident') {
      throw new ApiError(403, "Forbidden: You do not have permission to access this resource.");
    }
    
    req.user = user;
    next();

  } catch (error) {
      res.status(error.statuscode || 500).json({
        message:error.message||"Error in verifying User"
      })
  }

    
   
});
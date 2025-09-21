import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

export const verifyGuard = async (req, res, next) => {
  try {
   // console.log(" guard middleware called",req.cookies);
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if (!token) {
     throw new ApiError(401,"Unauthorized access");
      }
      const userData=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      if(!userData){
        throw new ApiError(401,"Unauthorized access");
      }
      console.log("userData",userData);
      const user=await User.findById({
        _id:userData._id
      });
      
      if(!user){
        throw new ApiError(401,"Unauthorized access");
        }
        if(user.role!='guard'){
          throw new ApiError(401,"Unauthorized access you are not Guard to access data");
        }
        req.user=user;
        next();
  } catch (error) {
      res.status(error.statuscode || 500).json({
        message:error.message||"Error in verifying User"
      })
  }

    
   
};
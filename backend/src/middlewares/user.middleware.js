import { ApiError } from '../utils/ApiError.js';

export const verifyUser = async (req, res, next) => {
    if(!req.user){
        res.status(401).json({ message: "Unauthorized access" });
        return;
    }
    next();
   
};
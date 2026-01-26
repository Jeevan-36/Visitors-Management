import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

export const connectDB=async()=>{
    try { 
        await mongoose.connect(`${process.env.MONGODB_URI}`);
       console.log("Connected to database:", mongoose.connection.name);
    } catch (error) {
        console.log("Error in Database connection",error);
        process.exit(1);
    }
}
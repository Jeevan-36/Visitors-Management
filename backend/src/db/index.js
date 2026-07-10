import mongoose from "mongoose";

export const connectDB=async()=>{
    try { 
        console.log(process.env.MONGODB_URI);
        await mongoose.connect(`${process.env.MONGODB_URI}`);
       console.log("Connected to database:", mongoose.connection.name);
    } catch (error) {
        console.log("Error in Database connection",error);
        process.exit(1);
    }
}
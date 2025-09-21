import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.models.js'; // Adjust path if needed

dotenv.config();

const seedManager = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/visitors`);

    const existingManager = await User.findOne({ role: 'manager' });
    if (existingManager) {
      console.log("A manager account already exists.");
      return;
    }

   
    const managerData = {
      name :"Jeevan Reddy",
      phoneNo: "9848502252",
      email :"reddyjeevan2006@gmail.com",
      password:"12345678",
      role:"manager",
      flatNo: "A-101",
      employeeId:"1"
    };
    // ------------------------------------

    const manager = new User(managerData);
    await manager.save(); 
    console.log("Manager account created");


  } catch (error) {
    console.error("Error while seeding the database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

seedManager();
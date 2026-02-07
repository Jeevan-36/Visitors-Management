import mongoose from "mongoose";
import dotenv from "dotenv";
import { Flat } from "../models/flat.model.js"; 

dotenv.config();

const seedFlats = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("MongoDB connected");

    const flats = [{ flatNo: "GUEST-FLAT" }];
    const blocks = ["A", "B", "C"];
  
    for (const block of blocks) {
      for (let i = 101; i <= 105; i++) {
        flats.push({ flatNo: `${block}-${i}` });
      }
    }


    await Flat.insertMany(flats, { ordered: false });

    console.log(" Flats seeded successfully");
  } catch (error) { 
    if (error.code === 11000) {
      console.log(" Some flats already exist, skipped duplicates");
    } else {
      console.error(" Error while seeding flats:", error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected");
  }
};

seedFlats();

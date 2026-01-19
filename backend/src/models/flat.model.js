import mongoose from "mongoose";
const flatSchema=new mongoose.Schema(
    {
        flatNo:{  
            type:String,
            required:true,
            unique:true,
            trim:true
        },
    },
    {
        timestamps:true,
        strict:"throw"
    }
);
export const Flat=mongoose.model("Flat",flatSchema);
import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number.']
  }
}, { timestamps: true ,strict:"throw"});

export const Visitor = mongoose.model('Visitor', visitorSchema);
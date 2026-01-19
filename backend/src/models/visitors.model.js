import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number.']
  },
  email:{
    type: String,
    unique: true,
    trim: true,
    required: true,
     match: [
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Please provide a valid email address.'
  ]
  }
}, { timestamps: true ,strict:"throw"});

export const Visitor = mongoose.model('Visitor', visitorSchema);
import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema({
  visitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true,
  },
  flatNo: {
    type: String,
    required: true,
  },
   resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Denied', 'Exited'],
    default:'Pending'
  },
  purpose: {
    type: String,
    required: true,
  },
  approvedGuardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  entryTime: { type: Date },
  exitTime: { type: Date },
}, { timestamps: true ,strict:"throw"});

export const Visit = mongoose.model('Visit', VisitSchema);
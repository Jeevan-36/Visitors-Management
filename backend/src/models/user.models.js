import mongoose from 'mongoose';
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please fill a valid 10-digit Indian mobile number.']
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ['manager', 'guard',  'resident'],
    },
    flatNo: {
      type: String,
      sparse: true,
      required: function() { return this.role === 'resident'; }
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      required: function() { return this.role === 'guard';}
    },
    refreshToken: {
            type: String
        },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict:"throw"
  }
);

userSchema.pre("save",async function (next){
  if(!this.isModified("password")) return next();
  this.password=await bcrypt.hash(this.password,10);

})

userSchema.methods.isPasswordCorrect=async function (password){
  return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function(){
  return jwt.sign({
    _id:this._id,
    name:this.name,
    phoneNo:this.phoneNo
  },process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRE
  }
)
}
userSchema.methods.generateRefreshToken=function(){
  return jwt.sign({
    _id:this._id
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRE
  }
  )}

export const User = mongoose.model('User', userSchema);
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, unique: true },
//   password: { type: String, required: true }
// }, { timestamps: true });

// export const User = mongoose.model("User", userSchema);

// import mongoose, { Schema, Document } from 'mongoose';

// export interface IUser extends Document {
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;
//   password: string;
  
//   // ✅ ADD THESE NEW FIELDS
//   gender?: string;
//   age?: number;
//   profileImageUrl?: string;
//   bio?: string;
  
//   createdAt: Date;
//   updatedAt: Date;
// }

// const userSchema = new Schema<IUser>(
//   {
//     firstName: { 
//       type: String, 
//       required: [true, 'First name is required'] 
//     },
//     lastName: { 
//       type: String, 
//       required: [true, 'Last name is required'] 
//     },
//     username: { 
//       type: String, 
//       required: [true, 'Username is required'], 
//       unique: true 
//     },
//     email: { 
//       type: String, 
//       required: [true, 'Email is required'], 
//       unique: true 
//     },
//     password: { 
//       type: String, 
//       required: [true, 'Password is required'] 
//     },
    
//     // ✅ ADD THESE NEW FIELDS
//     gender: { 
//       type: String, 
//       enum: ['Male', 'Female', 'Other'],
//       default: null 
//     },
//     age: { 
//       type: Number, 
//       min: 1,
//       max: 150,
//       default: null 
//     },
//     profileImageUrl: { 
//       type: String, 
//       default: null 
//     },
//     bio: { 
//       type: String, 
//       maxlength: 500,
//       default: null 
//     },
    
//   },
//   { 
//     timestamps: true 
//   }
// );



// export const User = mongoose.model<IUser>('User', userSchema);
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, unique: true },
//   password: { type: String, required: true }
// }, { timestamps: true });

// export const User = mongoose.model("User", userSchema);

import bcrypt from 'bcryptjs/umd/types';
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  
  
  gender?: string;
  age?: number;
  profileImageUrl?: string;
  bio?: string;
  
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { 
      type: String, 
      required: [true, 'First name is required'] 
    },
    lastName: { 
      type: String, 
      required: [true, 'Last name is required'] 
    },
    username: { 
      type: String, 
      required: [true, 'Username is required'], 
      unique: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true 
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'] 
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    
    
    gender: { 
      type: String, 
      enum: ['Male', 'Female', 'Other'],
      default: null 
    },
    age: { 
      type: Number, 
      min: 1,
      max: 150,
      default: null 
    },
    profileImageUrl: { 
      type: String, 
      default: null 
    },
    bio: { 
      type: String, 
      maxlength: 500,
      default: null 
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    }
    
  },
  { 
    timestamps: true 
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};



export const User = mongoose.model<IUser>('User', userSchema);
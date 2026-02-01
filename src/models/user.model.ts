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

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  
  // ✅ ADD THESE NEW FIELDS
  gender?: string;
  age?: number;
  profileImageUrl?: string;
  bio?: string;
  
  createdAt: Date;
  updatedAt: Date;
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
    
    // ✅ ADD THESE NEW FIELDS
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
    
  },
  { 
    timestamps: true 
  }
);



export const User = mongoose.model<IUser>('User', userSchema);
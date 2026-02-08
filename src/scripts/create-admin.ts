import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tripcompanion';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Updating role to admin...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ Role updated to admin');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = new User({
        firstName: 'Admin',           // ✅ CHANGED FROM name
        lastName: 'User',              // ✅ ADDED
        username: 'admin',             // ✅ ADDED (required in your model)
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
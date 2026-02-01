import { User } from '../models/user.model';
import { CreateUserDto, UpdateUserDto } from '../dtos/admin.dto';

export class AdminRepository {
  // Create a new user
  async createUser(userData: CreateUserDto) {
    const user = new User(userData);
    return await user.save();
  }

  // Get all users (exclude password)
  async getAllUsers() {
    return await User.find().select('-password').sort({ createdAt: -1 });
  }

  // Get user by ID (exclude password)
  async getUserById(id: string) {
    return await User.findById(id).select('-password');
  }

  // Update user by ID
  async updateUser(id: string, userData: Partial<UpdateUserDto>) {
    return await User.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true, runValidators: true }
    ).select('-password');
  }

  // Delete user by ID
  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }

  // Check if email exists (for validation)
  async checkEmailExists(email: string, excludeId?: string) {
    const query: any = { email };
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    return await User.findOne(query);
  }

  // Get user by email (useful for login/validation)
  async getUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  // Count total users
  async countUsers(): Promise<number> {
    return await User.countDocuments();
  }

  // Get users by role
  async getUsersByRole(role: 'user' | 'admin') {
    return await User.find({ role }).select('-password');
  }

  // Check if user exists by ID
  async userExists(id: string): Promise<boolean> {
    const user = await User.findById(id);
    return !!user;
  }
}
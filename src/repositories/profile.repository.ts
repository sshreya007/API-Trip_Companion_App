import { User, IUser } from '../models/user.model';

export class ProfileRepository {
  // Get user profile by ID
  async getProfileById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updateData: {
      name?: string;
      gender?: string;
      age?: number;
      bio?: string;
    }
  ): Promise<IUser | null> {
    try {
      const updates: any = {};

      // Handle name update (split into firstName and lastName)
      if (updateData.name) {
        const nameParts = updateData.name.trim().split(' ');
        updates.firstName = nameParts[0];
        updates.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }

      if (updateData.gender) updates.gender = updateData.gender;
      if (updateData.age !== undefined) updates.age = updateData.age;
      if (updateData.bio !== undefined) updates.bio = updateData.bio;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Update profile image
  async updateProfileImage(
    userId: string,
    imageUrl: string
  ): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { profileImageUrl: imageUrl } },
        { new: true }
      ).select('-password');

      return user;
    } catch (error) {
      throw error;
    }
  }
}
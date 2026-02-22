import { User,IUser } from "../models/user.model";

export class AuthRepository {
  createUser(data: any) {
    return User.create(data);
  }

  getUserByEmail(email: string) {
    return User.findOne({ email });
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  //  Password Reset Methods
  async findByResetToken(token: string): Promise<IUser | null> {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  }

  async setResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });
  }

  async clearResetToken(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpires: 1
      }
    });
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.password = newPassword;
      await user.save(); // This triggers the pre-save hook to hash password
    }
  }


  
}

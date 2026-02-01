import { ProfileRepository } from '../repositories/profile.repository';
import { UpdateProfileDto, ProfileResponseDto } from '../dtos/profile.dto';
import { IUser } from '../models/user.model';

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  // Get user profile
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.profileRepository.getProfileById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.mapToProfileResponse(user);
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    const user = await this.profileRepository.updateProfile(userId, updateData);

    if (!user) {
      throw new Error('User not found');
    }

    return this.mapToProfileResponse(user);
  }

  // Update profile image
  async updateProfileImage(
    userId: string,
    imageUrl: string
  ): Promise<{ imageUrl: string }> {
    const user = await this.profileRepository.updateProfileImage(userId, imageUrl);

    if (!user) {
      throw new Error('User not found');
    }

    return { imageUrl: user.profileImageUrl || imageUrl };
  }

  // Map User model to ProfileResponseDto
  private mapToProfileResponse(user: IUser): ProfileResponseDto {
    return {
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      gender: user.gender || undefined,
      age: user.age || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
      bio: user.bio || undefined,
    };
  }
}
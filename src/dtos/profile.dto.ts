export interface UpdateProfileDto {
  name?: string;
  gender?: string;
  age?: number;
  bio?: string;
}

export interface ProfileResponseDto {
  id: string;
  name: string;
  email: string;
  gender?: string;
  age?: number;
  profileImageUrl?: string;
  bio?: string;
}

export interface UploadImageDto {
  userId: string;
  image: Express.Multer.File;
}
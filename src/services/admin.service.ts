import { AdminRepository } from '../repositories/admin.repository';
import { CreateUserDto, UpdateUserDto } from '../dtos/admin.dto';
import { HttpError } from '../errors/http-error';
import bcrypt from 'bcrypt';

export class AdminService {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async createUser(userData: CreateUserDto, imagePath?: string) {
    const existingUser = await this.adminRepository.checkEmailExists(userData.email);
    if (existingUser) {
      throw new HttpError(400, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = {
      ...userData,
      password: hashedPassword,
      profileImageUrl: imagePath || userData.profileImageUrl // ✅ CHANGED from image
    };

    return await this.adminRepository.createUser(newUser);
  }

  async getAllUsers() {
    return await this.adminRepository.getAllUsers();
  }

  async getUserById(id: string) {
    const user = await this.adminRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return user;
  }

  async updateUser(id: string, userData: UpdateUserDto, imagePath?: string) {
    const user = await this.adminRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    if (userData.email && userData.email !== (user as any).email) {
      const existingUser = await this.adminRepository.checkEmailExists(userData.email, id);
      if (existingUser) {
        throw new HttpError(400, 'Email already exists');
      }
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updateData = {
      ...userData,
      ...(imagePath && { profileImageUrl: imagePath }) // ✅ CHANGED from image
    };

    return await this.adminRepository.updateUser(id, updateData);
  }

  async deleteUser(id: string) {
    const user = await this.adminRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return await this.adminRepository.deleteUser(id);
  }
}
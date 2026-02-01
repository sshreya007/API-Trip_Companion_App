export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  image?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  image?: string;
}
export interface CreateUserDto {
  firstName: string;        // ✅ CHANGED
  lastName: string;         // ✅ ADDED
  username: string;         // ✅ ADDED
  email: string;
  password: string;
  role?: 'user' | 'admin';
  profileImageUrl?: string; // ✅ CHANGED from image
  gender?: string;          // ✅ ADDED (optional)
  age?: number;             // ✅ ADDED (optional)
  bio?: string;             // ✅ ADDED (optional)
}

export interface UpdateUserDto {
  firstName?: string;       // ✅ CHANGED
  lastName?: string;        // ✅ ADDED
  username?: string;        // ✅ ADDED
  email?: string;
  password?: string;
  role?: 'user' | 'admin';
  profileImageUrl?: string; // ✅ CHANGED from image
  gender?: string;          // ✅ ADDED (optional)
  age?: number;             // ✅ ADDED (optional)
  bio?: string;             // ✅ ADDED (optional)
}
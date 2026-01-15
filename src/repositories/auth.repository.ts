import { User } from "../models/user.model";

export class AuthRepository {
  createUser(data: any) {
    return User.create(data);
  }

  getUserByEmail(email: string) {
    return User.findOne({ email });
  }
}

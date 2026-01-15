import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import { JWT_SECRET } from "../config";

const repo = new AuthRepository();

export class AuthService {
  async register(data: any) {
    const existing = await repo.getUserByEmail(data.email);
    if (existing) throw new Error("Email already exists");

    const hashed = await bcrypt.hash(data.password, 10);

    return repo.createUser({
      ...data,
      password: hashed
    });
  }

  async login(email: string, password: string) {
    const user = await repo.getUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return { token, user };
  }
}

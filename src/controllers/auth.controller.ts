import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const service = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const user = await service.register(req.body);
    res.json({ success: true, user });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await service.login(req.body.email, req.body.password);
    res.json({ success: true, ...result });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

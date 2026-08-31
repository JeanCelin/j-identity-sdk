import type { AuthResult, RegisterData } from "../types/auth.js";
import type { User } from "../types/user.js";

export interface AuthAdapter {
  login(email: string, password: string): Promise<AuthResult>;
  refresh(): Promise<AuthResult>;
  logout(): Promise<void>;
  register(data: RegisterData): Promise<User>;
}

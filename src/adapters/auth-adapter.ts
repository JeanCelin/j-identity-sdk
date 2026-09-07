import type { AuthResult, RegisterData } from "../types/auth.js";
import type { User } from "../types/user.js";

export interface AuthAdapter {
  register(data: RegisterData): Promise<User>;

  login(email: string, password: string): Promise<AuthResult>;

  refresh(refreshToken: string): Promise<AuthResult>;

  logout(refreshToken: string): Promise<void>;

  me(accessToken: string): Promise<User>;
}

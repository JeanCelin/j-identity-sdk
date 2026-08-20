import type { AuthResult } from "../types/auth.js";

export interface AuthAdapter {
  login(email: string, password: string): Promise<AuthResult>;
  refresh(): Promise<AuthResult>;
  logout(): Promise<void>;
}

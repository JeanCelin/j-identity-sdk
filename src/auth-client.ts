
import type { AuthAdapter } from "./adapters/auth-adapter.js";
import type {
  AuthResult,
  RegisterData,
} from "./types/auth.js";
import type { User } from "./types/user.js";

export class AuthClient {
  private readonly adapter: AuthAdapter;

  constructor(adapter: AuthAdapter) {
    this.adapter = adapter;
  }

  async register(data: RegisterData): Promise<User> {
    return this.adapter.register(data);
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    return this.adapter.login(email, password);
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    return this.adapter.refresh(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    return this.adapter.logout(refreshToken);
  }

  async me(accessToken: string): Promise<User> {
    return this.adapter.me(accessToken);
  }
}


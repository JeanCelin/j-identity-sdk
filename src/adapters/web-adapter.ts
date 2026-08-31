import type { HttpClient } from "../http/http-client.js";
import type { AuthResult, RegisterData } from "../types/auth.js";
import type { User } from "../types/user.js";
import type { AuthAdapter } from "./auth-adapter.js";

export class WebAdapter implements AuthAdapter {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }
  async register(data: RegisterData): Promise<User> {
    const result = await this.httpClient.request<{ user: User }>({
      method: "POST",
      path: "/auth/register",
      body: data,
    });

    return result.user;
  }
  async login(email: string, password: string): Promise<AuthResult> {
    return this.httpClient.request<AuthResult>({
      method: "POST",
      path: "/auth/login",
      credentials: "include",
      body: {
        email,
        password,
      },
    });
  }

  async refresh(): Promise<AuthResult> {
    return this.httpClient.request<AuthResult>({
      method: "POST",
      path: "/auth/refresh",
      credentials: "include",
    });
  }
  async logout(): Promise<void> {
    await this.httpClient.request<void>({
      method: "POST",
      path: "/auth/logout",
      credentials: "include",
    });
  }
}

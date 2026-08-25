import type { HttpClient } from "../http/http-client.js";
import type { AuthResult } from "../types/auth.js";
import type { AuthAdapter } from "./auth-adapter.js";

export class WebAdapter implements AuthAdapter {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
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
      credentials: "include"
    });
  }
  async logout(): Promise<void> {
    await this.httpClient.request<void>({
      method: "POST",
      path: "/auth/logout",
      credentials: "include"
    });
  }
}

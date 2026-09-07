
import type { HttpClient } from "../http/http-client.js";
import type {
  AuthResult,
  RegisterData,
} from "../types/auth.js";
import type { User } from "../types/user.js";
import type { AuthAdapter } from "./auth-adapter.js";

export class ServerAdapter implements AuthAdapter {
  private readonly httpClient: HttpClient;

  private readonly clientId: string;

  private readonly clientSecret: string;

  constructor(
    httpClient: HttpClient,
    clientId: string,
    clientSecret: string,
  ) {
    this.httpClient = httpClient;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async register(data: RegisterData): Promise<User> {
    const result = await this.httpClient.request<{ user: User }>({
      method: "POST",
      path: "/auth/register",
      body: {
        ...data,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      },
    });

    return result.user;
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    return this.httpClient.request<AuthResult>({
      method: "POST",
      path: "/auth/login",
      body: {
        email,
        password,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      },
    });
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    return this.httpClient.request<AuthResult>({
      method: "POST",
      path: "/auth/refresh",
      body: {
        refreshToken,
      },
    });
  }

  async logout(refreshToken: string): Promise<void> {
    await this.httpClient.request<void>({
      method: "POST",
      path: "/auth/logout",
      body: {
        refreshToken,
      },
    });
  }

  async me(accessToken: string): Promise<User> {
    return this.httpClient.request<User>({
      method: "GET",
      path: "/auth/me",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}


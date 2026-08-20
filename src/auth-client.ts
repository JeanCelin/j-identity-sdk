import type { AuthAdapter } from "./adapters/auth-adapter.js";
import type { AuthClientConfig, AuthResult } from "./types/auth.js";
import type { HttpClient } from "./http/http-client.js";
import type { User } from "./types/user.js";

export class AuthClient {
  private readonly config: AuthClientConfig;
  private readonly adapter: AuthAdapter;
  private readonly httpClient: HttpClient;

  private accessToken: string | null = null;

  constructor(
    config: AuthClientConfig,
    adapter: AuthAdapter,
    httpClient: HttpClient,
  ) {
    this.config = config;
    this.adapter = adapter;
    this.httpClient = httpClient;
  }
  getAccessToken(): string | null {
    return this.accessToken;
  }
  async login(email: string, password: string): Promise<AuthResult> {
    const result = await this.adapter.login(email, password);

    this.accessToken = result.accessToken;

    return result;
  }

  async refresh(): Promise<AuthResult> {
    const result = await this.adapter.refresh();

    this.accessToken = result.accessToken;

    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.adapter.logout();
    } finally {
      this.accessToken = null;
    }
  }

  async me(): Promise<User> {
    if (!this.accessToken) {
      throw new Error("Não autenticado");
    }
    const user = await this.httpClient.request<User>({
      method: "GET",
      path: "/auth/me",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    return user;
  }
}

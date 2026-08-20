import { describe, expect, it, vi } from "vitest";

import { AuthClient } from "./auth-client.js";
import type { AuthAdapter } from "./adapters/auth-adapter.js";
import type { HttpClient, HttpRequest } from "./http/http-client.js";

describe("AuthClient", () => {
  it("deve armazenar o Access Token após o login", async () => {
    const login = vi.fn(async () => ({
      accessToken: "access-token-123",
    }));

    const fakeAdapter: AuthAdapter = {
      login,
      refresh: async () => ({
        accessToken: "access-token-new",
      }),
      logout: async () => {},
    };

    const fakeHttpClient: HttpClient = {
      request: async () => {
        throw new Error("Não deveria ser chamado neste teste");
      },
    };

    const auth = new AuthClient(
      {
        apiUrl: "https://example.com",
        platform: "web",
      },
      fakeAdapter,
      fakeHttpClient,
    );

    await auth.login("jean@example.com", "123456");

    expect(login).toHaveBeenCalledWith("jean@example.com", "123456");
    expect(auth.getAccessToken()).toBe("access-token-123");
  });

  it("deve atualizar o Access Token após o refresh", async () => {
    const fakeAdapter: AuthAdapter = {
      login: async () => ({
        accessToken: "access-token",
      }),
      refresh: async () => ({
        accessToken: "access-token-new",
      }),
      logout: async () => {},
    };

    const fakeHttpClient: HttpClient = {
      request: async () => {
        throw new Error("Não deveria ser chamado neste teste");
      },
    };

    const auth = new AuthClient(
      {
        apiUrl: "https://example.com",
        platform: "web",
      },
      fakeAdapter,
      fakeHttpClient,
    );

    await auth.login("jean@example.com", "123456");
    await auth.refresh();

    expect(auth.getAccessToken()).toBe("access-token-new");
  });

  it("deve remover o Access Token após o logout", async () => {
    const fakeAdapter: AuthAdapter = {
      login: async () => ({
        accessToken: "access-token",
      }),
      refresh: async () => ({
        accessToken: "access-token-new",
      }),
      logout: async () => {},
    };

    const fakeHttpClient: HttpClient = {
      request: async () => {
        throw new Error("Não deveria ser chamado neste teste");
      },
    };

    const auth = new AuthClient(
      {
        apiUrl: "https://example.com",
        platform: "web",
      },
      fakeAdapter,
      fakeHttpClient,
    );

    await auth.login("jean@example.com", "123456");

    expect(auth.getAccessToken()).toBe("access-token");

    await auth.logout();

    expect(auth.getAccessToken()).toBeNull();
  });

  it("deve buscar o usuário autenticado", async () => {
    const fakeAdapter: AuthAdapter = {
      login: async () => ({
        accessToken: "access-token",
      }),
      refresh: async () => ({
        accessToken: "access-token-new",
      }),
      logout: async () => {},
    };

    const user = {
      id: "user-123",
      name: "Jean",
      email: "jean@example.com",
      emailVerified: false,
      isActive: true,
      createdAt: "2026-08-20T00:00:00.000Z",
      updatedAt: "2026-08-20T00:00:00.000Z",
    };

    const request = vi.fn(
      async <T>(_request: HttpRequest): Promise<T> => {
        return user as T;
      },
    );

    const fakeHttpClient: HttpClient = {
      request: request as unknown as HttpClient["request"],
    };

    const auth = new AuthClient(
      {
        apiUrl: "https://example.com",
        platform: "web",
      },
      fakeAdapter,
      fakeHttpClient,
    );

    await auth.login("jean@example.com", "123456");

    const result = await auth.me();

    expect(request).toHaveBeenCalledWith({
      method: "GET",
      path: "/auth/me",
      headers: {
        Authorization: "Bearer access-token",
      },
    });

    expect(result).toEqual(user);
  });

  it("deve rejeitar me quando não estiver autenticado", async () => {
    const fakeAdapter: AuthAdapter = {
      login: async () => ({
        accessToken: "access-token",
      }),
      refresh: async () => ({
        accessToken: "access-token-new",
      }),
      logout: async () => {},
    };

    const request = vi.fn(
      async <T>(_request: HttpRequest): Promise<T> => {
        throw new Error("Não deveria ser chamado neste teste");
      },
    );

    const fakeHttpClient: HttpClient = {
      request: request as unknown as HttpClient["request"],
    };

    const auth = new AuthClient(
      {
        apiUrl: "https://example.com",
        platform: "web",
      },
      fakeAdapter,
      fakeHttpClient,
    );

    await expect(auth.me()).rejects.toThrow("Não autenticado");
    expect(request).not.toHaveBeenCalled();
  });
});
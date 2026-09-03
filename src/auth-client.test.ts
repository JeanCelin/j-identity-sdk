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
      register: vi.fn(),
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
      register: vi.fn(),
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
      register: vi.fn(),
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
      register: vi.fn(),
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
      register: vi.fn(),
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

describe("initialize", () => {
  it("deve restaurar uma sessão existente", async () => {
    const adapter: AuthAdapter = {
      login: vi.fn(),
      register: vi.fn(),
      refresh: vi.fn().mockResolvedValue({
        accessToken: "new-access-token",
      }),
      logout: vi.fn(),
    };

    const httpClient: HttpClient = {
      request: vi.fn().mockResolvedValue({
        id: "1",
        name: "Jean",
        email: "jean@email.com",
        emailVerified: true,
        isActive: true,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      }),
    };

    const auth = new AuthClient(
      {
        apiUrl: "http://localhost:3001",
        platform: "web",
      },
      adapter,
      httpClient,
    );

    const session = await auth.initialize();

    expect(session.authenticated).toBe(true);

    expect(session.user).toEqual({
      id: "1",
      name: "Jean",
      email: "jean@email.com",
      emailVerified: true,
      isActive: true,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });

    expect(auth.getAccessToken()).toBe("new-access-token");
  });

  it("deve retornar não autenticado quando o refresh falhar", async () => {
    const adapter: AuthAdapter = {
      login: vi.fn(),
      register: vi.fn(),
      refresh: vi.fn().mockRejectedValue(
        new Error("Sessão expirada"),
      ),
      logout: vi.fn(),
    };

    const httpClient: HttpClient = {
      request: vi.fn(),
    };

    const auth = new AuthClient(
      {
        apiUrl: "http://localhost:3001",
        platform: "web",
      },
      adapter,
      httpClient,
    );

    const session = await auth.initialize();

    expect(session.authenticated).toBe(false);
    expect(session.user).toBeNull();
    expect(auth.getAccessToken()).toBeNull();

    expect(httpClient.request).not.toHaveBeenCalled();
  });

  it("deve retornar não autenticado quando o me falhar", async () => {
    const adapter: AuthAdapter = {
      login: vi.fn(),
      register: vi.fn(),
      refresh: vi.fn().mockResolvedValue({
        accessToken: "new-access-token",
      }),
      logout: vi.fn(),
    };

    const httpClient: HttpClient = {
      request: vi.fn().mockRejectedValue(
        new Error("Token inválido"),
      ),
    };

    const auth = new AuthClient(
      {
        apiUrl: "http://localhost:3001",
        platform: "web",
      },
      adapter,
      httpClient,
    );

    const session = await auth.initialize();

    expect(session.authenticated).toBe(false);
    expect(session.user).toBeNull();
    expect(auth.getAccessToken()).toBeNull();
  });
});
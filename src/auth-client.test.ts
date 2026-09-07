import { describe, expect, it, vi } from "vitest";

import { AuthClient } from "./auth-client.js";

import type { AuthAdapter } from "./adapters/auth-adapter.js";

describe("AuthClient", () => {
  it("deve delegar o register para o adapter", async () => {
    const user = {
      id: "user-123",
      name: "Jean",
      email: "jean@example.com",
      emailVerified: false,
      isActive: true,
      createdAt: "2026-08-20T00:00:00.000Z",
      updatedAt: "2026-08-20T00:00:00.000Z",
    };

    const register = vi.fn().mockResolvedValue(user);

    const adapter: AuthAdapter = {
      register,
      login: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
    };

    const auth = new AuthClient(adapter);

    const result = await auth.register({
      name: "Jean",
      email: "jean@example.com",
      password: "12345678",
    });

    expect(register).toHaveBeenCalledWith({
      name: "Jean",
      email: "jean@example.com",
      password: "12345678",
    });

    expect(result).toEqual(user);
  });

  it("deve delegar o login para o adapter e retornar os tokens", async () => {
    const tokens = {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-123",
    };

    const login = vi.fn().mockResolvedValue(tokens);

    const adapter: AuthAdapter = {
      register: vi.fn(),
      login,
      refresh: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
    };

    const auth = new AuthClient(adapter);

    const result = await auth.login(
      "jean@example.com",
      "12345678",
    );

    expect(login).toHaveBeenCalledWith(
      "jean@example.com",
      "12345678",
    );

    expect(result).toEqual(tokens);
  });

  it("deve delegar o refresh para o adapter usando o refresh token informado", async () => {
    const tokens = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const refresh = vi.fn().mockResolvedValue(tokens);

    const adapter: AuthAdapter = {
      register: vi.fn(),
      login: vi.fn(),
      refresh,
      logout: vi.fn(),
      me: vi.fn(),
    };

    const auth = new AuthClient(adapter);

    const result = await auth.refresh("refresh-token-123");

    expect(refresh).toHaveBeenCalledWith("refresh-token-123");
    expect(result).toEqual(tokens);
  });

  it("deve delegar o logout para o adapter usando o refresh token informado", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);

    const adapter: AuthAdapter = {
      register: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(),
      logout,
      me: vi.fn(),
    };

    const auth = new AuthClient(adapter);

    await auth.logout("refresh-token-123");

    expect(logout).toHaveBeenCalledWith("refresh-token-123");
  });

  it("deve delegar o me para o adapter usando o access token informado", async () => {
    const user = {
      id: "user-123",
      name: "Jean",
      email: "jean@example.com",
      emailVerified: false,
      isActive: true,
      createdAt: "2026-08-20T00:00:00.000Z",
      updatedAt: "2026-08-20T00:00:00.000Z",
    };

    const me = vi.fn().mockResolvedValue(user);

    const adapter: AuthAdapter = {
      register: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
      me,
    };

    const auth = new AuthClient(adapter);

    const result = await auth.me("access-token-123");

    expect(me).toHaveBeenCalledWith("access-token-123");
    expect(result).toEqual(user);
  });
});
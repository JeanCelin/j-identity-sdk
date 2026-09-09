import { describe, expect, it, vi } from "vitest";

import { ServerAdapter } from "./server-adapter.js";

import type { HttpClient } from "../http/http-client.js";

describe("ServerAdapter", () => {
  const clientId = "client-id-123";

  const clientSecret = "client-secret-123";

  it("deve enviar clientId e clientSecret no register", async () => {
    const request = vi.fn().mockResolvedValue({
      user: {
        id: "user-123",
        name: "Jean",
        email: "jean@example.com",
        emailVerified: false,
        isActive: true,
        createdAt: "2026-08-20T00:00:00.000Z",
        updatedAt: "2026-08-20T00:00:00.000Z",
      },
    });

    const httpClient: HttpClient = {
      request: request as HttpClient["request"],
    };

    const adapter = new ServerAdapter(
      httpClient,
      clientId,
      clientSecret,
    );

    const result = await adapter.register({
      name: "Jean",
      email: "jean@example.com",
      password: "12345678",
    });

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/register",
      body: {
        name: "Jean",
        email: "jean@example.com",
        password: "12345678",
        clientId,
        clientSecret,
      },
    });

    expect(result).toEqual({
      id: "user-123",
      name: "Jean",
      email: "jean@example.com",
      emailVerified: false,
      isActive: true,
      createdAt: "2026-08-20T00:00:00.000Z",
      updatedAt: "2026-08-20T00:00:00.000Z",
    });
  });

  it("deve enviar clientId e clientSecret no login", async () => {
    const tokens = {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-123",
    };

    const request = vi.fn().mockResolvedValue(tokens);

    const httpClient: HttpClient = {
      request: request as HttpClient["request"],
    };

    const adapter = new ServerAdapter(
      httpClient,
      clientId,
      clientSecret,
    );

    const result = await adapter.login(
      "jean@example.com",
      "12345678",
    );

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/login",
      body: {
        email: "jean@example.com",
        password: "12345678",
        clientId,
        clientSecret,
      },
    });

    expect(result).toEqual(tokens);
  });

  it("deve enviar o refresh token, clientId e clientSecret no refresh", async () => {
    const tokens = {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    };

    const request = vi.fn().mockResolvedValue(tokens);

    const httpClient: HttpClient = {
      request: request as HttpClient["request"],
    };

    const adapter = new ServerAdapter(
      httpClient,
      clientId,
      clientSecret,
    );

    const result = await adapter.refresh("refresh-token-123");

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/refresh",
      body: {
        refreshToken: "refresh-token-123",
        clientId,
        clientSecret,
      },
    });

    expect(result).toEqual(tokens);
  });

  it("deve enviar o refresh token, clientId e clientSecret no logout", async () => {
    const request = vi.fn().mockResolvedValue(undefined);

    const httpClient: HttpClient = {
      request: request as HttpClient["request"],
    };

    const adapter = new ServerAdapter(
      httpClient,
      clientId,
      clientSecret,
    );

    await adapter.logout("refresh-token-123");

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/logout",
      body: {
        refreshToken: "refresh-token-123",
        clientId,
        clientSecret,
      },
    });
  });

  it("deve enviar o access token no me", async () => {
    const user = {
      id: "user-123",
      name: "Jean",
      email: "jean@example.com",
      emailVerified: false,
      isActive: true,
      createdAt: "2026-08-20T00:00:00.000Z",
      updatedAt: "2026-08-20T00:00:00.000Z",
    };

    const request = vi.fn().mockResolvedValue(user);

    const httpClient: HttpClient = {
      request: request as HttpClient["request"],
    };

    const adapter = new ServerAdapter(
      httpClient,
      clientId,
      clientSecret,
    );

    const result = await adapter.me("access-token-123");

    expect(request).toHaveBeenCalledWith({
      method: "GET",
      path: "/auth/me",
      headers: {
        Authorization: "Bearer access-token-123",
      },
    });

    expect(result).toEqual(user);
  });
});
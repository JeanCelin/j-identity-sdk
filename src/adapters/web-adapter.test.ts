import { describe, expect, it, vi } from "vitest";

import { WebAdapter } from "./web-adapter.js";
import type { HttpClient, HttpRequest } from "../http/http-client.js";

describe("WebAdapter", () => {
  it("deve enviar o refresh token por cookie ao atualizar a sessão", async () => {
    const request = vi.fn(async <T>(_request: HttpRequest): Promise<T> => {
      return {
        accessToken: "access-token-new",
      } as T;
    });

    const fakeHttpClient: HttpClient = {
      request: request as unknown as HttpClient["request"],
    };

    const adapter = new WebAdapter(fakeHttpClient);

    await adapter.refresh();

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/refresh",
      credentials: "include",
    });
  });

  it("deve enviar email e senha ao realizar login", async () => {
    const request = vi.fn(async <T>(_request: HttpRequest): Promise<T> => {
      return {
        accessToken: "access-token",
      } as T;
    });

    const fakeHttpClient: HttpClient = {
      request: request as unknown as HttpClient["request"],
    };

    const adapter = new WebAdapter(fakeHttpClient);

    await adapter.login("jean@example.com", "123456");

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/login",
      credentials: "include",
      body: {
        email: "jean@example.com",
        password: "123456",
      },
    });
  });

  it("deve enviar as credenciais ao realizar logout", async () => {
    const request = vi.fn(async <T>(_request: HttpRequest): Promise<T> => {
      return {
        accessToken: "access-token",
      } as T;
    });

    const fakeHttpClient: HttpClient = {
      request: request as unknown as HttpClient["request"],
    };

    const adapter = new WebAdapter(fakeHttpClient);

    await adapter.logout();

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/logout",
      credentials: "include",
    });
  });
});

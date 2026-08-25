import { describe, expect, it, vi } from "vitest";

import { FetchHttpClient } from "./fetch-http-client.js";
import { HttpError } from "../errors/http-error.js";

describe("FetchHttpClient", () => {
  it("deve realizar uma requisição GET", async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = new FetchHttpClient(
      "https://example.com",
    );

    await httpClient.request({
      method: "GET",
      path: "/auth/me",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/auth/me",
      {
        method: "GET",
        headers: {},
      },
    );
  });

  it("deve enviar o body como JSON em uma requisição POST", async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = new FetchHttpClient(
      "https://example.com",
    );

    await httpClient.request({
      method: "POST",
      path: "/auth/login",
      body: {
        email: "jean@example.com",
        password: "123456",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "jean@example.com",
          password: "123456",
        }),
      },
    );
  });

  it("deve enviar os headers informados na requisição", async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = new FetchHttpClient(
      "https://example.com",
    );

    await httpClient.request({
      method: "GET",
      path: "/auth/me",
      headers: {
        Authorization: "Bearer access-token",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/auth/me",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer access-token",
        },
      },
    );
  });

  it("deve enviar credentials quando informado", async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = new FetchHttpClient(
      "https://example.com",
    );

    await httpClient.request({
      method: "POST",
      path: "/auth/refresh",
      credentials: "include",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/auth/refresh",
      {
        method: "POST",
        headers: {},
        credentials: "include",
      },
    );
  });

  it("deve retornar o JSON da resposta", async () => {
    const user = {
      id: "user-123",
      name: "Jean",
      email: "jean@example.com",
    };

    const fetchMock = vi.fn(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => user,
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = new FetchHttpClient(
      "https://example.com",
    );

    const result = await httpClient.request<typeof user>({
      method: "GET",
      path: "/auth/me",
    });

    expect(result).toEqual(user);
  });

  it("deve lançar HttpError quando a resposta HTTP não for bem-sucedida", async () => {
    const fetchMock = vi.fn(async () => {
      return {
        ok: false,
        status: 401,
        json: async () => ({
          message: "Unauthorized",
        }),
      };
    });

    vi.stubGlobal("fetch", fetchMock);

    const httpClient = new FetchHttpClient(
      "https://example.com",
    );

    await expect(
      httpClient.request({
        method: "GET",
        path: "/auth/me",
      }),
    ).rejects.toBeInstanceOf(HttpError);

    await expect(
      httpClient.request({
        method: "GET",
        path: "/auth/me",
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: "HTTP request failed with status 401",
    });
  });
});
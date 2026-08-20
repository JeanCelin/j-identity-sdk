import { HttpError } from "../errors/http-error.js";
import type { HttpClient, HttpRequest } from "./http-client.js";

export class FetchHttpClient implements HttpClient {
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async request<T>(request: HttpRequest): Promise<T> {
    const url = `${this.apiUrl}${request.path}`;

    const headers = {
      ...request.headers,
    };

    const options: RequestInit = {
      method: request.method ?? "GET",
      headers,
    };

    if (request.body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(request.body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new HttpError(
        response.status,
        `HTTP request failed with status ${response.status}`,
      );
    }

    return response.json() as Promise<T>;
  }
}

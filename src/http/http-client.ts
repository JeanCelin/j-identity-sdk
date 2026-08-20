export type HttpRequest = {
  method?: "GET" | "POST";
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<T>;
}
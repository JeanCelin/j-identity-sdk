import { AuthClient } from "./auth-client.js";
import { ServerAdapter } from "./adapters/server-adapter.js";
import { FetchHttpClient } from "./http/fetch-http-client.js";
import type { AuthClientConfig } from "./types/auth.js";

export function createAuthClient(config: AuthClientConfig) {
  const httpClient = new FetchHttpClient(config.apiUrl);

  const adapter = new ServerAdapter(
    httpClient,
    config.clientId,
    config.clientSecret,
  );

  return new AuthClient(adapter);
}
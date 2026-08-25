import { AuthClient } from "./auth-client.js";
import { FetchHttpClient } from "./http/fetch-http-client.js";
import { WebAdapter } from "./adapters/web-adapter.js";
import type { AuthClientConfig } from "./types/auth.js";

export function createAuthClient(config: AuthClientConfig) {
  const httpClient = new FetchHttpClient(config.apiUrl);

  let adapter;

  if (config.platform === "web") {
    adapter = new WebAdapter(httpClient);
  } else {
    throw new Error("Mobile platform is not implemented yet");
  }

  return new AuthClient(config, adapter, httpClient);
}

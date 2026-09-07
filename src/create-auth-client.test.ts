import { describe, expect, it } from "vitest";

import { createAuthClient } from "./create-auth-client.js";
import { AuthClient } from "./auth-client.js";

describe("createAuthClient", () => {
  it("deve criar um AuthClient", () => {
    const auth = createAuthClient({
      apiUrl: "https://example.com",
      clientId: "client-id-123",
      clientSecret: "client-secret-123",
    });

    expect(auth).toBeInstanceOf(AuthClient);
  });
});
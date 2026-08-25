import { describe, expect, it } from "vitest";
import { createAuthClient } from "./create-auth-client.js";
import { AuthClient } from "./auth-client.js";

describe("createAuthClient", () => {
  it("deve criar um AuthClient para a plataforma web", () => {
    const auth = createAuthClient({
      apiUrl: "https://example.com",
      platform: "web",
    });
    expect(auth).toBeInstanceOf(AuthClient);
  });

  it("deve rejeitar a plataforma mobile enquanto o adapter não estiver implementado", () => {
    expect(() => {
      createAuthClient({
        apiUrl: "https://example.com",
        platform: "mobile",
      });
    }).toThrow("Mobile platform is not implemented yet");
  });
});

export type AuthPlatform = "web" | "mobile";

export type AuthClientConfig = {
  apiUrl: string;
  platform: AuthPlatform;
};

export type AuthResult = {
  accessToken: string;
};

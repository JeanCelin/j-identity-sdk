export type AuthPlatform = "web" | "mobile";

export type AuthClientConfig = {
  apiUrl: string;
  platform: AuthPlatform;
};

export type AuthResult = {
  accessToken: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};
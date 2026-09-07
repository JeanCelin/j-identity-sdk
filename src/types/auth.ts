export type AuthClientConfig = {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};
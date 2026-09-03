import type { User } from "./user.js";

export interface AuthSession {
  authenticated: boolean;
  user: User | null;
}
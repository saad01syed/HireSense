import client from "./client";
import { AuthResponse } from "../types";

export const signup = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await client.post("/auth/signup", { username, email, password });
  return res.data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await client.post("/auth/login", { email, password });
  return res.data;
};

export const logout = async (token: string): Promise<void> => {
  await client.post("/auth/logout", null, { params: { token } });
};

// signup(name, email, password)  → POST /auth/signup  → store JWT
// login(email, password)         → POST /auth/login   → store JWT
// updateUser(fields)             → PATCH /auth/user
// getMe()                        → GET  /auth/me

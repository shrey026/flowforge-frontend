import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthUserResponse {
  status: "success";
  message?: string;
  data: {
    user: AuthUser;
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const response = await apiClient.post<AuthUserResponse>(
    "/auth/register",
    payload
  );

  return response.data.data.user;
}

export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const response = await apiClient.post<AuthUserResponse>(
    "/auth/login",
    payload
  );

  return response.data.data.user;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUserResponse>("/auth/me");

  return response.data.data.user;
}

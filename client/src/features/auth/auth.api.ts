import { apiRequest } from "@/services/api";

import type { AuthResponse, CurrentUserResponse } from "@/types/auth";
import type { LoginFormData, RegisterFormData } from "./auth.schemas";

export function loginUser(data: LoginFormData): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function registerUser(data: RegisterFormData): Promise<AuthResponse> {
  const { confirmPassword: _confirmPassword, ...registrationData } = data;

  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(registrationData),
  });
}

export function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>("/auth/me");
}

export function logoutUser(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

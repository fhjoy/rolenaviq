export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isDemo?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface CurrentUserResponse {
  user: User;
}

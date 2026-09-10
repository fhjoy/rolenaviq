export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface CurrentUserResponse {
  user: User;
}

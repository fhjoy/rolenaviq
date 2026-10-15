export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isDemo?: boolean;
  googleLinked?: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  verificationRequired?: boolean;
}

export interface CurrentUserResponse {
  user: User;
}

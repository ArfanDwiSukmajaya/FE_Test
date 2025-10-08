import { UserEntity } from '../entities/User';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  code: number;
  is_logged_in: number;
  token: string;
}

export interface UserRepository {
  login(credentials: LoginCredentials): Promise<UserEntity>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserEntity | null>;
  isAuthenticated(): Promise<boolean>;
}

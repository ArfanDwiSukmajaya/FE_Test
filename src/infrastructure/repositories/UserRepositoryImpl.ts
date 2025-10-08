// infrastructure/repositories/UserRepositoryImpl.ts
import { UserEntity } from '../../domain/entities/User';
import { UserRepository, LoginCredentials, LoginResponse } from '../../domain/repositories/UserRepository';
import { ApiClient } from '../api/ApiClient';

export class UserRepositoryImpl implements UserRepository {
  constructor(private apiClient: ApiClient) { }

  async login(credentials: LoginCredentials): Promise<UserEntity> {
    try {
      const response = await this.apiClient.post('/auth/login', credentials);
      const data = response.data as LoginResponse;

      if (!data.status || data.is_logged_in !== 1) {
        throw new Error(data.message || 'Login failed');
      }

      const user = UserEntity.fromApiResponse({
        id: 1, // Assuming user ID from response
        username: credentials.username,
        token: data.token,
        is_logged_in: data.is_logged_in
      });

      // Store in localStorage
      this.storeUserData(user);

      return user;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');
    } catch (error) {
      throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const isLoggedIn = localStorage.getItem('isLoggedIn');

      if (!token || !username || isLoggedIn !== 'true') {
        return null;
      }

      return UserEntity.fromApiResponse({
        id: 1, // Assuming user ID
        username,
        token,
        is_logged_in: 1
      });
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.isAuthenticated() ?? false;
    } catch (error) {
      console.error('Failed to check authentication:', error);
      return false;
    }
  }

  private storeUserData(user: UserEntity): void {
    const userData = user.toStorageData();
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('isLoggedIn', userData.isLoggedIn.toString());
  }
}

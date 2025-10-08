// application/use-cases/AuthUseCase.ts
import { UserEntity } from '../../domain/entities/User';
import { UserRepository, LoginCredentials } from '../../domain/repositories/UserRepository';
import { ErrorHandler } from '../../shared/utils/ErrorHandler';
import { ValidationUtils } from '../../shared/utils/ValidationUtils';

export interface AuthUseCaseResult {
  success: boolean;
  user?: UserEntity;
  error?: string;
}

export class AuthUseCase {
  constructor(private userRepository: UserRepository) { }

  async login(credentials: LoginCredentials): Promise<AuthUseCaseResult> {
    try {
      // Validate credentials
      const validationErrors = this.validateCredentials(credentials);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors.join(', ')
        };
      }

      // Sanitize input
      const sanitizedCredentials = {
        username: ValidationUtils.sanitizeString(credentials.username),
        password: credentials.password // Don't sanitize password
      };

      // Attempt login
      const user = await this.userRepository.login(sanitizedCredentials);

      return {
        success: true,
        user
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async logout(): Promise<AuthUseCaseResult> {
    try {
      await this.userRepository.logout();

      return {
        success: true
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async getCurrentUser(): Promise<AuthUseCaseResult> {
    try {
      const user = await this.userRepository.getCurrentUser();

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);

      return {
        success: false,
        error: ErrorHandler.getUserFriendlyMessage(appError)
      };
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      return await this.userRepository.isAuthenticated();
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      ErrorHandler.logError(appError);
      return false;
    }
  }

  private validateCredentials(credentials: LoginCredentials): string[] {
    const errors: string[] = [];

    if (!credentials.username || credentials.username.trim().length === 0) {
      errors.push('Username tidak boleh kosong');
    }

    if (!credentials.password || credentials.password.trim().length === 0) {
      errors.push('Password tidak boleh kosong');
    }

    if (credentials.password && credentials.password.length < 6) {
      errors.push('Password minimal 6 karakter');
    }

    if (credentials.username && credentials.username.length < 3) {
      errors.push('Username minimal 3 karakter');
    }

    return errors;
  }
}

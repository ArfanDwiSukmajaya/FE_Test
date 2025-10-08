import { useState, useEffect, useCallback } from 'react';
import { UserEntity } from '../../domain/entities/User';
import { DIContainer } from '../../shared/container/DIContainer';
import { ErrorHandler } from '../../shared/utils/ErrorHandler';

export interface UseAuthReturn {
  user: UserEntity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authUseCase = DIContainer.getInstance().getAuthUseCase();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authUseCase.login({ username, password });

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      const userEntity = result.user!;
      setUser(userEntity);
      setIsAuthenticated(true);
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
    } finally {
      setIsLoading(false);
    }
  }, [authUseCase]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authUseCase.logout();

      if (!result.success) {
        throw new Error(result.error || 'Logout failed');
      }
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const appError = ErrorHandler.handleApiError(err);
      ErrorHandler.logError(appError);
      setError(ErrorHandler.getUserFriendlyMessage(appError));
    } finally {
      setIsLoading(false);
    }
  }, [authUseCase]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const result = await authUseCase.getCurrentUser();

        if (result.success && result.user) {
          const currentUser = result.user;

          if (currentUser && currentUser.isAuthenticated()) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        const appError = ErrorHandler.handleApiError(err);
        ErrorHandler.logError(appError);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [authUseCase]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError
  };
}

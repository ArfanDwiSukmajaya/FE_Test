export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

export class ErrorHandler {
  static createError(code: string, message: string, details?: unknown): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date()
    };
  }

  static handleApiError(error: unknown): AppError {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { status?: number; data?: { message?: string } } }).response;
      const status = response?.status;
      const message = response?.data?.message;

      // Handle specific HTTP status codes
      if (status === 401) {
        return this.createError(
          'AUTH_ERROR',
          'Username atau password salah',
          {
            status,
            data: response?.data
          }
        );
      } else if (status === 403) {
        return this.createError(
          'AUTH_ERROR',
          'Akses ditolak. Anda tidak memiliki izin untuk mengakses sistem ini.',
          {
            status,
            data: response?.data
          }
        );
      } else if (status === 404) {
        return this.createError(
          'API_ERROR',
          'Endpoint tidak ditemukan. Silakan hubungi administrator.',
          {
            status,
            data: response?.data
          }
        );
      } else if (status && status >= 500) {
        return this.createError(
          'API_ERROR',
          'Server sedang bermasalah. Silakan coba lagi nanti.',
          {
            status,
            data: response?.data
          }
        );
      }

      return this.createError(
        'API_ERROR',
        message || 'Server error occurred',
        {
          status,
          data: response?.data
        }
      );
    } else if (error && typeof error === 'object' && 'request' in error) {
      return this.createError(
        'NETWORK_ERROR',
        'Network error - please check your connection',
        { originalError: (error as { message?: string }).message }
      );
    } else {
      return this.createError(
        'UNKNOWN_ERROR',
        (error as { message?: string }).message || 'An unknown error occurred',
        { originalError: error }
      );
    }
  }

  static handleValidationError(errors: string[]): AppError {
    return this.createError(
      'VALIDATION_ERROR',
      'Validation failed',
      { errors }
    );
  }

  static handleAuthError(message: string): AppError {
    return this.createError(
      'AUTH_ERROR',
      message,
      { timestamp: new Date() }
    );
  }

  static logError(error: AppError): void {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.log('Application Error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp
      });
    }
  }

  static getUserFriendlyMessage(error: AppError): string {
    // Return the specific message from the error if available
    if (error.message && error.message !== 'An unknown error occurred') {
      return error.message;
    }

    switch (error.code) {
      case 'API_ERROR':
        return 'Terjadi kesalahan pada server. Silakan coba lagi.';
      case 'NETWORK_ERROR':
        return 'Koneksi internet bermasalah. Periksa koneksi Anda.';
      case 'VALIDATION_ERROR':
        return (error.details as { errors?: string[] })?.errors?.join(', ') || 'Data yang dimasukkan tidak valid.';
      case 'AUTH_ERROR':
        return 'Username atau password salah. Silakan periksa kembali.';
      default:
        return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
    }
  }
}

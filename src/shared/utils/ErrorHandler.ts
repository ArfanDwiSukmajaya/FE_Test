// shared/utils/ErrorHandler.ts
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
      // Server responded with error status
      return this.createError(
        'API_ERROR',
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Server error occurred',
        {
          status: (error as { response?: { status?: number } }).response?.status,
          data: (error as { response?: { data?: unknown } }).response?.data
        }
      );
    } else if (error && typeof error === 'object' && 'request' in error) {
      // Request was made but no response received
      return this.createError(
        'NETWORK_ERROR',
        'Network error - please check your connection',
        { originalError: (error as { message?: string }).message }
      );
    } else {
      // Something else happened
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
    console.error('Application Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp
    });
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'API_ERROR':
        return 'Terjadi kesalahan pada server. Silakan coba lagi.';
      case 'NETWORK_ERROR':
        return 'Koneksi internet bermasalah. Periksa koneksi Anda.';
      case 'VALIDATION_ERROR':
        return (error.details as { errors?: string[] })?.errors?.join(', ') || 'Data yang dimasukkan tidak valid.';
      case 'AUTH_ERROR':
        return 'Sesi Anda telah berakhir. Silakan login kembali.';
      default:
        return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
    }
  }
}

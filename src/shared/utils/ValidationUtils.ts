// shared/utils/ValidationUtils.ts
export class ValidationUtils {
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password minimal 6 karakter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password harus mengandung huruf kapital');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password harus mengandung angka');
    }

    return errors;
  }

  static validateRequired(value: unknown, fieldName: string): string[] {
    const errors: string[] = [];

    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      errors.push(`${fieldName} tidak boleh kosong`);
    }

    return errors;
  }

  static validateNumber(value: unknown, fieldName: string, min?: number, max?: number): string[] {
    const errors: string[] = [];

    if (isNaN(Number(value)) || value === null || value === undefined) {
      errors.push(`${fieldName} harus berupa angka`);
      return errors;
    }

    const numValue = Number(value);

    if (min !== undefined && numValue < min) {
      errors.push(`${fieldName} minimal ${min}`);
    }

    if (max !== undefined && numValue > max) {
      errors.push(`${fieldName} maksimal ${max}`);
    }

    return errors;
  }

  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  static validateDate(dateString: string): string[] {
    const errors: string[] = [];

    if (!dateString) {
      errors.push('Tanggal tidak boleh kosong');
      return errors;
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      errors.push('Format tanggal tidak valid');
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      errors.push('Tanggal tidak boleh lebih dari hari ini');
    }

    return errors;
  }
}

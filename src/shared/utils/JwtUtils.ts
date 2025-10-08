export interface JwtPayload {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

export class JwtUtils {
  static decodeToken(token: string): JwtPayload | null {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode base64 payload
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }


  static isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
    const payload = this.decodeToken(token);
    if (!payload) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = payload.exp;
    const timeUntilExpiration = expirationTime - currentTime;
    const minutesUntilExpiration = timeUntilExpiration / 60;

    return minutesUntilExpiration <= minutesThreshold;
  }


  static getTimeUntilExpiration(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = payload.exp - currentTime;
    return Math.max(0, timeUntilExpiration / 60);
  }

  static formatTimeUntilExpiration(token: string): string {
    const minutes = this.getTimeUntilExpiration(token);

    if (minutes <= 0) {
      return 'Expired';
    }

    if (minutes < 60) {
      return `${Math.floor(minutes)} menit`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);

    if (remainingMinutes === 0) {
      return `${hours} jam`;
    }

    return `${hours} jam ${remainingMinutes} menit`;
  }
}

export interface User {
  readonly id: number;
  readonly username: string;
  readonly token: string;
  readonly isLoggedIn: boolean;
}

export class UserEntity implements User {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly token: string,
    public readonly isLoggedIn: boolean = true
  ) { }

  static create(id: number, username: string, token: string): UserEntity {
    return new UserEntity(id, username, token, true);
  }

  static fromApiResponse(data: {
    id: number;
    username: string;
    token: string;
    is_logged_in: number;
  }): UserEntity {
    return new UserEntity(
      data.id,
      data.username,
      data.token,
      data.is_logged_in === 1
    );
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn && !!this.token;
  }

  toStorageData() {
    return {
      id: this.id,
      username: this.username,
      token: this.token,
      isLoggedIn: this.isLoggedIn
    };
  }
}

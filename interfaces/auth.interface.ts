export interface SignInData {
    email: string;
    password: string;
  }

export interface TokenPayload {
    id: number;
    roles: { id: string; name: string }[];
  }
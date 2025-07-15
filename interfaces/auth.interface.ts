export interface SignInData {
    email: string;
    password: string;
  }

export interface TokenPayload {
    id: number;
    email: string;
    roles: { id: string; name: string }[];
  }
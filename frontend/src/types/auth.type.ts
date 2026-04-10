export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
};

export type LoginResponse = {
  message: string;
  accessToken: string;
  user: AuthUser;
};

export interface LoginResponse {
  accessToken: string;
  role: 'user' | 'admin';
  timezone: string;
  email: string;
}

import { jwtDecode } from 'jwt-decode';

export function decodeToken<T = any>(token: string): T | null {
  try {
    return jwtDecode<T>(token);
  } catch (e) {
    return null;
  }
}

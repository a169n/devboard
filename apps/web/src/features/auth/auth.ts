import { api } from '../../api/client';
import type { User } from '../../types/models';

export async function register(input: { name: string; email: string; password: string }) {
  const { data } = await api.post('/auth/register', input);
  return data.data as { user: User; token: string };
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post('/auth/login', input);
  return data.data as { user: User; token: string };
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data.data as User;
}

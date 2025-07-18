import { cookies } from 'next/headers';

export async function getAuthToken() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) throw new Error('Unauthorized');
  return token;
}

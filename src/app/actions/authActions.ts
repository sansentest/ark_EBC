'use server';

import { deleteSession, createSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function loginAction(username: string, password: string) {
  const validAdminUsername = process.env.ADMIN_USERNAME || 'admin';
  const validAdminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Using 'admin123' based on user's terminal log

  if (username === validAdminUsername && password === validAdminPassword) {
    await createSession(1, 'ADMIN', 'Admin');
    return { success: true };
  }

  return { success: false, error: 'Invalid credentials' };
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}

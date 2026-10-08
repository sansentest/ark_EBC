'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';

export async function updatePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as number }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedNewPassword }
    });

    return { success: true, message: 'Password updated successfully' };
  } catch (error: any) {
    console.error('Password update error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}

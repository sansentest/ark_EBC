'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { revalidatePath, updateTag } from 'next/cache';

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

export async function deleteAllDataAction() {
  try {
    const session = await getSession();
    // Assuming role 'ADMIN' can do this
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized. Only Admins can delete all data.' };
    }

    // Delete child records first if not using cascade deletes
    await prisma.loginLog.deleteMany({});
    
    // Delete students
    await prisma.student.deleteMany({});

    // Clear cache so frontend reflects empty DB
    revalidatePath('/ark_admin');
    revalidatePath('/ark_admin/students');
    revalidatePath('/student');
    updateTag('students');

    return { success: true, message: 'All student data and login logs have been permanently deleted.' };
  } catch (error: any) {
    console.error('Delete all data error:', error);
    return { success: false, error: 'Failed to delete data.' };
  }
}

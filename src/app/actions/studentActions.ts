'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { decrypt } from '@/lib/crypto';

export async function deleteStudentAction(id: number) {
  try {
    // Delete any related LoginLog first if they exist (foreign key constraint)
    await prisma.loginLog.deleteMany({
      where: { student_id: id }
    });

    await prisma.student.delete({
      where: { id }
    });
    
    revalidatePath('/admin/students');
    revalidatePath('/admin/teachers');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}

export async function deleteBulkStudentsAction(ids: number[]) {
  try {
    // Delete any related LoginLog first if they exist
    await prisma.loginLog.deleteMany({
      where: { student_id: { in: ids } }
    });

    await prisma.student.deleteMany({
      where: { id: { in: ids } }
    });
    
    revalidatePath('/admin/students');
    revalidatePath('/admin/teachers');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Bulk delete error:', error);
    return { success: false, error: 'បរាជ័យក្នុងការលុបទិន្នន័យជាក្រុម (Failed to bulk delete)' };
  }
}

export async function updateStudentAction(id: number, data: { name: string, class_name: string, username: string }) {
  try {
    await prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        class_name: data.class_name,
        username: data.username
      }
    });
    
    revalidatePath('/admin/students');
    revalidatePath('/admin/teachers');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: 'Failed to update account' };
  }
}

import { unstable_cache, revalidateTag } from 'next/cache';

const getCachedClasses = unstable_cache(
  async () => {
    const students = await prisma.student.findMany({
      select: { class_name: true },
      distinct: ['class_name'],
      orderBy: { class_name: 'asc' }
    });
    return students.map(s => s.class_name);
  },
  ['distinct-classes'],
  { tags: ['students'], revalidate: 3600 }
);

export async function getDistinctClasses() {
  try {
    const classes = await getCachedClasses();
    return { success: true, classes };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error: 'Failed to fetch classes' };
  }
}

const getCachedStudents = unstable_cache(
  async (className: string) => {
    return await prisma.student.findMany({
      where: { class_name: className },
      select: { id: true, name: true, student_id: true, status: true },
      orderBy: { name: 'asc' }
    });
  },
  ['students-by-class'],
  { tags: ['students'], revalidate: 3600 }
);

export async function getStudentsByClass(className: string) {
  try {
    const students = await getCachedStudents(className);
    return { success: true, students };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { success: false, error: 'Failed to fetch students' };
  }
}

export async function getStudentCredentials(studentId: number) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { username: true, credential_reference: true }
    });
    
    if (!student) return { success: false, error: 'រកមិនឃើញសិស្សនេះទេ' };
    
    const password = decrypt(student.credential_reference);
    
    await prisma.loginLog.create({
      data: {
        student_id: studentId,
        status: 'MOBILE_LOGIN_REQUEST',
      }
    });

    return { success: true, username: student.username, password };
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return { success: false, error: 'បរាជ័យក្នុងការទាញយកគណនី' };
  }
}

export async function markStudentLoginSuccess(studentId: number) {
  try {
    await prisma.student.update({
      where: { id: studentId },
      data: { status: 'SUCCESS' }
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking login success:', error);
    return { success: false };
  }
}

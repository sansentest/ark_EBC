'use server';

import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';

export interface ImportStudentDTO {
  studentId: string;
  name: string;
  className: string;
  role: string;
  username: string;
  passwordRaw: string;
}

export async function importStudentsAction(students: ImportStudentDTO[]) {
  try {
    // We should process in batches or all at once depending on size
    const createdCount = { count: 0 };
    const skipped = [];
    
    for (const student of students) {
      // Basic validation
      if (!student.studentId || !student.username || !student.passwordRaw) {
        skipped.push({ id: student.studentId, reason: 'Missing required fields' });
        continue;
      }

      // Check for duplicate username or studentId
      const existing = await prisma.student.findFirst({
        where: {
          OR: [
            { student_id: String(student.studentId) },
            { username: String(student.username) }
          ]
        }
      });

      if (existing) {
        skipped.push({ id: student.studentId, reason: 'Duplicate Student ID or Username' });
        continue;
      }

      // Encrypt password
      const encryptedPassword = encrypt(String(student.passwordRaw));

      // Save to database
      await prisma.student.create({
        data: {
          student_id: String(student.studentId),
          name: String(student.name),
          class_name: String(student.className),
          role: String(student.role),
          username: String(student.username),
          credential_reference: encryptedPassword,
          status: 'NOT STARTED'
        }
      });
      
      createdCount.count++;
    }

    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/teachers');
    revalidatePath('/student');

    return { 
      success: true, 
      imported: createdCount.count,
      skipped: skipped.length,
      skippedDetails: skipped
    };

  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: 'Failed to import students' };
  }
}

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
    const skipped = [];
    const validStudents = [];
    
    // 1. Initial Validation
    for (const student of students) {
      if (!student.studentId || !student.username || !student.passwordRaw) {
        skipped.push({ id: student.studentId || 'unknown', reason: 'Missing required fields' });
      } else {
        validStudents.push(student);
      }
    }

    if (validStudents.length === 0) {
      return { success: true, imported: 0, skipped: skipped.length, skippedDetails: skipped };
    }

    // 2. Fetch all existing duplicates in ONE query
    const studentIds = validStudents.map(s => String(s.studentId));
    const usernames = validStudents.map(s => String(s.username));

    const existingStudents = await prisma.student.findMany({
      where: {
        OR: [
          { student_id: { in: studentIds } },
          { username: { in: usernames } }
        ]
      },
      select: { student_id: true, username: true }
    });

    const existingIdSet = new Set(existingStudents.map(s => s.student_id));
    const existingUsernameSet = new Set(existingStudents.map(s => s.username));

    // 3. Filter out duplicates and prepare for bulk insert
    const dataToInsert = [];
    
    // Track uniqueness within the current batch to prevent duplicate errors in createMany
    const currentBatchIds = new Set();
    const currentBatchUsernames = new Set();

    for (const student of validStudents) {
      const sId = String(student.studentId);
      const uName = String(student.username);

      if (existingIdSet.has(sId) || existingUsernameSet.has(uName) || currentBatchIds.has(sId) || currentBatchUsernames.has(uName)) {
        skipped.push({ id: sId, reason: 'Duplicate Student ID or Username' });
      } else {
        currentBatchIds.add(sId);
        currentBatchUsernames.add(uName);
        
        dataToInsert.push({
          student_id: sId,
          name: String(student.name),
          class_name: String(student.className),
          role: String(student.role),
          username: uName,
          credential_reference: encrypt(String(student.passwordRaw)),
          status: 'NOT STARTED'
        });
      }
    }

    // 4. Bulk Insert in ONE query
    let importedCount = 0;
    if (dataToInsert.length > 0) {
      const result = await prisma.student.createMany({
        data: dataToInsert,
        skipDuplicates: true // Extra safety layer
      });
      importedCount = result.count;
    }

    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/admin/teachers');
    revalidatePath('/student');

    return { 
      success: true, 
      imported: importedCount,
      skipped: skipped.length,
      skippedDetails: skipped
    };

  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: 'Failed to import students' };
  }
}

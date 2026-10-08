'use server';

import { prisma } from '@/lib/prisma';

export async function exportStudentDataCSV() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { class_name: 'asc' }
    });

    const header = ['ID,Student ID,Name,Class,Role,Username,Status\n'];
    const rows = students.map(s => {
      // Escape commas in names
      const name = `"${s.name.replace(/"/g, '""')}"`;
      return `${s.id},${s.student_id},${name},${s.class_name},${s.role},${s.username},${s.status}`;
    });

    return { success: true, data: header.concat(rows).join('\n') };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: 'Failed to generate CSV' };
  }
}

export async function exportLoginAnalyticsCSV() {
  try {
    const logs = await prisma.loginLog.findMany({
      include: {
        student: true
      },
      orderBy: { started_at: 'desc' }
    });

    const header = ['Log ID,Student ID,Name,Class,Status,Login Time,Message\n'];
    const rows = logs.map(l => {
      const name = l.student ? `"${l.student.name.replace(/"/g, '""')}"` : 'Unknown';
      const className = l.student ? l.student.class_name : 'Unknown';
      const studentId = l.student ? l.student.student_id : 'Unknown';
      const message = l.error_message ? `"${l.error_message.replace(/"/g, '""')}"` : '';
      
      return `${l.id},${studentId},${name},${className},${l.status},${l.started_at.toISOString()},${message}`;
    });

    return { success: true, data: header.concat(rows).join('\n') };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: 'Failed to generate CSV' };
  }
}

export async function exportCustomReportCSV(filters: { role: string; status: string }) {
  try {
    const where: any = {};
    if (filters.role !== 'ALL') where.role = filters.role;
    if (filters.status !== 'ALL') where.status = filters.status;

    const students = await prisma.student.findMany({
      where,
      orderBy: { class_name: 'asc' }
    });

    const header = ['ID,Student ID,Name,Class,Role,Username,Status\n'];
    const rows = students.map(s => {
      const name = `"${s.name.replace(/"/g, '""')}"`;
      return `${s.id},${s.student_id},${name},${s.class_name},${s.role},${s.username},${s.status}`;
    });

    return { success: true, data: header.concat(rows).join('\n') };
  } catch (error) {
    console.error('Export custom error:', error);
    return { success: false, error: 'Failed to generate custom CSV' };
  }
}

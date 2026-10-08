import { prisma } from '@/lib/prisma';
import StudentTable from './StudentTable';

export const instant = false;

export default async function StudentsPage() {
  // Fetch students from the database
  const students = await prisma.student.findMany({
    where: { role: 'STUDENT' },
    orderBy: {
      created_at: 'desc'
    }
  });

  // Map to simple plain object for client component serialization
  const mappedStudents = students.map(student => ({
    id: student.id,
    student_id: student.student_id,
    name: student.name,
    class_name: student.class_name,
    role: student.role,
    username: student.username,
    status: student.status
  }));

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          Student Management
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Manage all student accounts, monitor login status, and initiate browser automation.</p>
      </div>

      {/* Main Table Component */}
      <StudentTable initialStudents={mappedStudents} />
    </div>
  );
}

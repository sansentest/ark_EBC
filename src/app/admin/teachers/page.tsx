import { prisma } from '@/lib/prisma';
import StudentTable from '../students/StudentTable';

export const instant = false;

export default async function TeachersPage() {
  // Fetch teachers from the database
  const teachers = await prisma.student.findMany({
    where: { role: 'TEACHER' },
    orderBy: {
      created_at: 'desc'
    }
  });

  // Map to simple plain object for client component serialization
  const mappedTeachers = teachers.map(teacher => ({
    id: teacher.id,
    student_id: teacher.student_id,
    name: teacher.name,
    class_name: teacher.class_name,
    role: teacher.role,
    username: teacher.username,
    status: teacher.status
  }));

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          Teacher Management
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Manage all teacher accounts, monitor login status, and initiate browser automation.</p>
      </div>

      {/* Main Table Component */}
      <StudentTable initialStudents={mappedTeachers} />
    </div>
  );
}

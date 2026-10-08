import { prisma } from '@/lib/prisma';
import AutoPrint from './AutoPrint';

export const instant = false;
export default async function PrintReportPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string }>;
}) {
  const params = await searchParams;
  const role = params?.role || 'ALL';
  const status = params?.status || 'ALL';

  const where: any = {};
  if (role !== 'ALL') where.role = role;
  if (status !== 'ALL') where.status = status;

  const students = await prisma.student.findMany({
    where,
    orderBy: { class_name: 'asc' }
  });

  return (
    <div className="p-8 bg-white text-black min-h-screen">
      <AutoPrint />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Custom System Report</h1>
          <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
          <div className="flex justify-center gap-4 mt-2 text-sm font-medium">
            <span className="bg-gray-100 px-3 py-1 rounded">Role: {role}</span>
            <span className="bg-gray-100 px-3 py-1 rounded">Status: {status}</span>
            <span className="bg-gray-100 px-3 py-1 rounded">Total: {students.length}</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Class</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2">{s.student_id}</td>
                <td className="border border-gray-300 px-4 py-2 font-medium">{s.name}</td>
                <td className="border border-gray-300 px-4 py-2">{s.class_name}</td>
                <td className="border border-gray-300 px-4 py-2">{s.role}</td>
                <td className="border border-gray-300 px-4 py-2">{s.username}</td>
                <td className="border border-gray-300 px-4 py-2">{s.status}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No records found matching these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

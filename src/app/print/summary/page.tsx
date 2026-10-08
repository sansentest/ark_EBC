import { prisma } from '@/lib/prisma';
import AutoPrint from '../report/AutoPrint';
import { connection } from 'next/server';
import { Suspense } from 'react';

export const instant = false;

async function SummaryData() {
  await connection();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const logs = await prisma.loginLog.findMany({
    where: {
      started_at: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      }
    },
    include: {
      student: true
    },
    orderBy: { started_at: 'desc' }
  });

  const totalLogins = logs.length;
  const successfulLogins = logs.filter(l => l.status === 'SUCCESS').length;
  const failedLogins = logs.filter(l => l.status === 'FAILED').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold mb-2">Monthly Login Summary</h1>
        <p className="text-gray-600">
          {firstDayOfMonth.toLocaleDateString()} - {lastDayOfMonth.toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10 text-center">
        <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Attempts</h3>
          <p className="text-3xl font-bold text-blue-600">{totalLogins}</p>
        </div>
        <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Successful</h3>
          <p className="text-3xl font-bold text-emerald-600">{successfulLogins}</p>
        </div>
        <div className="border border-gray-200 p-6 rounded-2xl bg-gray-50">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Failed</h3>
          <p className="text-3xl font-bold text-red-600">{failedLogins}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4 border-b pb-2">Recent Activities this Month</h3>
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Date & Time</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Student</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Class</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.slice(0, 50).map((l, idx) => (
            <tr key={l.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-4 py-2">{l.started_at.toLocaleString()}</td>
              <td className="border border-gray-300 px-4 py-2 font-medium">{l.student?.name || 'Unknown'}</td>
              <td className="border border-gray-300 px-4 py-2">{l.student?.class_name || 'N/A'}</td>
              <td className="border border-gray-300 px-4 py-2">
                <span className={l.status === 'SUCCESS' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                  {l.status}
                </span>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">No login activities recorded this month.</td>
            </tr>
          )}
        </tbody>
      </table>
      {logs.length > 50 && (
        <p className="text-center text-xs text-gray-400 mt-4">* Only showing the 50 most recent records.</p>
      )}
    </div>
  );
}

export default function PrintSummaryPage() {
  return (
    <div className="p-8 bg-white text-black min-h-screen">
      <AutoPrint />
      <Suspense fallback={<div className="text-center p-20 text-gray-500">Loading summary data...</div>}>
        <SummaryData />
      </Suspense>
    </div>
  );
}

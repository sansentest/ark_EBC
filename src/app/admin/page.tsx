import { prisma } from '@/lib/prisma';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserMinus,
  Search,
  MoreVertical,
  Play
} from "lucide-react";
import Link from 'next/link';
import RecentLoginsTable from './RecentLoginsTable';
import DashboardChart from './DashboardChart';

export const instant = false;

export default async function AdminDashboard() {
  // Fetch real statistics from Prisma
  const totalStudents = await prisma.student.count();
  const successCount = await prisma.student.count({ where: { status: 'SUCCESS' } });
  const failedCount = await prisma.student.count({ where: { status: 'FAILED' } });
  const notStartedCount = await prisma.student.count({ where: { status: 'NOT STARTED' } });

  const stats = [
    { label: "Total Accounts", value: totalStudents.toString(), icon: Users, color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Logged In", value: successCount.toString(), icon: UserCheck, color: "from-emerald-400 to-green-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Failed", value: failedCount.toString(), icon: UserX, color: "from-red-500 to-rose-600", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Not Started", value: notStartedCount.toString(), icon: UserMinus, color: "from-slate-400 to-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  ];

  // Fetch recent students
  const recentStudents = await prisma.student.findMany({
    take: 5,
    orderBy: { updated_at: 'desc' },
  });

  // Calculate chart data (Group students by class and status)
  const studentsByClass = await prisma.student.groupBy({
    by: ['class_name'],
    _count: {
      _all: true,
    },
  });

  const classNames = studentsByClass.map(c => c.class_name).filter(Boolean);
  const studentsWithStatus = await prisma.student.findMany({
    where: { class_name: { in: classNames } },
    select: { class_name: true, status: true }
  });

  const chartData = classNames.map(cls => {
    const classStudents = studentsWithStatus.filter(s => s.class_name === cls);
    return {
      name: cls,
      success: classStudents.filter(s => s.status === 'SUCCESS').length,
      failed: classStudents.filter(s => s.status === 'FAILED').length,
      notStarted: classStudents.filter(s => s.status === 'NOT STARTED').length,
    }
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "SUCCESS": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "FAILED": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "LOGIN STARTED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          Welcome back, Admin
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Here is what's happening with the EBC login sessions today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-white/80 dark:bg-[#11131a]/80 backdrop-blur-xl p-6 transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 group cursor-pointer shadow-sm`}>
            {/* Top right gradient blob */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 dark:opacity-20 blur-2xl group-hover:opacity-20 dark:group-hover:opacity-40 transition-opacity`} />
            
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">{stat.label}</p>
                <h3 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} shadow-inner`}>
                <stat.icon size={24} className={`text-transparent bg-clip-text bg-gradient-to-br ${stat.color} drop-shadow-sm`} style={{ stroke: 'url(#gradient)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      {chartData.length > 0 && (
        <DashboardChart data={chartData} />
      )}

      {/* Recent Students Table Section */}
      <RecentLoginsTable recentStudents={recentStudents} />
      
      {/* SVG Definitions for Icon Gradients */}
      <svg width="0" height="0">
        <linearGradient id="gradient" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop stopColor="currentColor" offset="0%" />
          <stop stopColor="currentColor" offset="100%" />
        </linearGradient>
      </svg>
    </div>
  );
}

'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

type ChartData = {
  name: string;
  success: number;
  failed: number;
  notStarted: number;
};

export default function DashboardChart({ data }: { data: ChartData[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#11131a]/60 backdrop-blur-xl overflow-hidden shadow-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Login Analytics by Class</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">View successful and failed logins across different classes.</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
              cursor={{ fill: '#334155', opacity: 0.4 }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="success" name="Success" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="notStarted" name="Not Started" fill="#64748b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

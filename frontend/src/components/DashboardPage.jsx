import { useState, useEffect } from 'react';
import { fetchAnalytics, fetchStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics(30).then(setData).catch(console.error);
    fetchStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="w-full py-8 flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-text">Progress &amp; Analytics</h2>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Tasks', value: stats.total },
            { label: 'Completed', value: stats.completed },
            { label: 'Active', value: stats.active },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center gap-1 hover:border-border2 hover:-translate-y-0.5 transition-all duration-200"
            >
              <h3 className="text-3xl font-extrabold text-accent">{value}</h3>
              <p className="text-sm text-text2">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-base font-semibold text-text mb-6">Tasks Completed (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <XAxis dataKey="_id" stroke="#4d6659" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} stroke="#4d6659" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#121a16', border: '1px solid rgba(46,61,50,0.8)', borderRadius: '8px', color: '#edf5f0' }}
              cursor={{ fill: 'rgba(231,76,60,0.05)' }}
            />
            <Bar dataKey="count" fill="#e74c3c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

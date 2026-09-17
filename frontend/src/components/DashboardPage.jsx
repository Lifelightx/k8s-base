import { useState, useEffect } from 'react';
import { fetchAnalytics, fetchStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics(30).then(setData).catch(console.error);
    fetchStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Progress & Analytics</h2>
      
      {stats && (
        <div className="stats-cards">
          <div className="card">
            <h3>{stats.total}</h3>
            <p>Total Tasks</p>
          </div>
          <div className="card">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
          <div className="card">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h3>Tasks Completed (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="_id" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

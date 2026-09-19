import React, { useEffect, useState } from 'react';
import api from '../services/api';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ShieldCheck, UserCheck, UserMinus, Trash2, ShieldAlert, Activity, Building2, Train, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsersAndLogs = async () => {
    try {
      const [userRes, logsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/analytics/dashboard') // Using recentActivity as logs
      ]);
      setUsers(userRes.data);
      setLogs(logsRes.data.recentActivity || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLogs();
  }, []);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/auth/users/${user.id}/status`, { status: nextStatus });
      fetchUsersAndLogs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this operational user account permanently?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      fetchUsersAndLogs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  if (loading) return           <div className="text-center py-20 font-bold text-slate-500 dark:text-slate-400">Loading users database...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 gradient-text">
          <ShieldCheck className="text-blue-500" />
          <span>Operational Control Center</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Administrator panel to audit team access rights, active/inactive staff roles, and delete user profiles.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/stations">
          <GlassmorphicCard className="flex items-center gap-4 hover:scale-105 transition-transform" gradient="emerald" glow>
            <div className="p-3 bg-emerald-500/20 text-emerald-500 rounded-xl"><Building2 size={24} /></div>
            <div><h3 className="font-bold">Manage Stations</h3><p className="text-xs text-slate-500">Add/Remove stations</p></div>
          </GlassmorphicCard>
        </Link>
        <Link to="/trains">
          <GlassmorphicCard className="flex items-center gap-4 hover:scale-105 transition-transform" gradient="blue" glow>
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl"><Train size={24} /></div>
            <div><h3 className="font-bold">Manage Trains</h3><p className="text-xs text-slate-500">Add/Update fleet</p></div>
          </GlassmorphicCard>
        </Link>
        <Link to="/analytics-reports">
          <GlassmorphicCard className="flex items-center gap-4 hover:scale-105 transition-transform" gradient="fuchsia" glow>
            <div className="p-3 bg-fuchsia-500/20 text-fuchsia-500 rounded-xl"><FileText size={24} /></div>
            <div><h3 className="font-bold">System Reports</h3><p className="text-xs text-slate-500">Export analytics</p></div>
          </GlassmorphicCard>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/40 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-900 text-blue-500 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <UserCheck size={14} /> User Management
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-white dark:bg-slate-900 text-blue-500 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Activity size={14} /> System Logs
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
          <ShieldAlert size={16} className="text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'users' ? (
        <GlassmorphicCard hoverEffect={false} gradient="primary">
        <div className="overflow-x-auto rounded-xl bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-500/5 to-cyan-500/5">
                <th className="pb-3 font-bold">Staff Member</th>
                <th className="pb-3 font-bold">Email</th>
                <th className="pb-3 font-bold">Authorized Role</th>
                <th className="pb-3 font-bold text-center">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {users.map((u) => (
                <tr key={u.id} className="table-row-colorful transition-all">
                  <td className="py-4 font-bold text-sm text-slate-800 dark:text-slate-200">{u.name}</td>
                  <td className="py-4 font-semibold opacity-75 dark:opacity-100">{u.email}</td>
                  <td className="py-4">
                    <span className={`badge-gradient-${u.role === 'Admin' ? 'violet' : u.role === 'Operator' ? 'cyan' : 'emerald'} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`badge-gradient-${u.status === 'Active' ? 'emerald' : 'red'} px-2.5 py-0.5 rounded-full text-[10px] font-bold`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                          u.status === 'Active'
                            ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 hover:from-violet-500/40 hover:to-cyan-500/40 hover:text-red-500 text-violet-500'
                            : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-cyan-500/20 hover:text-green-500 text-slate-600 dark:text-slate-300'
                        }`}
                        title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.status === 'Active' ? <UserMinus size={14} /> : <UserCheck size={14} />}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-red-600/30 hover:text-red-500 text-slate-600 dark:text-slate-300 transition-all"
                        title="Delete Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>
      ) : (
        <GlassmorphicCard hoverEffect={false} gradient="violet">
          <div className="space-y-4 p-2">
            <h3 className="font-bold text-lg">Recent System Activity</h3>
            <ul className="space-y-3">
              {logs.map((log) => (
                <li key={log.id} className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <span className={`w-2 h-2 rounded-full ${log.status === 'Active' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.event}</p>
                      <p className="text-xs text-slate-500">{log.type} | {log.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${log.status === 'Active' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {log.status}
                  </span>
                </li>
              ))}
              {logs.length === 0 && <p className="text-slate-500 text-sm italic">No recent system logs.</p>}
            </ul>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};

export default AdminPanel;

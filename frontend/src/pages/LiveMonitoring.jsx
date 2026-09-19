import React from 'react';
import { useWebSockets } from '../context/WebSocketContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { Activity, Train, ShieldAlert, Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const LiveMonitoring = () => {
  const { realTimeData, wsConnected } = useWebSockets();

  const stations = realTimeData?.stations || [];
  const trains = realTimeData?.trains || [];
  const alerts = realTimeData?.alerts || [];

  const totalTrains = trains.length;
  const runningTrains = trains.filter(t => t.status === 'In Service').length;
  const delayedTrains = trains.filter(t => t.status === 'Delayed').length;

  const totalPassengers = stations.reduce((acc, curr) => acc + (curr.passenger_count || 0), 0);

  const chartData = stations.slice(0, 8).map(s => ({
    name: s.name.replace(' Station', ''),
    Inflow: s.inflow || 0,
    Outflow: s.outflow || 0,
  }));

  const occupancyData = trains.map(t => ({
    name: t.train_number,
    Occupancy: t.occupancy_percentage || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Activity className="text-violet-500 animate-pulse" size={24} />
            <span className="gradient-text">Live Operational Monitoring</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Real-time WebSocket data stream of system-wide train fleet status and station loads.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          wsConnected 
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-500/10' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
          <span>{wsConnected ? 'WebSocket Active' : 'Reconnecting...'}</span>
        </div>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="violet" glow>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25">
            <Train size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Fleet Status</span>
            <div className="text-2xl font-black">{runningTrains} / {totalTrains}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Active Running Trains</p>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="amber" glow>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Delayed Services</span>
            <div className="text-2xl font-black text-amber-400">{delayedTrains}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">System Headway Gaps</p>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="cyan" glow>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25">
            <Users size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Passengers</span>
            <div className="text-2xl font-black">{totalPassengers.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Live Station Footfall</p>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="red" glow>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25">
            <ShieldAlert size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Active Alerts</span>
            <div className="text-2xl font-black text-red-400">{alerts.length}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">Emergency Logs</p>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Live Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassmorphicCard className="p-5 flex flex-col justify-between" gradient="violet">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Station Inflow / Outflow Split</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Renders live gates passenger throughput metrics.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(20px)' }}
                  labelStyle={{ color: 'var(--chart-axis)', fontWeight: 'bold' }}
                />
                <Bar dataKey="Inflow" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Outflow" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-5 flex flex-col justify-between" gradient="cyan">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Train Capacity Occupancy (%)</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Percentage distribution of load limits per active train number.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(20px)' }}
                  labelStyle={{ color: 'var(--chart-axis)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Occupancy" stroke="#06b6d4" fillOpacity={1} fill="url(#colorOcc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Live Train Status Table */}
      <GlassmorphicCard className="p-5 overflow-hidden" gradient="primary">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Live Active Train Schedules</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Current status and coordinates of trains traveling on the network.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 text-left">
                <th className="pb-2 font-black uppercase tracking-wider">Train</th>
                <th className="pb-2 font-black uppercase tracking-wider">Current Station</th>
                <th className="pb-2 font-black uppercase tracking-wider">Occupancy</th>
                <th className="pb-2 font-black uppercase tracking-wider">Status</th>
                <th className="pb-2 font-black uppercase tracking-wider">Location Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((t) => (
                <tr key={t.train_id} className="border-b border-slate-200 dark:border-white/5 last:border-0 table-row-colorful transition-all">
                  <td className="py-3 flex flex-col">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{t.train_name}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400">#{t.train_number}</span>
                  </td>
                  <td className="py-3 font-semibold text-slate-800 dark:text-white">{t.current_station || 'Terminal Yard'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-white/5 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            t.occupancy_percentage > 85 ? 'bg-gradient-to-r from-red-500 to-rose-500' : t.occupancy_percentage > 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          }`}
                          style={{ width: `${t.occupancy_percentage}%` }}
                        />
                      </div>
                      <span>{t.current_occupancy} / {t.capacity} ({t.occupancy_percentage}%)</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      t.status === 'In Service' ? 'badge-gradient-emerald' :
                      t.status === 'Delayed' ? 'badge-gradient-amber' :
                      'bg-slate-200 dark:bg-slate-700/20 text-slate-500 dark:text-slate-400'
                    }`}>
                      {t.status === 'In Service' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">
                    {t.latitude?.toFixed(4)}, {t.longitude?.toFixed(4)}
                  </td>
                </tr>
              ))}
              {trains.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 dark:text-slate-400">No active trains running.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default LiveMonitoring;

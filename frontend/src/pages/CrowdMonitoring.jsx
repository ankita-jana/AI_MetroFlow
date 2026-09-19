import React from 'react';
import { useWebSockets } from '../context/WebSocketContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { MapPin, Users, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

const CrowdMonitoring = () => {
  const { realTimeData } = useWebSockets();
  
  const stations = realTimeData?.stations || [];
  const trains = realTimeData?.trains || [];

  const totalStations = stations.length;
  const totalPassengers = stations.reduce((acc, curr) => acc + curr.passenger_count, 0);
  const activeStations = stations.filter(s => s.passenger_count > 0).length;
  
  const avgOccupancy = totalStations > 0 
    ? Math.round(stations.reduce((acc, curr) => acc + curr.crowd_percentage, 0) / totalStations)
    : 0;

  let currentCongestionLevel = "Green";
  let congestionColor = "text-emerald-400";
  let congestionGradient = "from-emerald-500 to-teal-500";
  if (avgOccupancy > 80) { currentCongestionLevel = "Red"; congestionColor = "text-red-400"; congestionGradient = "from-red-500 to-rose-500"; }
  else if (avgOccupancy > 60) { currentCongestionLevel = "Orange"; congestionColor = "text-orange-400"; congestionGradient = "from-orange-500 to-amber-500"; }
  else if (avgOccupancy > 40) { currentCongestionLevel = "Yellow"; congestionColor = "text-yellow-400"; congestionGradient = "from-yellow-500 to-amber-500"; }

  const greenStations = stations.filter(s => s.crowd_percentage <= 40).length;
  const yellowStations = stations.filter(s => s.crowd_percentage > 40 && s.crowd_percentage <= 60).length;
  const orangeStations = stations.filter(s => s.crowd_percentage > 60 && s.crowd_percentage <= 80).length;
  const redStations = stations.filter(s => s.crowd_percentage > 80).length;

  const distributionData = [
    { name: 'Green (0-40%)', value: greenStations, color: '#34d399' },
    { name: 'Yellow (41-60%)', value: yellowStations, color: '#fbbf24' },
    { name: 'Orange (61-80%)', value: orangeStations, color: '#fb923c' },
    { name: 'Red (81-100%)', value: redStations, color: '#f87171' }
  ];

  const topStations = [...stations]
    .sort((a, b) => b.crowd_percentage - a.crowd_percentage)
    .slice(0, 8)
    .map(s => ({
      name: s.name,
      Occupancy: s.crowd_percentage,
      Passengers: s.passenger_count
    }));

  const topTrains = [...trains]
    .sort((a, b) => b.occupancy_percentage - a.occupancy_percentage)
    .slice(0, 6)
    .map(t => ({
      name: t.train_number,
      Load: t.occupancy_percentage
    }));

  const passengerTrend = [
    { time: '06:00', passengers: 12000 },
    { time: '08:00', passengers: 45000 },
    { time: '10:00', passengers: 85000 },
    { time: '12:00', passengers: 55000 },
    { time: '14:00', passengers: 48000 },
    { time: '16:00', passengers: 62000 },
    { time: '18:00', passengers: 95000 },
    { time: '20:00', passengers: totalPassengers || 78000 },
  ];

  const nowString = new Date().toLocaleTimeString();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight gradient-text">Crowd Monitoring Dashboard</h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Real-time analytics and congestion tracking for all metro stations.
        </p>
      </div>

      {/* 1. Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="blue" glow>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Stations</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{totalStations}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Active Network</p>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="violet" glow>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Passengers</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{totalPassengers.toLocaleString()}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Live Station Footfall</p>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="emerald" glow>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Active Stations</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{activeStations}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Stations with Passengers</p>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-5 flex items-center gap-4" gradient="red" glow>
          <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${congestionGradient} text-white shadow-lg shrink-0`}>
            {avgOccupancy > 60 ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">System Congestion</span>
            <div className={`text-2xl font-black ${congestionColor}`}>{currentCongestionLevel}</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Avg Occupancy {avgOccupancy}%</p>
          </div>
        </GlassmorphicCard>
      </div>

      {/* 2. Congestion Level Cards */}
      <h2 className="text-xl font-bold gradient-text mt-8 mb-4">Congestion Zones</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassmorphicCard className="border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">0 - 40%</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">Green Zone</div>
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-200">{greenStations}</div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="border-t-4 border-t-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">41 - 60%</div>
              <div className="text-lg font-black text-yellow-600 dark:text-yellow-400">Yellow Zone</div>
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-200">{yellowStations}</div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="border-t-4 border-t-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">61 - 80%</div>
              <div className="text-lg font-black text-orange-600 dark:text-orange-400">Orange Zone</div>
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-200">{orangeStations}</div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="border-t-4 border-t-red-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">81 - 100%</div>
              <div className="text-lg font-black text-red-600 dark:text-red-400">Red Zone</div>
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-200">{redStations}</div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <GlassmorphicCard className="space-y-4">
          <h3 className="font-bold text-lg">Passenger Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" h="100%">
              <LineChart data={passengerTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)"/>
                <XAxis dataKey="time" stroke="var(--chart-axis)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(20px)' }} />
                <Line type="monotone" dataKey="passengers" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', stroke: '#0c0c1d', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="space-y-4">
          <h3 className="font-bold text-lg">Crowd Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" h="100%">
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(20px)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="space-y-4">
          <h3 className="font-bold text-lg">Station Occupancy (Top 8)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" h="100%">
              <BarChart data={topStations}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)"/>
                <XAxis dataKey="name" stroke="var(--chart-axis)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(20px)' }} />
                <Bar dataKey="Occupancy" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="space-y-4">
          <h3 className="font-bold text-lg">Congestion Summary</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" h="100%">
              <AreaChart data={topTrains}>
                <defs>
                  <linearGradient id="colorPassengers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)"/>
                <XAxis dataKey="name" stroke="var(--chart-axis)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(20px)' }} />
                <Area type="monotone" dataKey="Load" stroke="#06b6d4" fill="url(#colorPassengers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphicCard>
      </div>

      {/* 4. Congestion Tracking Table */}
      <GlassmorphicCard className="overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Congestion Tracking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 bg-gradient-to-r from-violet-500/5 to-cyan-500/5">
              <tr>
                <th className="px-4 py-3 font-black">Station Name</th>
                <th className="px-4 py-3 font-black text-right">Passenger Count</th>
                <th className="px-4 py-3 font-black text-right">Occupancy %</th>
                <th className="px-4 py-3 font-black text-center">Crowd Level</th>
                <th className="px-4 py-3 font-black text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(s => {
                let badgeClass = "badge-gradient-emerald";
                if (s.crowd_level === "Red") badgeClass = "badge-gradient-red";
                if (s.crowd_level === "Orange") badgeClass = "badge-gradient-amber";
                if (s.crowd_level === "Yellow") badgeClass = "badge-gradient-amber";

                return (
                  <tr key={s.station_id} className="border-b border-[var(--border)] table-row-colorful transition-all">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{s.passenger_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">{s.crowd_percentage}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                        {s.crowd_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 text-xs">{nowString}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default CrowdMonitoring;

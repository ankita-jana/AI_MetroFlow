import React, { useEffect, useState } from 'react';
import api from '../services/api';
import GlassmorphicCard from '../components/GlassmorphicCard';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell, PieChart, Pie
} from 'recharts';
import {
  FileSpreadsheet, FileText, Download, Calendar, Info,
  TrendingUp, Route, CloudRain, Activity, Network, Users
} from 'lucide-react';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {typeof entry.value === 'number'
              ? entry.value > 1000 ? entry.value.toLocaleString() : entry.value.toFixed(1)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Color palettes ───────────────────────────────────────────────────────────
const LINE_COLORS = {
  'Red line':         '#ef4444',
  'Yellow line':      '#eab308',
  'Blue line':        '#3b82f6',
  'Pink line':        '#ec4899',
  'Magenta line':     '#d946ef',
  'Voilet line':      '#8b5cf6',
  'Violet line':      '#8b5cf6',
  'Green line':       '#22c55e',
  'Green line branch':'#16a34a',
  'Aqua line':        '#06b6d4',
  'Rapid Metro':      '#64748b',
  'Gray line':        '#9ca3af',
  'Orange line':      '#f97316',
  'Blue line branch': '#60a5fa',
};

const WEATHER_COLORS = {
  Storm: '#ef4444', Rain: '#3b82f6', Fog: 'var(--chart-axis)',
  Snow: '#e2e8f0', Cloudy: '#64748b', Clear: '#22c55e',
};

const tooltipStyle = { background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(20px)' };

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, children, color = 'blue' }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-${color}-500/10`}>
        <Icon size={20} className={`text-${color}-500`} />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const ChartSkeleton = ({ h = 'h-64' }) => (
  <div className={`${h} rounded-2xl bg-slate-200/60 dark:bg-slate-800/40 animate-pulse`} />
);

const AnalyticsReports = () => {
  // ── Tab state ──
  const [activeTab, setActiveTab] = useState('analytics');

  // ── Report download state ──
  const [reportType, setReportType] = useState('passenger');
  const [reportFormat, setReportFormat] = useState('csv');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [downloading, setDownloading] = useState(false);

  // ── Analytics data ──
  const [trendsData, setTrendsData]     = useState(null);
  const [routesData, setRoutesData]     = useState(null);
  const [delayData, setDelayData]       = useState(null);
  const [networkData, setNetworkData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (activeTab !== 'analytics') return;
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [t, r, d, n] = await Promise.all([
          api.get('/reports/analytics/passenger-trends'),
          api.get('/reports/analytics/top-routes'),
          api.get('/reports/analytics/delay-factors'),
          api.get('/reports/analytics/network-overview'),
        ]);
        setTrendsData(t.data);
        setRoutesData(r.data);
        setDelayData(d.data);
        setNetworkData(n.data);
      } catch (err) {
        setError('Failed to load analytics data. Ensure backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [activeTab]);

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    try {
      const response = await api.get('/reports/generate', {
        params: { type: reportType, format: reportFormat, start_date: startDate, end_date: endDate },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `metroflow_${reportType}_report_${new Date().toISOString().split('T')[0]}.${reportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Make sure backend libraries (openpyxl, reportlab) are installed.');
    } finally {
      setDownloading(false);
    }
  };

  const reportDescriptions = {
    passenger: 'Hourly density logs, passenger counts, inflow vs outflow indices, and congestion level alerts history.',
    station: 'Directory list of metro stations, layout structure, platform counts, spatial coordinates, and line color associations.',
    occupancy: 'Train capacity tracking, average riders occupancy counts, standing capacity, and status operations.',
    delay: 'Incident reports, breakdown log of delayed schedules, incident categories (signal, weather, tracks).',
    peak_hour: 'Hourly passenger density summaries, rush periods identification, and optimization recommendations.',
    revenue: 'Daily revenue estimates per route based on estimated passenger volumes and average ticket prices.'
  };

  // ── Preprocess monthly trends to shorter labels ──
  const monthlyTrends = (trendsData?.trends || []).map(d => ({
    ...d,
    month: d.month?.slice(0, 7) || d.month,
    total_passengers: Math.round(d.total_passengers),
    total_trips: Math.round(d.total_trips),
  }));

  // Show only last 18 months
  const recentTrends = monthlyTrends.slice(-18);

  const dayPatterns = (trendsData?.day_patterns || []).map(d => ({
    ...d,
    avg_passengers: parseFloat(d.avg_passengers),
  }));

  const ticketBreakdown = trendsData?.ticket_breakdown || [];
  const TICKET_COLORS = ['#3b82f6','#22c55e','#f97316','#d946ef','#eab308'];

  const topRoutes = (routesData?.routes || []).map(r => ({
    ...r,
    route_short: r.route?.replace(' → ', '→').split('→').map(s => s.trim().slice(0, 8)).join('→') || r.route,
  }));

  const weatherImpact = (delayData?.weather_impact || []).map(w => ({
    ...w,
    delayed_pct: Math.round(w.delayed_rate * 100),
    color: WEATHER_COLORS[w.weather] || '#6366f1',
  }));

  const seasonImpact = delayData?.season_impact || [];

  const networkLines = (networkData?.lines || []).map(l => ({
    ...l,
    color: LINE_COLORS[l.line] || '#6366f1',
  }));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Activity className="text-blue-500" size={28} />
          <span className="gradient-text">Analytics & Reports</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Real-time insights from 150,000+ trip records · 285 Delhi Metro stations · delay analysis
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/40 rounded-xl w-fit">
        {[
          { id: 'analytics', label: 'Live Analytics', icon: TrendingUp },
          { id: 'reports',   label: 'Export Reports', icon: Download },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-slate-900 text-violet-500 dark:text-violet-400 shadow-md'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════ ANALYTICS TAB ══════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="space-y-10">

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold">
              ⚠ {error}
            </div>
          )}

          {/* ── 1. Monthly Passenger Trends ── */}
          <Section icon={TrendingUp} title="Monthly Passenger Trends" color="blue"
            subtitle="Aggregated from 150,000 real trip records (Jan 2022 – Dec 2024)">
            <GlassmorphicCard hoverEffect={false} gradient="violet" className="p-4">
              {loading ? <ChartSkeleton h="h-72" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={recentTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false}
                      tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip contentStyle={tooltipStyle} content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="total_passengers" name="Total Passengers"
                      stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorPass)" dot={false} />
                    <Area type="monotone" dataKey="total_trips" name="Total Trips"
                      stroke="#a78bfa" strokeWidth={2} fill="url(#colorTrips)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </GlassmorphicCard>
          </Section>

          {/* ── 2. Day-of-Week + Ticket Breakdown (side by side) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Day of Week Patterns */}
            <Section icon={Calendar} title="Weekly Ridership Pattern" color="purple"
              subtitle="Average passengers per trip by day of week">
              <GlassmorphicCard hoverEffect={false} gradient="cyan" className="p-4">
                {loading ? <ChartSkeleton h="h-60" /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={dayPatterns} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false}
                        tickFormatter={d => d.slice(0, 3)} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                      <Tooltip contentStyle={tooltipStyle} content={<CustomTooltip />} />
                      <Bar dataKey="avg_passengers" name="Avg Passengers" radius={[6, 6, 0, 0]}>
                        {dayPatterns.map((_, i) => (
                          <Cell key={i}
                            fill={i === 5 || i === 6 ? '#f97316' : '#6366f1'}
                            fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </GlassmorphicCard>
            </Section>

            {/* Ticket Type Breakdown */}
            <Section icon={Users} title="Ticket Type Distribution" color="orange"
              subtitle="Passenger share by ticket category">
              <GlassmorphicCard hoverEffect={false} gradient="emerald" className="p-4">
                {loading ? <ChartSkeleton h="h-60" /> : (
                  <div className="flex items-center justify-center gap-6" style={{ height: 240 }}>
                    <ResponsiveContainer width="55%" height={220}>
                      <PieChart>
                        <Pie data={ticketBreakdown} dataKey="passengers" nameKey="ticket_type"
                          cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                          paddingAngle={3} strokeWidth={0}>
                          {ticketBreakdown.map((_, i) => (
                            <Cell key={i} fill={TICKET_COLORS[i % TICKET_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 text-xs font-semibold">
                      {ticketBreakdown.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: TICKET_COLORS[i % TICKET_COLORS.length] }} />
                          <span className="text-slate-600 dark:text-slate-300">{t.ticket_type}</span>
                          <span className="text-slate-500 dark:text-slate-400 ml-auto">{(t.passengers / 1000).toFixed(0)}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassmorphicCard>
            </Section>
          </div>

          {/* ── 3. Top 10 Busiest Routes ── */}
          <Section icon={Route} title="Top 10 Busiest Routes" color="green"
            subtitle="Highest passenger volume origin-destination pairs (all-time)">
            <GlassmorphicCard hoverEffect={false} gradient="amber" className="p-4">
              {loading ? <ChartSkeleton h="h-80" /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topRoutes} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false}
                      tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="route_short" width={90}
                      tick={{ fontSize: 9, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} content={<CustomTooltip />} />
                    <Bar dataKey="total_passengers" name="Total Passengers" radius={[0, 6, 6, 0]}>
                      {topRoutes.map((_, i) => (
                        <Cell key={i}
                          fill={`hsl(${270 + i * 8}, 80%, ${60 - i * 2}%)`}
                          fillOpacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassmorphicCard>
          </Section>

          {/* ── 4. Weather & Seasonal Delay Analysis ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Section icon={CloudRain} title="Weather Impact on Delays" color="red"
              subtitle="Average delay minutes per weather condition">
              <GlassmorphicCard hoverEffect={false} gradient="red" className="p-4">
                {loading ? <ChartSkeleton h="h-60" /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weatherImpact} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                      <XAxis dataKey="weather" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="avg_delay_min" name="Avg Delay (min)" radius={[6, 6, 0, 0]}>
                        {weatherImpact.map((w, i) => (
                          <Cell key={i} fill={w.color} fillOpacity={0.85} />
                        ))}
                      </Bar>
                      <Bar dataKey="delayed_pct" name="Delayed %" radius={[6, 6, 0, 0]}
                        fill="#6366f1" fillOpacity={0.6} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </GlassmorphicCard>
            </Section>

            {/* Season Impact Radar */}
            <Section icon={Activity} title="Seasonal Delay Patterns" color="cyan"
              subtitle="Delay rate and severity by season">
              <GlassmorphicCard hoverEffect={false} gradient="blue" className="p-4">
                {loading ? <ChartSkeleton h="h-60" /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={seasonImpact.map(s => ({
                      ...s,
                      delayed_pct: Math.round(s.delayed_rate * 100),
                    }))}>
                      <PolarGrid stroke="rgba(139,92,246,0.15)" />
                      <PolarAngleAxis dataKey="season" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--chart-axis)' }} />
                      <Radar name="Delayed %" dataKey="delayed_pct" stroke="#06b6d4"
                        fill="#06b6d4" fillOpacity={0.35} strokeWidth={2} />
                      <Radar name="Avg Delay (min)" dataKey="avg_delay_min" stroke="#f97316"
                        fill="#f97316" fillOpacity={0.25} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </GlassmorphicCard>
            </Section>
          </div>

          {/* ── 5. Network Line Overview ── */}
          <Section icon={Network} title="Delhi Metro Network Overview" color="indigo"
            subtitle="Stations and route length per metro line">
            <GlassmorphicCard hoverEffect={false} className="p-4">
              {loading ? <ChartSkeleton h="h-72" /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {networkLines.map((line, i) => (
                    <div key={i}
                      className="p-3 rounded-xl border space-y-1.5 transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: line.color + '40',
                        background: `linear-gradient(135deg, ${line.color}15 0%, ${line.color}08 100%)`,
                      }}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: line.color }} />
                        <span className="text-xs font-bold truncate">{line.line}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{line.station_count} stations</span>
                        <span>{line.total_km?.toFixed(1)} km</span>
                      </div>
                      <div className="w-full bg-slate-300/30 dark:bg-slate-700/40 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (line.station_count / 60) * 100)}%`,
                            background: `linear-gradient(90deg, ${line.color}, ${line.color}cc)`
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>
          </Section>

        </div>
      )}

      {/* ══════════════════════════════ REPORTS TAB ══════════════════════════════ */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* Form controls */}
          <GlassmorphicCard className="md:col-span-2 space-y-4" hoverEffect={false}>
            <h3 className="font-bold text-base flex items-center gap-2 border-b pb-2">
              <span>Report Configuration</span>
            </h3>

            <form onSubmit={handleDownload} className="space-y-5 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Report Content Scope</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 cursor-pointer font-bold text-slate-800 dark:text-white">
                  <option className="dark:bg-slate-900" value="passenger">Passenger Volume & Density Flow Logs</option>
                  <option className="dark:bg-slate-900" value="station">Metro Stations Asset Directory</option>
                  <option className="dark:bg-slate-900" value="occupancy">Rolling Stock Capacity & Occupancy</option>
                  <option className="dark:bg-slate-900" value="delay">Incident Reports & Schedule Delays</option>
                  <option className="dark:bg-slate-900" value="peak_hour">Peak Hour Analysis Summary</option>
                  <option className="dark:bg-slate-900" value="revenue">Revenue Estimates & Passenger Financials</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 cursor-pointer font-bold text-slate-800 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={14} />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 cursor-pointer font-bold text-slate-800 dark:text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Export File Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {['csv', 'xlsx', 'pdf'].map((format) => (
                    <label key={format}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center select-none transition-all ${
                        reportFormat === format
                          ? 'border-violet-500/50 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 text-violet-400 font-bold scale-[1.02]'
                          : 'border-slate-200 dark:border-white/8 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                      }`}>
                      <input type="radio" name="format" value={format} checked={reportFormat === format}
                        onChange={() => setReportFormat(format)} className="sr-only" />
                      {format === 'pdf' ? <FileText size={18} /> : <FileSpreadsheet size={18} />}
                      <span className="uppercase text-[10px] tracking-wider">{format === 'xlsx' ? 'Excel' : format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={downloading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/25 text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 mt-4">
                {downloading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download size={16} />
                    <span>Generate & Export Report</span>
                  </>
                )}
              </button>
            </form>
          </GlassmorphicCard>

          {/* Side Panel */}
          <div className="space-y-6">
            <GlassmorphicCard className="space-y-4" hoverEffect={false}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Info size={16} className="text-violet-400" />
                <span>Report Scope Details</span>
              </h3>
              <div className="text-xs space-y-3 leading-relaxed">
                <p className="font-bold text-violet-400 uppercase tracking-wide text-[10px]">
                  {reportType.replace('_', ' ')}
                </p>
                <p className="text-slate-500 dark:text-slate-400">{reportDescriptions[reportType]}</p>
                <div className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 rounded-xl mt-4">
                  <p className="font-bold mb-1">Standard inclusions:</p>
                  <ul className="list-disc pl-4 space-y-1 opacity-75 dark:opacity-100">
                    <li>Delhi Metro credentials</li>
                    <li>UTC timestamps</li>
                    <li>Admin signatures</li>
                  </ul>
                </div>
              </div>
            </GlassmorphicCard>
          </div>

        </div>
      )}
    </div>
  );
};

export default AnalyticsReports;

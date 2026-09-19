import React, { useEffect, useState } from 'react';
import api from '../services/api';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, AlertTriangle, TrendingUp, Cpu, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

const PassengerForecast = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [timeframe, setTimeframe] = useState('hourly'); // hourly, daily, weekly
  const [loading, setLoading] = useState(true);
  const [fcLoading, setFcLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await api.get('/stations');
        const list = response.data?.data || response.data || [];
        setStations(list);
        if (list.length > 0) {
          setSelectedStation(list[0].name);
        }
      } catch (err) {
        console.error("Error loading stations:", err);
        setError('Failed to load metro stations list.');
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const handleForecast = async (e) => {
    e.preventDefault();
    if (!selectedStation) return;
    setFcLoading(true);
    setError('');
    setForecastResult(null);
    try {
      const response = await api.post('/predictions/forecast-demand', {
        station: selectedStation,
        timeframe: timeframe
      });
      setForecastResult(response.data);
    } catch (err) {
      console.error("Error fetching forecast:", err);
      setError('Failed to compute passenger demand forecast. Ensure backend service is online.');
    } finally {
      setFcLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-500 dark:text-slate-400">Loading stations data...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CalendarDays className="text-violet-500" size={24} />
          <span className="gradient-text">Passenger Demand Forecasting</span>
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Project future passenger traffic spreads over daily cycles or weekly windows to assist scheduling deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Parameters Form */}
        <div className="md:col-span-1">
          <GlassmorphicCard className="p-5 space-y-4" hoverEffect={false}>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-white/5 pb-2 text-sm flex items-center gap-2">
              <div className="bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-lg p-1">
                <Cpu size={16} />
              </div>
              <span>Forecast Settings</span>
            </h3>

            <form onSubmit={handleForecast} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">Station Area</label>
                <select 
                  value={selectedStation} 
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {stations.map((st) => (
                    <option className="dark:bg-slate-900" key={st.id || st._id} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">Timeframe Interval</label>
                <div className="flex gap-2 mt-2">
                  {['hourly', 'daily', 'weekly'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeframe(t)}
                      className={`flex-1 py-2 px-3 border rounded-xl font-bold uppercase transition-all ${
                        timeframe === t 
                          ? 'bg-gradient-to-r from-violet-500/15 to-cyan-500/15 border-violet-500/50 text-violet-400 dark:text-cyan-400' 
                          : 'border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={fcLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 text-white font-bold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {fcLoading ? (
                  <>
                    <Cpu className="animate-spin" size={14} />
                    <span>Analyzing Trends...</span>
                  </>
                ) : (
                  <>
                    <CalendarDays size={14} />
                    <span>Run Demand Forecast</span>
                  </>
                )}
              </button>
            </form>
          </GlassmorphicCard>
        </div>

        {/* Display Forecast Data */}
        <div className="md:col-span-2 space-y-4">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
              <ShieldAlert size={14} />
              <span>{error}</span>
            </div>
          )}

          {forecastResult ? (
            <div className="space-y-5">
              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassmorphicCard className="p-4 flex items-center gap-3" hoverEffect={false}>
                  <div className="bg-gradient-to-br from-violet-500 to-cyan-500 text-white rounded-xl p-2">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Trend Behavior</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 leading-snug">
                      {forecastResult.trend_analysis}
                    </p>
                  </div>
                </GlassmorphicCard>

                {forecastResult.peak_hour_prediction !== 'N/A' && (
                  <GlassmorphicCard className="p-4 flex items-center gap-3" hoverEffect={false}>
                    <div className="bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-xl p-2">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Predicted Peak Hour</span>
                      <p className="text-base font-black text-rose-400 mt-1">
                        {forecastResult.peak_hour_prediction}
                      </p>
                    </div>
                  </GlassmorphicCard>
                )}
              </div>

              {/* Demand Alerts */}
              {forecastResult.high_demand_alerts?.length > 0 && (
                <div className="space-y-2">
                  {forecastResult.high_demand_alerts.map((al, idx) => (
                    <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-200 text-xs font-semibold rounded-xl flex items-center gap-3">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      <div>
                        <span className="font-black text-amber-400">Peak Warning [{al.time}]: </span>
                        <span>{al.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Area Chart of Forecast */}
              <GlassmorphicCard className="p-5 flex flex-col justify-between" hoverEffect={false}>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Forecast Timeline ({forecastResult.timeframe})
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Projected passenger traffic volume curve.</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastResult.forecast}>
                      <defs>
                        <linearGradient id="colorFc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'rgba(12,12,29,0.95)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', color: '#fff', fontSize: '11px', backdropFilter: 'blur(20px)' }}
                        labelStyle={{ color: 'var(--chart-axis)', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="passengers" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorFc)" strokeWidth={2} name="Passengers" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassmorphicCard>

              {/* Data Table */}
              <GlassmorphicCard className="p-5 overflow-hidden" hoverEffect={false}>
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Forecast Data Table</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 text-left">
                        <th className="pb-2 font-black uppercase tracking-wider">Interval / Label</th>
                        <th className="pb-2 font-black uppercase tracking-wider text-right">Predicted Passengers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastResult.forecast.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200 dark:border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="py-2 text-slate-800 dark:text-slate-200">{item.label}</td>
                          <td className="py-2 text-right font-bold text-violet-400">{item.passengers.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassmorphicCard>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/20 rounded-3xl border border-slate-200 dark:border-white/5">
              <CalendarDays size={48} className="gradient-text mb-4 animate-pulse" />
              <p className="text-sm font-black gradient-text">No forecast data loaded.</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Select a station and interval parameters to load future predictions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerForecast;

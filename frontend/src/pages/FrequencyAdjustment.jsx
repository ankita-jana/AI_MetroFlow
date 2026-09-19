import React, { useEffect, useState } from 'react';
import api from '../services/api';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { RefreshCw, Compass, ArrowRightLeft, ShieldAlert, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';

const FrequencyAdjustment = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [targetInterval, setTargetInterval] = useState(5);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get('/schedules/routes');
        setRoutes(response.data);
        if (response.data.length > 0) {
          setSelectedRouteId(response.data[0].id);
        }
      } catch (err) {
        console.error("Error loading routes:", err);
        setError('Failed to load metro routes.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) return;
    setRecLoading(true);
    setError('');
    setRecommendationData(null);
    try {
      const response = await api.post('/schedules/optimize-frequency', {
        route_id: selectedRouteId,
        target_interval_minutes: parseInt(targetInterval)
      });
      setRecommendationData(response.data);
    } catch (err) {
      console.error("Error getting optimization data:", err);
      setError('Failed to compute frequency optimization recommendations.');
    } finally {
      setRecLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-slate-500 dark:text-slate-400">Loading metro network topology...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Cpu className="text-violet-500" size={24} />
          <span className="gradient-text">Intelligent Frequency Adjustment</span>
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Compute recommended headway splits based on peak passenger loads and current active rolling stock.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Setup Config Card */}
        <div className="md:col-span-1">
          <GlassmorphicCard className="p-5 space-y-4" hoverEffect={false}>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-white/5 pb-2 text-sm flex items-center gap-2">
              <Compass size={16} className="text-violet-500" />
              <span>Optimization Parameters</span>
            </h3>

            <form onSubmit={handleGetRecommendations} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">Target Route Line</label>
                <select 
                  value={selectedRouteId} 
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
                >
                  {routes.map(r => (
                    <option className="dark:bg-slate-900" key={r.id} value={r.id}>{r.name} ({r.line})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">Target Peak Headway (Minutes)</label>
                <input 
                  type="number" 
                  min={2} 
                  max={20}
                  value={targetInterval} 
                  onChange={(e) => setTargetInterval(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              <button 
                type="submit" 
                disabled={recLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/25 text-white font-bold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {recLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Analyzing Flow Rates...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={14} />
                    <span>Generate Frequency Report</span>
                  </>
                )}
              </button>
            </form>
          </GlassmorphicCard>
        </div>

        {/* Results Card */}
        <div className="md:col-span-2 space-y-4">
          <GlassmorphicCard gradient="primary">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
              <ShieldAlert size={14} />
              <span>{error}</span>
            </div>
          )}

          {recommendationData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>Recommendations for {recommendationData.route_name}</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Computed at {new Date(recommendationData.analysis_timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {recommendationData.recommendations.map((rec, idx) => (
                  <GlassmorphicCard 
                    key={idx} 
                    className={`p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                      rec.is_peak 
                        ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent' 
                        : 'border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-500/5 to-transparent'
                    }`}
                    hoverEffect={false}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{rec.period}</span>
                        {rec.is_peak && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-rose-500/10 text-rose-400">Peak Hour</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {rec.is_peak 
                          ? "High passenger loads require dense operations and reduced headway."
                          : "Lower passenger counts. Recommend wider service spreads to optimize energy usage."}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Headway Gap</span>
                        <div className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5 justify-end">
                          <span>{rec.recommended_headway_minutes} mins</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Required Trains</span>
                        <div className="text-base font-black text-violet-400">
                          {rec.required_trains} <span className="text-[10px] text-slate-500 dark:text-slate-400">({rec.current_trains} active)</span>
                        </div>
                      </div>

                      <div className="min-w-[150px] text-right">
                        <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Dispatch Status</span>
                        <div className={`text-xs font-black uppercase mt-1 ${
                          rec.status.includes('Action') ? 'text-rose-400' : rec.status.includes('Surplus') ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {rec.status}
                        </div>
                      </div>
                    </div>
                  </GlassmorphicCard>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/20 rounded-3xl border border-slate-200 dark:border-white/5">
              <Cpu size={48} className="text-slate-700 dark:text-slate-300 mb-4 animate-pulse" />
              <p className="text-sm font-black text-slate-500 dark:text-slate-400">No calculation data loaded.</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Configure parameters on the left and submit.</p>
            </div>
          )}
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default FrequencyAdjustment;

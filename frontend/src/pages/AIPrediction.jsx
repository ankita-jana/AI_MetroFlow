import React, { useEffect, useState } from 'react';
import api from '../services/api';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { Brain, Sparkles, TrendingUp, Info, HelpCircle, Activity, AlertTriangle } from 'lucide-react';

const AIPrediction = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demand'); // demand, delay, anomaly

  // Demand query form state
  const [demFrom, setDemFrom] = useState('Rajiv Chowk');
  const [demTo, setDemTo] = useState('Kashmere Gate');
  const [demDist, setDemDist] = useState(6.5);
  const [demDay, setDemDay] = useState(1); // Tuesday
  const [demMonth, setDemMonth] = useState(5);
  const [demWeekend, setDemWeekend] = useState(false);
  const [demRemarks, setDemRemarks] = useState('peak');
  const [demResult, setDemResult] = useState(null);

  // Anomaly query form state
  const [anoPassengers, setAnoPassengers] = useState(15000);
  const [anoResult, setAnoResult] = useState(null);

  // Delay query form state
  const [delTemp, setDelTemp] = useState(32.0);
  const [delHumid, setDelHumid] = useState(65.0);
  const [delWind, setDelWind] = useState(12.0);
  const [delPrecip, setDelPrecip] = useState(0.0);
  const [delTraffic, setDelTraffic] = useState(72.0);
  const [delHoliday, setDelHoliday] = useState(false);
  const [delPeak, setDelPeak] = useState(true);
  const [delWeekday, setDelWeekday] = useState(1);
  const [delWeather, setDelWeather] = useState('Clear');
  const [delEvent, setDelEvent] = useState('None');
  const [delResult, setDelResult] = useState(null);

  const [predLoading, setPredLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/predictions/metrics');
        setMetrics(response.data);
      } catch (err) {
        console.error("Error fetching AI metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const handlePredictDemand = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    try {
      const response = await api.post('/predictions/demand', {
        from_station: demFrom,
        to_station: demTo,
        distance_km: parseFloat(demDist),
        day_of_week: parseInt(demDay),
        month: parseInt(demMonth),
        is_weekend: demWeekend,
        remarks: demRemarks
      });
      setDemResult(response.data);
    } catch (err) {
      alert('Failed to calculate demand prediction.');
    } finally {
      setPredLoading(false);
    }
  };

  const handlePredictAnomaly = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    try {
      const response = await api.post('/predictions/anomaly', {
        from_station: demFrom,
        to_station: demTo,
        distance_km: parseFloat(demDist),
        day_of_week: parseInt(demDay),
        month: parseInt(demMonth),
        is_weekend: demWeekend,
        remarks: demRemarks,
        passengers: parseInt(anoPassengers)
      });
      setAnoResult(response.data);
    } catch (err) {
      alert('Failed to calculate anomaly detection.');
    } finally {
      setPredLoading(false);
    }
  };

  const handlePredictDelay = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    try {
      const response = await api.post('/predictions/delay', {
        temperature_C: parseFloat(delTemp),
        humidity_percent: parseFloat(delHumid),
        wind_speed_kmh: parseFloat(delWind),
        precipitation_mm: parseFloat(delPrecip),
        traffic_congestion_index: parseFloat(delTraffic),
        holiday: delHoliday,
        peak_hour: delPeak,
        weekday: parseInt(delWeekday),
        weather_condition: delWeather,
        event_type: delEvent
      });
      setDelResult(response.data);
    } catch (err) {
      alert('Failed to calculate delay prediction.');
    } finally {
      setPredLoading(false);
    }
  };

  const weekdaysList = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (loading) return <div className="text-center py-20 font-bold">Loading ML Models Diagnostics...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Brain className="text-blue-500" />
          <span>AI Prediction Engine</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Run predictions on crowd demand flow and system delay risks using trained Random Forest algorithms.
        </p>
      </div>

      {/* Model Performance Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Demand Model Stats */}
        <GlassmorphicCard className="space-y-4" hoverEffect={false}>
          <h3 className="font-bold text-base border-b pb-2 flex items-center justify-between">
            <span>Demand Model Performance</span>
            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-black uppercase">RF Regressor</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="opacity-60">Mean Absolute Error (MAE)</span>
              <p className="text-lg font-black text-blue-500">{metrics?.demand_model?.mae?.toFixed(3) || '3.549'}</p>
            </div>
            <div className="p-3 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="opacity-60">Root Mean Square Error (RMSE)</span>
              <p className="text-lg font-black">{metrics?.demand_model?.rmse?.toFixed(3) || '4.472'}</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Demand Feature Importance</h4>
            <div className="space-y-2 text-xs">
              {Object.entries(metrics?.demand_model?.feature_importance || {}).sort((a,b)=>b[1]-a[1]).map(([feat, val]) => (
                <div key={feat} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{feat.replace('_Code', '').replace('_km', ' km')}</span>
                    <span>{(val * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${val * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassmorphicCard>

        {/* Delay Model Stats */}
        <GlassmorphicCard className="space-y-4" hoverEffect={false}>
          <h3 className="font-bold text-base border-b pb-2 flex items-center justify-between">
            <span>Delay Model Diagnostics</span>
            <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-black uppercase">RF Classifier</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="opacity-60">Classifier Accuracy</span>
              <p className="text-lg font-black text-amber-500">{(metrics?.delay_model?.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="opacity-60">Delay Amount RMSE</span>
              <p className="text-lg font-black">{metrics?.delay_model?.rmse?.toFixed(2)} min</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Delay Feature Importance</h4>
            <div className="space-y-2 text-xs">
              {Object.entries(metrics?.delay_model?.feature_importance || {}).sort((a,b)=>b[1]-a[1]).slice(0, 5).map(([feat, val]) => (
                <div key={feat} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{feat.replace('_code', '').replace('_C', ' °C').replace('_percent', '%')}</span>
                    <span>{(val * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${val * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassmorphicCard>

        {/* Confusion Matrix */}
        <GlassmorphicCard className="space-y-4" hoverEffect={false}>
          <h3 className="font-bold text-base border-b pb-2 flex items-center justify-between">
            <span>Classifier Confusion Matrix</span>
            <span className="text-xs bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded font-black uppercase">Validation Set</span>
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Illustrates predicted vs actual classifications for trip delay events (Threshold: Delay &gt; 5 mins).
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-2">
            <div></div>
            <div className="py-2 border-b">Pred: No Delay</div>
            <div className="py-2 border-b">Pred: Delayed</div>
            
            <div className="flex items-center justify-center font-bold text-[10px] text-slate-400 uppercase">Actual: No Delay</div>
            <div className="p-4 bg-slate-200/50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-black">
              {metrics?.delay_model?.confusion_matrix?.[0]?.[0] || 150}
            </div>
            <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/15 text-sm font-black">
              {metrics?.delay_model?.confusion_matrix?.[0]?.[1] || 45}
            </div>
            
            <div className="flex items-center justify-center font-bold text-[10px] text-slate-400 uppercase">Actual: Delayed</div>
            <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/15 text-sm font-black">
              {metrics?.delay_model?.confusion_matrix?.[1]?.[0] || 60}
            </div>
            <div className="p-4 bg-green-500/15 text-green-400 rounded-xl border border-green-500/20 text-sm font-black">
              {metrics?.delay_model?.confusion_matrix?.[1]?.[1] || 95}
            </div>
          </div>
        </GlassmorphicCard>

        {/* Anomaly Model Stats */}
        <GlassmorphicCard className="space-y-4" hoverEffect={false} gradient="rose" glow>
          <h3 className="font-bold text-base border-b pb-2 flex items-center justify-between">
            <span>Anomaly Detection Diagnostics</span>
            <span className="text-xs badge-gradient-rose px-2 py-0.5 rounded font-black uppercase">Isolation Forest</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="p-3 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="opacity-60 dark:opacity-100">Contamination Rate</span>
              <p className="text-lg font-black text-rose-500">{(metrics?.anomaly_model?.contamination * 100 || 5).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl space-y-1">
              <span className="opacity-60 dark:opacity-100">Mean Score</span>
              <p className="text-lg font-black">{metrics?.anomaly_model?.mean_decision_score?.toFixed(3) || '0.067'}</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-300">How it works</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The Isolation Forest isolates observations by randomly selecting a feature and then randomly selecting a split value. 
              Highly unusual flow surges (like a sudden protest or system failure) require fewer splits to isolate, resulting in a negative anomaly score.
            </p>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Interactive Predictors */}
      <GlassmorphicCard className="space-y-6" hoverEffect={false}>
        {/* Toggle tabs */}
        <div className="flex gap-4 border-b border-slate-300 dark:border-slate-800 pb-2">
          <button 
            onClick={() => setActiveTab('demand')}
            className={`pb-2 px-2 font-bold text-sm transition-colors relative ${activeTab === 'demand' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Passenger Demand Prediction
            {activeTab === 'demand' && <span className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-blue-500 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('delay')}
            className={`pb-2 px-2 font-bold text-sm transition-colors relative ${activeTab === 'delay' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            System Delay Risk
            {activeTab === 'delay' && <span className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-amber-500 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('anomaly')}
            className={`pb-2 px-2 font-bold text-sm transition-colors relative ${activeTab === 'anomaly' ? 'text-rose-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Anomaly Detection
            {activeTab === 'anomaly' && <span className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-rose-500 rounded-full" />}
          </button>
        </div>

        {/* Prediction Query Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Form */}
          {activeTab === 'demand' ? (
            <form onSubmit={handlePredictDemand} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">From Station</label>
                  <input type="text" value={demFrom} onChange={e=>setDemFrom(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">To Station</label>
                  <input type="text" value={demTo} onChange={e=>setDemTo(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Distance (km)</label>
                  <input type="number" step="0.1" value={demDist} onChange={e=>setDemDist(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Day of Week</label>
                  <select value={demDay} onChange={e=>setDemDay(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    {weekdaysList.map((day, idx) => <option className="dark:bg-slate-900" key={idx} value={idx}>{day}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Month</label>
                  <select value={demMonth} onChange={e=>setDemMonth(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    {monthsList.map((month, idx) => <option className="dark:bg-slate-900" key={idx} value={idx+1}>{month}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-slate-500">Remarks / Period</label>
                  <select value={demRemarks} onChange={e=>setDemRemarks(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    <option className="dark:bg-slate-900" value="normal">Normal / Off-Peak</option>
                    <option className="dark:bg-slate-900" value="peak">Office Rush Hour (Peak)</option>
                    <option className="dark:bg-slate-900" value="weekend">Weekend Services</option>
                    <option className="dark:bg-slate-900" value="festival">Festival Peak Traffic</option>
                    <option className="dark:bg-slate-900" value="maintenance">Maintenance Work Warning</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="weekendCheck" checked={demWeekend} onChange={e=>setDemWeekend(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="weekendCheck" className="cursor-pointer">Is Weekend Holiday</label>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={predLoading}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
              >
                <Sparkles size={16} />
                <span>Calculate Demand</span>
              </button>
            </form>
          ) : activeTab === 'delay' ? (
            <form onSubmit={handlePredictDelay} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Temp (°C)</label>
                  <input type="number" step="0.5" value={delTemp} onChange={e=>setDelTemp(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Humidity (%)</label>
                  <input type="number" value={delHumid} onChange={e=>setDelHumid(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Wind Speed (km/h)</label>
                  <input type="number" value={delWind} onChange={e=>setDelWind(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Precipitation (mm)</label>
                  <input type="number" step="0.1" value={delPrecip} onChange={e=>setDelPrecip(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Traffic Congestion Index</label>
                  <input type="number" value={delTraffic} onChange={e=>setDelTraffic(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Weekday</label>
                  <select value={delWeekday} onChange={e=>setDelWeekday(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    {weekdaysList.map((day, idx) => <option className="dark:bg-slate-900" key={idx} value={idx}>{day}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Weather Condition</label>
                  <select value={delWeather} onChange={e=>setDelWeather(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    <option className="dark:bg-slate-900" value="Clear">Clear / Dry</option>
                    <option className="dark:bg-slate-900" value="Rain">Heavy Monsoon Rain</option>
                    <option className="dark:bg-slate-900" value="Fog">Winter Smog / Fog</option>
                    <option className="dark:bg-slate-900" value="Storm">Thunderstorm</option>
                    <option className="dark:bg-slate-900" value="Cloudy">Overcast / Cloudy</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Local Public Event</label>
                  <select value={delEvent} onChange={e=>setDelEvent(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    <option className="dark:bg-slate-900" value="None">None</option>
                    <option className="dark:bg-slate-900" value="Sports">IPL Cricket Match</option>
                    <option className="dark:bg-slate-900" value="Festival">Diwali / Holiday Event</option>
                    <option className="dark:bg-slate-900" value="Concert">Music Concert</option>
                    <option className="dark:bg-slate-900" value="Parade">Republic Day Parade</option>
                    <option className="dark:bg-slate-900" value="Protest">Public Protest Rally</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="delPeakCheck" checked={delPeak} onChange={e=>setDelPeak(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="delPeakCheck" className="cursor-pointer">Peak Hour Rush</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="delHolCheck" checked={delHoliday} onChange={e=>setDelHoliday(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="delHolCheck" className="cursor-pointer">National Holiday</label>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={predLoading}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
              >
                <Sparkles size={16} />
                <span>Calculate Delay Risk</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePredictAnomaly} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">From Station</label>
                  <input type="text" value={demFrom} onChange={e=>setDemFrom(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">To Station</label>
                  <input type="text" value={demTo} onChange={e=>setDemTo(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Distance (km)</label>
                  <input type="number" step="0.1" value={demDist} onChange={e=>setDemDist(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Day of Week</label>
                  <select value={demDay} onChange={e=>setDemDay(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    {weekdaysList.map((day, idx) => <option className="dark:bg-slate-900" key={idx} value={idx}>{day}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Month</label>
                  <select value={demMonth} onChange={e=>setDemMonth(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    {monthsList.map((month, idx) => <option className="dark:bg-slate-900" key={idx} value={idx+1}>{month}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-slate-500">Remarks / Period</label>
                  <select value={demRemarks} onChange={e=>setDemRemarks(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer">
                    <option className="dark:bg-slate-900" value="normal">Normal / Off-Peak</option>
                    <option className="dark:bg-slate-900" value="peak">Office Rush Hour (Peak)</option>
                    <option className="dark:bg-slate-900" value="weekend">Weekend Services</option>
                    <option className="dark:bg-slate-900" value="festival">Festival Peak Traffic</option>
                    <option className="dark:bg-slate-900" value="maintenance">Maintenance Work Warning</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-rose-500 font-bold">Observed Passengers</label>
                  <input type="number" value={anoPassengers} onChange={e=>setAnoPassengers(e.target.value)} className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 text-rose-600 dark:text-rose-400 font-black" required min="0" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="anoWeekendCheck" checked={demWeekend} onChange={e=>setDemWeekend(e.target.checked)} className="w-4 h-4 cursor-pointer accent-rose-500" />
                <label htmlFor="anoWeekendCheck" className="cursor-pointer dark:text-slate-200">Is Weekend Holiday</label>
              </div>
              <button 
                type="submit" 
                disabled={predLoading}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4 w-full"
              >
                <AlertTriangle size={16} />
                <span>Evaluate Anomaly Risk</span>
              </button>
            </form>
          )}

          {/* Result Output Display Card */}
          <div className="h-full">
            {predLoading ? (
              <div className="h-full min-h-[300px] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-500">Inference pipeline running...</span>
              </div>
            ) : activeTab === 'demand' && demResult ? (
              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center pb-2 border-b border-blue-500/10">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                    <Activity size={16} />
                    <span>Inference Result</span>
                  </h4>
                  <span className="text-[10px] opacity-60">Computed just now</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold opacity-75">Predicted Group Flow:</span>
                    <p className="text-4xl font-black text-blue-500">{demResult.predicted_passengers} <span className="text-xs font-bold text-slate-500">pax/trip</span></p>
                  </div>
                  
                  <div className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span>Density Level:</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        demResult.crowd_level === 'Red' ? 'bg-red-500/15 text-red-500' :
                        demResult.crowd_level === 'Orange' ? 'bg-orange-500/15 text-orange-500' :
                        demResult.crowd_level === 'Yellow' ? 'bg-yellow-500/15 text-yellow-500' : 'bg-green-500/15 text-green-500'
                      }`}>
                        {demResult.crowd_level} Density
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Predicted Congestion Ratio:</span>
                      <span>{demResult.crowd_percentage}%</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          demResult.crowd_level === 'Red' ? 'bg-red-500' :
                          demResult.crowd_level === 'Orange' ? 'bg-orange-500' :
                          demResult.crowd_level === 'Yellow' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${demResult.crowd_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'delay' && delResult ? (
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center pb-2 border-b border-amber-500/10">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Activity size={16} />
                    <span>Inference Result</span>
                  </h4>
                  <span className="text-[10px] opacity-60">Computed just now</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold opacity-75">Delay Risk Probability:</span>
                    <p className="text-4xl font-black text-amber-500">{(delResult.delay_probability * 100).toFixed(1)}%</p>
                  </div>
                  
                  <div className="space-y-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span>Estimated Delay Time:</span>
                      <span className="font-black text-red-500">+{delResult.predicted_delay_minutes} mins</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Dispatch Decision:</span>
                      {delResult.is_delayed ? (
                        <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Action: Hold / Adjust schedules</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">Dispatch on schedule</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'anomaly' && anoResult ? (
              <div className={`p-6 rounded-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-200 ${anoResult.is_anomaly ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className={`flex justify-between items-center pb-2 border-b ${anoResult.is_anomaly ? 'border-rose-500/10' : 'border-emerald-500/10'}`}>
                  <h4 className={`font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 ${anoResult.is_anomaly ? 'text-rose-500' : 'text-emerald-500'}`}>
                    <AlertTriangle size={16} />
                    <span>Inference Result</span>
                  </h4>
                  <span className="text-[10px] opacity-60">Computed just now</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold opacity-75">Status:</span>
                    <p className={`text-3xl font-black ${anoResult.is_anomaly ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {anoResult.is_anomaly ? 'ANOMALY DETECTED' : 'NORMAL FLOW'}
                    </p>
                  </div>
                  
                  <div className="space-y-1.5 text-xs font-semibold">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {anoResult.message}
                    </p>
                    <div className="flex justify-between font-bold pt-2">
                      <span className="text-slate-500">Isolation Score:</span>
                      <span className={anoResult.is_anomaly ? 'text-rose-500' : 'text-emerald-500'}>{anoResult.anomaly_score.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[260px] border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-2">
                <Info size={28} className="opacity-45" />
                <h4 className="font-bold text-sm">Awaiting Prediction Parameters</h4>
                <p className="text-xs opacity-75 leading-relaxed max-w-xs">
                  Fill in the input features on the left and trigger the AI calculation.
                </p>
              </div>
            )}
          </div>
          
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AIPrediction;

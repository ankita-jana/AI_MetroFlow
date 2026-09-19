import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { CalendarRange, Plus, Edit, Trash2, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const Scheduling = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, Filter, Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('All');
  const [filterTrain, setFilterTrain] = useState('All');
  const [sortBy, setSortBy] = useState('time'); // 'time', 'train', 'station', 'delay'
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Optimization State
  const [selectedRoute, setSelectedRoute] = useState('');
  const [optInterval, setOptInterval] = useState(5);
  const [optimizationResult, setOptimizationResult] = useState(null);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSchedId, setEditingSchedId] = useState('');
  
  const [formTrainId, setFormTrainId] = useState('');
  const [formRouteId, setFormRouteId] = useState('');
  const [formStationId, setFormStationId] = useState('');
  const [formPlatform, setFormPlatform] = useState(1);
  const [formArrival, setFormArrival] = useState('08:00');
  const [formDeparture, setFormDeparture] = useState('08:02');
  const [formDelay, setFormDelay] = useState(0);

  const fetchData = async () => {
    try {
      const [sRes, rRes, tRes, stRes] = await Promise.all([
        api.get('/schedules?limit=50'),
        api.get('/trains?limit=50'), // we can get routes from trains route_id or directly
        api.get('/trains?limit=50'),
        api.get('/stations?limit=100')
      ]);
      setSchedules(sRes.data.data);
      setTrains(tRes.data.data);
      setStations(stRes.data.data);
      
      // Get unique routes
      const uniqueRoutesMap = {};
      tRes.data.data.forEach(t => {
        if (t.route_id && t.route_name) {
          uniqueRoutesMap[t.route_id] = t.route_name;
        }
      });
      setRoutes(Object.keys(uniqueRoutesMap).map(id => ({ id, name: uniqueRoutesMap[id] })));
      if (Object.keys(uniqueRoutesMap).length > 0) {
        setSelectedRoute(Object.keys(uniqueRoutesMap)[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch schedule data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules', {
        train_id: formTrainId,
        route_id: formRouteId,
        station_id: formStationId,
        platform: parseInt(formPlatform),
        scheduled_arrival: formArrival,
        scheduled_departure: formDeparture,
        delay_min: 0,
        status: "On Time"
      });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create schedule');
    }
  };

  const handleOpenEdit = (sched) => {
    setEditingSchedId(sched.id);
    setFormPlatform(sched.platform);
    setFormArrival(sched.scheduled_arrival);
    setFormDeparture(sched.scheduled_departure);
    setFormDelay(sched.delay_min);
    setShowEditForm(true);
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/schedules/${editingSchedId}`, {
        platform: parseInt(formPlatform),
        scheduled_arrival: formArrival,
        scheduled_departure: formDeparture,
        delay_min: parseInt(formDelay)
      });
      setShowEditForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete schedule');
    }
  };

  const runFrequencyOptimizer = async () => {
    if (!selectedRoute) return;
    try {
      const response = await api.post('/schedules/optimize-frequency', {
        route_id: selectedRoute,
        target_interval_minutes: parseInt(optInterval)
      });
      setOptimizationResult(response.data);
    } catch (err) {
      alert('Failed to calculate optimized schedules.');
    }
  };

  const filteredAndSortedSchedules = useMemo(() => {
    let result = [...schedules];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s => 
        (s.train_number && s.train_number.toLowerCase().includes(q)) ||
        (s.route_name && s.route_name.toLowerCase().includes(q)) ||
        (s.station_name && s.station_name.toLowerCase().includes(q))
      );
    }

    if (filterStation !== 'All') {
      result = result.filter(s => s.station_name === filterStation);
    }

    if (filterTrain !== 'All') {
      result = result.filter(s => s.train_number === filterTrain);
    }

    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'time') {
        valA = a.scheduled_departure || '';
        valB = b.scheduled_departure || '';
      } else if (sortBy === 'train') {
        valA = a.train_number || '';
        valB = b.train_number || '';
      } else if (sortBy === 'station') {
        valA = a.station_name || '';
        valB = b.station_name || '';
      } else if (sortBy === 'delay') {
        valA = a.delay_min || 0;
        valB = b.delay_min || 0;
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [schedules, searchTerm, filterStation, filterTrain, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) return <div className="text-center py-20 font-semibold">Loading Schedules...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">Train Scheduling & Dispatch</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Create timetables, manage platforms, log delays, and optimize dispatch intervals.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              if (trains.length > 0 && stations.length > 0) {
                setFormTrainId(trains[0].id);
                setFormRouteId(trains[0].route_id);
                setFormStationId(stations[0].id);
                setShowAddForm(true);
              } else {
                alert("Please add stations and trains first.");
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-violet-500/25"
          >
            <Plus size={16} />
            <span>Create Timetable</span>
          </button>
        )}
      </div>

      {/* Main Grid: Timetable + Frequency Optimizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timetable List (Takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <GlassmorphicCard className="space-y-4" hoverEffect={false}>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CalendarRange size={18} className="text-blue-500" />
                <span>Timetable Schedules</span>
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 w-32 text-slate-800 dark:text-slate-200"
                />
                <select 
                  value={filterStation} 
                  onChange={e => setFilterStation(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 max-w-[120px] truncate text-slate-800 dark:text-slate-200"
                >
                  <option className="dark:bg-slate-900" value="All">All Stations</option>
                  {[...new Set(schedules.map(s => s.station_name))].filter(Boolean).map(st => (
                    <option className="dark:bg-slate-900" key={st} value={st}>{st}</option>
                  ))}
                </select>
                <select 
                  value={filterTrain} 
                  onChange={e => setFilterTrain(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 max-w-[100px] truncate text-slate-800 dark:text-slate-200"
                >
                  <option className="dark:bg-slate-900" value="All">All Trains</option>
                  {[...new Set(schedules.map(s => s.train_number))].filter(Boolean).map(tr => (
                    <option className="dark:bg-slate-900" key={tr} value={tr}>{tr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-500/5 to-cyan-500/5">
                    <th className="pb-3 font-bold cursor-pointer hover:text-blue-500" onClick={() => toggleSort('train')}>Train {sortBy === 'train' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                    <th className="pb-3 font-bold">Route</th>
                    <th className="pb-3 font-bold cursor-pointer hover:text-blue-500" onClick={() => toggleSort('station')}>Station {sortBy === 'station' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                    <th className="pb-3 font-bold text-center">Plat</th>
                    <th className="pb-3 font-bold text-center cursor-pointer hover:text-blue-500" onClick={() => toggleSort('time')}>Sched Dep {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                    <th className="pb-3 font-bold text-center cursor-pointer hover:text-blue-500" onClick={() => toggleSort('delay')}>Delay {sortBy === 'delay' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                    <th className="pb-3 font-bold text-center">Status</th>
                    {isAdmin && <th className="pb-3 font-bold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {filteredAndSortedSchedules.map((sched) => (
                    <tr key={sched.id} className="table-row-colorful">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{sched.train_number || 'TR-01'}</td>
                      <td className="py-3 opacity-85 dark:opacity-100 truncate max-w-[120px]">{sched.route_name || 'Red Line'}</td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-white">{sched.station_name || 'Welcome'}</td>
                      <td className="py-3 text-center font-bold text-slate-500 dark:text-slate-400">{sched.platform}</td>
                      <td className="py-3 text-center font-bold text-blue-500">{sched.scheduled_departure}</td>
                      <td className="py-3 text-center font-semibold text-orange-500">{sched.delay_min > 0 ? `+${sched.delay_min}m` : '-'}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sched.status === 'On Time' ? 'badge-gradient-emerald' : 'badge-gradient-red'
                        }`}>
                          {sched.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenEdit(sched)} className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:text-blue-500 transition-colors text-slate-600 dark:text-slate-300">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteSchedule(sched.id)} className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:text-red-500 transition-colors text-slate-600 dark:text-slate-300">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassmorphicCard>
        </div>

        {/* AI Frequency Optimizer Side panel */}
        <div className="space-y-6">
          <GlassmorphicCard className="space-y-4" hoverEffect={false} gradient="primary">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap size={18} className="text-yellow-500 animate-pulse" />
              <span>AI Frequency Optimizer</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Analyzes historical crowd densities and suggests optimal train dispatch headway intervals.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">Target Line/Route</label>
                <select 
                  value={selectedRoute} 
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 font-semibold text-slate-800 dark:text-slate-200"
                >
                  {routes.map(r => (
                    <option className="dark:bg-slate-900" key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">Headway Interval (mins)</label>
                <input 
                  type="number"
                  min="2"
                  max="30"
                  value={optInterval}
                  onChange={(e) => setOptInterval(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>

              <button 
                onClick={runFrequencyOptimizer}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all"
              >
                <Zap size={16} />
                <span>Optimize Frequencies</span>
              </button>
            </div>

            {/* Optimization Results display */}
            {optimizationResult && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Headway Recommendations</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {optimizationResult.recommendations.map((rec, i) => (
                    <div key={i} className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-850 bg-slate-200/20 dark:bg-slate-900/30 text-xs border-l-4 border-l-violet-500">
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span>{rec.period}</span>
                        {rec.is_peak ? (
                          <span className="badge-gradient-red text-[10px] px-1.5 py-0.5 rounded uppercase font-black">Peak</span>
                        ) : (
                          <span className="badge-gradient-emerald text-[10px] px-1.5 py-0.5 rounded uppercase font-black">Off-Peak</span>
                        )}
                      </div>
                      <div className="flex justify-between opacity-80 dark:opacity-100 mt-1.5">
                        <span>Recommended Headway:</span>
                        <span className="font-black text-blue-500">{rec.recommended_headway_minutes} mins</span>
                      </div>
                      <div className="flex justify-between opacity-80 dark:opacity-100 mt-1">
                        <span>Train Requirement:</span>
                        <span className="font-bold">{rec.required_trains} trains</span>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-500">
                        <span>Status: {rec.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassmorphicCard>
        </div>
      </div>

      {/* Forms Overlay Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 border-t-4 border-t-transparent bg-clip-padding" style={{borderImage: 'linear-gradient(to right, #7c3aed, #06b6d4) 1'}}>
            <h3 className="font-bold text-lg">Add Schedule</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">Select Train</label>
                <select value={formTrainId} onChange={(e) => {
                  setFormTrainId(e.target.value);
                  const selected = trains.find(t => t.id === e.target.value);
                  if (selected) setFormRouteId(selected.route_id);
                }} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200">
                  {trains.map(t => <option className="dark:bg-slate-900" key={t.id} value={t.id}>{t.train_number} - {t.train_name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">Select Station</label>
                <select value={formStationId} onChange={(e) => setFormStationId(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200">
                  {stations.map(s => <option className="dark:bg-slate-900" key={s.id} value={s.id}>{s.name} ({s.line})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400">Platform</label>
                  <input type="number" min="1" value={formPlatform} onChange={(e) => setFormPlatform(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400">Arrival</label>
                  <input type="text" placeholder="08:00" value={formArrival} onChange={(e) => setFormArrival(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400">Departure</label>
                  <input type="text" placeholder="08:02" value={formDeparture} onChange={(e) => setFormDeparture(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-violet-500/25">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 border-t-4 border-t-transparent bg-clip-padding" style={{borderImage: 'linear-gradient(to right, #7c3aed, #06b6d4) 1'}}>
            <h3 className="font-bold text-lg">Modify Platform / Delay</h3>
            <form onSubmit={handleUpdateSchedule} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400">Platform</label>
                  <input type="number" min="1" value={formPlatform} onChange={(e) => setFormPlatform(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400">Delay minutes</label>
                  <input type="number" min="0" value={formDelay} onChange={(e) => setFormDelay(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-orange-500 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400">Arrival Time</label>
                  <input type="text" value={formArrival} onChange={(e) => setFormArrival(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label className="text-slate-500 dark:text-slate-400">Departure Time</label>
                  <input type="text" value={formDeparture} onChange={(e) => setFormDeparture(e.target.value)} className="w-full p-2 bg-slate-100 dark:bg-white/5 rounded border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 text-slate-800 dark:text-slate-200" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowEditForm(false)} className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-violet-500/25">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Scheduling;

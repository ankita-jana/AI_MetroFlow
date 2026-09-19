import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { Train, Plus, Edit, Trash2, Search, SlidersHorizontal } from 'lucide-react';

const TrainsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isOperator = user?.role === 'Operator' || user?.role === 'Metro Operator';
  const canModify = isAdmin || isOperator;

  const [trains, setTrains] = useState([]);
  const [routes, setRoutes] = useState([]);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  
  const [formNumber, setFormNumber] = useState('');
  const [formName, setFormName] = useState('');
  const [formRouteId, setFormRouteId] = useState('');
  const [formCapacity, setFormCapacity] = useState(1200);
  const [formOccupancy, setFormOccupancy] = useState(0);
  const [formStatus, setFormStatus] = useState('Standing By');
  const [formArrival, setFormArrival] = useState('06:00');
  const [formDeparture, setFormDeparture] = useState('23:00');

  const fetchData = async () => {
    setLoading(true);
    try {
      const tRes = await api.get('/trains', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined
        }
      });
      setTrains(tRes.data.data);

      // Fetch routes to populate the dropdown
      const stationResponse = await api.get('/stations'); // We can parse routes
      // Mock routes from schedules if routes API is too deep, but backend seeder did seed db.routes
      // Let's query routes from schedules or backend seeder
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutesDropdown = async () => {
    try {
      // Find all routes in database
      const schedulesRes = await api.get('/schedules?limit=100');
      const uniqueRoutesMap = {};
      schedulesRes.data.data.forEach(s => {
        if (s.route_id && s.route_name) {
          uniqueRoutesMap[s.route_id] = s.route_name;
        }
      });
      setRoutes(Object.keys(uniqueRoutesMap).map(id => ({ id, name: uniqueRoutesMap[id] })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRoutesDropdown();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenCreate = () => {
    if (routes.length === 0) {
      alert("No lines/routes found to assign the train to. Make sure stations and routes are seeded.");
      return;
    }
    setIsEditing(false);
    setFormNumber('');
    setFormName('');
    setFormRouteId(routes[0].id);
    setFormCapacity(1200);
    setFormOccupancy(0);
    setFormStatus('Standing By');
    setFormArrival('06:00');
    setFormDeparture('23:00');
    setShowForm(true);
  };

  const handleOpenEdit = (t) => {
    setIsEditing(true);
    setSelectedId(t.id);
    setFormNumber(t.train_number);
    setFormName(t.train_name);
    setFormRouteId(t.route_id);
    setFormCapacity(t.capacity);
    setFormOccupancy(t.current_occupancy);
    setFormStatus(t.status);
    setFormArrival(t.arrival_time);
    setFormDeparture(t.departure_time);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      train_number: formNumber,
      train_name: formName,
      route_id: formRouteId,
      capacity: parseInt(formCapacity),
      current_occupancy: parseInt(formOccupancy),
      status: formStatus,
      arrival_time: formArrival,
      departure_time: formDeparture
    };

    try {
      if (isEditing) {
        await api.put(`/trains/${selectedId}`, payload);
      } else {
        await api.post('/trains', payload);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this train?")) return;
    try {
      await api.delete(`/trains/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">Train Fleet Registry</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Database of rolling stock assets, passenger capacities, and service schedules.
          </p>
        </div>
        {canModify && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40"
          >
            <Plus size={16} />
            <span>Add Train</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <GlassmorphicCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4" hoverEffect={false}>
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search train by number or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 text-slate-800 dark:text-slate-200"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-xs font-bold text-white transition-all duration-300">Search</button>
        </form>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="opacity-60" />
            <span className="font-bold opacity-60">Status:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none cursor-pointer font-semibold transition-all duration-300 text-slate-800 dark:text-slate-200"
          >
            <option className="dark:bg-slate-900" value="">All Statuses</option>
            <option className="dark:bg-slate-900" value="In Service">In Service</option>
            <option className="dark:bg-slate-900" value="Standing By">Standing By</option>
            <option className="dark:bg-slate-900" value="Out of Service">Out of Service</option>
            <option className="dark:bg-slate-900" value="Maintenance">Maintenance</option>
          </select>
        </div>
      </GlassmorphicCard>

      {/* Trains list Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="lg:col-span-3 py-20 text-center text-xs font-semibold">Loading trains from database...</div>
        ) : trains.length === 0 ? (
          <div className="lg:col-span-3 py-20 text-center text-xs text-slate-500 font-semibold">No trains registered.</div>
        ) : (
          trains.map((t) => {
            const loadPct = Math.round((t.current_occupancy / t.capacity) * 100);
            const cardGradient = t.status === 'In Service' ? 'emerald' : t.status === 'Standing By' ? 'cyan' : t.status === 'Maintenance' ? 'amber' : 'red';
            
            return (
              <GlassmorphicCard key={t.id} gradient={cardGradient} glow className="space-y-4 flex flex-col justify-between h-full hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-lg flex items-center gap-2">
                      <Train size={18} className="text-blue-500" />
                      <span>{t.train_number}</span>
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'In Service' ? 'badge-gradient-emerald' :
                      t.status === 'Standing By' ? 'badge-gradient-cyan' :
                      t.status === 'Maintenance' ? 'badge-gradient-amber' : 'badge-gradient-red'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold space-y-1.5">
                    <div className="flex justify-between">
                      <span className="opacity-60">Train Name:</span>
                      <span>{t.train_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Assigned Route:</span>
                      <span className="text-blue-500 truncate max-w-[150px]">{t.route_name || 'Red Line'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Active hours:</span>
                      <span>{t.arrival_time} - {t.departure_time}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-200 dark:border-white/10 pt-3.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="opacity-60">Occupancy load:</span>
                    <span>{t.current_occupancy} / {t.capacity} ({loadPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        loadPct > 85 ? 'bg-gradient-to-r from-red-500 to-rose-500' : loadPct > 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>

                  {canModify && (
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => handleOpenEdit(t)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-violet-500/20 hover:text-violet-400 border border-slate-200 dark:border-white/8 text-slate-600 dark:text-slate-300 transition-all duration-300 text-[10px] font-bold flex items-center gap-1">
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-slate-200 dark:border-white/8 text-slate-600 dark:text-slate-300 transition-all duration-300 text-[10px] font-bold flex items-center gap-1">
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </GlassmorphicCard>
            );
          })
        )}
      </div>

      {/* Editor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl shadow-violet-500/10 space-y-4">
            <h3 className="font-bold text-lg gradient-text">{isEditing ? 'Modify Train Record' : 'Register New Train'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Train Number</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="TR-RED-05"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value.toUpperCase())}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none disabled:opacity-50 transition-all duration-300 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Train Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Red Speedster"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500">Route Assignment</label>
                  <select
                    value={formRouteId}
                    onChange={(e) => setFormRouteId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none cursor-pointer transition-all duration-300 text-slate-800 dark:text-slate-200"
                  >
                    {routes.map(r => <option className="dark:bg-slate-900" key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500">Maximum Capacity</label>
                  <input
                    type="number"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-500">Occupancy</label>
                  <input
                    type="number"
                    value={formOccupancy}
                    onChange={(e) => setFormOccupancy(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500">Service Start</label>
                  <input
                    type="text"
                    placeholder="06:00"
                    value={formArrival}
                    onChange={(e) => setFormArrival(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-500">Service End</label>
                  <input
                    type="text"
                    placeholder="23:00"
                    value={formDeparture}
                    onChange={(e) => setFormDeparture(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all duration-300 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500">Operational Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none cursor-pointer transition-all duration-300"
                >
                  <option className="dark:bg-slate-900" value="In Service">In Service</option>
                  <option className="dark:bg-slate-900" value="Standing By">Standing By</option>
                  <option className="dark:bg-slate-900" value="Out of Service">Out of Service</option>
                  <option className="dark:bg-slate-900" value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/8 transition-all duration-300 text-slate-600 dark:text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold transition-all duration-300 shadow-lg shadow-violet-500/25">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainsPage;

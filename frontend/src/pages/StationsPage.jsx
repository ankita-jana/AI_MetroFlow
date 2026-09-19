import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { Building2, Search, Plus, Edit, Trash2, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const StationsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isOperator = user?.role === 'Operator' || user?.role === 'Metro Operator';
  const canModify = isAdmin || isOperator;

  const [stations, setStations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formLine, setFormLine] = useState('');
  const [formZone, setFormZone] = useState('Delhi NCR');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formStatus, setFormStatus] = useState('Active');

  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/stations', {
        params: {
          search: search || undefined,
          line: lineFilter || undefined,
          status: statusFilter || undefined,
          page,
          limit
        }
      });
      setStations(response.data.data);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [page, lineFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStations();
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormCode('');
    setFormName('');
    setFormLine('Red line');
    setFormZone('Delhi NCR');
    setFormLat('28.6');
    setFormLng('77.2');
    setFormStatus('Active');
    setShowForm(true);
  };

  const handleOpenEdit = (station) => {
    setIsEditing(true);
    setSelectedId(station.id);
    setFormCode(station.station_code);
    setFormName(station.name);
    setFormLine(station.line);
    setFormZone(station.zone);
    setFormLat(station.latitude);
    setFormLng(station.longitude);
    setFormStatus(station.status);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      station_code: formCode,
      name: formName,
      line: formLine,
      zone: formZone,
      platforms: [1, 2],
      latitude: parseFloat(formLat),
      longitude: parseFloat(formLng),
      status: formStatus
    };

    try {
      if (isEditing) {
        await api.put(`/stations/${selectedId}`, payload);
      } else {
        await api.post('/stations', payload);
      }
      setShowForm(false);
      fetchStations();
    } catch (err) {
      alert(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this station?")) return;
    try {
      await api.delete(`/stations/${id}`);
      fetchStations();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const linesList = ["Red line", "Yellow line", "Blue line", "Pink line", "Magenta line", "Violet line", "Green line", "Aqua line", "Rapid Metro"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">Stations Registry</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Database of physical assets, platform layouts, and lines associations.
          </p>
        </div>
        {canModify && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 font-bold text-xs text-white flex items-center gap-2 shadow-lg shadow-violet-500/25"
          >
            <Plus size={16} />
            <span>Add Station</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <GlassmorphicCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4" hoverEffect={false}>
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search station by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-slate-800 dark:text-slate-200"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-xs font-bold text-white shadow-lg shadow-violet-500/25 transition-all">Search</button>
        </form>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="opacity-60 dark:opacity-100" />
            <span className="font-bold opacity-60 dark:opacity-100">Filters:</span>
          </div>

          <select
            value={lineFilter}
            onChange={(e) => { setLineFilter(e.target.value); setPage(1); }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none cursor-pointer font-semibold transition-all text-slate-800 dark:text-slate-200"
          >
            <option value="" className="dark:bg-slate-900">All Lines</option>
            {linesList.map(l => <option key={l} value={l} className="dark:bg-slate-900">{l}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none cursor-pointer font-semibold transition-all text-slate-800 dark:text-slate-200"
          >
            <option value="" className="dark:bg-slate-900">All Statuses</option>
            <option value="Active" className="dark:bg-slate-900">Active</option>
            <option value="Inactive" className="dark:bg-slate-900">Inactive</option>
            <option value="Under Maintenance" className="dark:bg-slate-900">Under Maintenance</option>
          </select>
        </div>
      </GlassmorphicCard>

      {/* Table Card */}
      <GlassmorphicCard gradient="primary" hoverEffect={false}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-xs font-semibold animate-pulse">Loading stations from database...</div>
          ) : stations.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">No stations found matching criteria.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-500/5 to-cyan-500/5">
                  <th className="pb-3 font-bold">Station Code</th>
                  <th className="pb-3 font-bold">Name</th>
                  <th className="pb-3 font-bold">Line</th>
                  <th className="pb-3 font-bold">Zone</th>
                  <th className="pb-3 font-bold text-center">Platforms</th>
                  <th className="pb-3 font-bold">Coordinates</th>
                  <th className="pb-3 font-bold text-center">Status</th>
                  {canModify && <th className="pb-3 font-bold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {stations.map((s) => (
                  <tr key={s.id} className="table-row-colorful transition-all">
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">{s.station_code}</td>
                    <td className="py-3.5 font-bold text-sm text-slate-800 dark:text-white">{s.name}</td>
                    <td className="py-3.5 font-semibold text-blue-500">{s.line}</td>
                    <td className="py-3.5 opacity-75 dark:opacity-100">{s.zone}</td>
                    <td className="py-3.5 text-center font-bold">
                      {s.platforms && Array.isArray(s.platforms)
                        ? s.platforms.map(p => typeof p === 'object' ? (p.$numberInt || Object.values(p)[0]) : p).join(', ')
                        : 'N/A'}
                    </td>
                    <td className="py-3.5 opacity-65 dark:opacity-100 font-mono text-[10px]">{s.latitude?.toFixed?.(4) ?? s.latitude}, {s.longitude?.toFixed?.(4) ?? s.longitude}</td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'Active' ? 'badge-gradient-emerald' : s.status === 'Inactive' ? 'badge-gradient-red' : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    {canModify && (
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEdit(s)} className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:text-violet-500 hover:bg-violet-500/10 transition-all text-slate-600 dark:text-slate-300">
                            <Edit size={14} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => handleDelete(s.id)} className="p-1 rounded bg-slate-200 dark:bg-slate-800 hover:text-red-500 hover:bg-red-500/10 transition-all text-slate-600 dark:text-slate-300">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 text-xs font-semibold">
            <span className="opacity-60 dark:opacity-100">Showing {stations.length} of {total} stations</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border bg-slate-100 dark:bg-slate-900 hover:bg-violet-500/10 hover:border-violet-500/30 disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span>Page {page} of {pages}</span>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border bg-slate-100 dark:bg-slate-900 hover:bg-violet-500/10 hover:border-violet-500/30 disabled:opacity-40 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </GlassmorphicCard>

      {/* Editor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950/60 via-slate-950/60 to-violet-950/30 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">{isEditing ? 'Modify Station Listing' : 'Register New Station'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400">Station Code</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="ST-090"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all disabled:opacity-50 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400">Station Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Rajiv Chowk"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400">Metro Line</label>
                  <select
                    value={formLine}
                    onChange={(e) => setFormLine(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none cursor-pointer transition-all"
                  >
                    {linesList.map(l => <option key={l} value={l} className="dark:bg-slate-900">{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400">Operational Zone</label>
                  <input
                    type="text"
                    required
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 dark:text-slate-400">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/8 focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 dark:text-slate-400">Operational Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="Active" className="dark:bg-slate-900">Active</option>
                  <option value="Inactive" className="dark:bg-slate-900">Inactive</option>
                  <option value="Under Maintenance" className="dark:bg-slate-900">Under Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/25 transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationsPage;

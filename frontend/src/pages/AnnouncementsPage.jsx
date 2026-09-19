import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Calendar, AlertTriangle, CloudRain, Clock, Trash2 } from 'lucide-react';
import api from '../services/api';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { useAuth } from '../context/AuthContext';

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Emergency',
    priority: 'High',
    expiry_date: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.expiry_date) {
        payload.expiry_date = new Date(payload.expiry_date).toISOString();
      } else {
        delete payload.expiry_date;
      }
      
      const res = await api.post('/announcements', payload);
      setAnnouncements([res.data, ...announcements]);
      setShowModal(false);
      setFormData({ title: '', message: '', type: 'Emergency', priority: 'High', expiry_date: '' });
    } catch (error) {
      console.error("Failed to create announcement", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete announcement", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Emergency': return <AlertTriangle className="text-red-500" size={24} />;
      case 'Weather Warning': return <CloudRain className="text-blue-500" size={24} />;
      case 'Delay Notice': return <Clock className="text-orange-500" size={24} />;
      default: return <Megaphone className="text-violet-500" size={24} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            Announcement Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400">System-wide operational announcements and broadcasts.</p>
        </div>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <Plus size={18} />
            <span>New Broadcast</span>
          </button>
        )}
      </div>

      <GlassmorphicCard gradient="blue" className="min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Megaphone size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No active announcements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div 
                key={ann.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm relative group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50">
                      {getIcon(ann.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{ann.title}</h3>
                      <div className="flex gap-2 text-xs">
                        <span className="text-slate-500">{new Date(ann.created_date).toLocaleDateString()}</span>
                        <span className={`font-medium ${
                          ann.priority === 'Critical' ? 'text-red-500' :
                          ann.priority === 'High' ? 'text-orange-500' : 'text-blue-500'
                        }`}>• {ann.priority} Priority</span>
                      </div>
                    </div>
                  </div>
                  {user?.role === 'Admin' && (
                    <button 
                      onClick={() => handleDelete(ann.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 mb-4 leading-relaxed">
                  {ann.message}
                </p>
                
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                    {ann.type}
                  </span>
                  {ann.expiry_date && (
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-orange-500/10 text-orange-600 flex items-center gap-1">
                      <Calendar size={10} />
                      Expires: {new Date(ann.expiry_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassmorphicCard>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-gradient-to-r from-violet-500/10 to-cyan-500/10">
              <h3 className="font-bold text-lg">Broadcast Announcement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                  placeholder="e.g. Yellow Line Delays"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Message</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                  placeholder="Enter detailed message..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                  >
                    <option className="dark:bg-slate-900">Emergency</option>
                    <option className="dark:bg-slate-900">Platform Change</option>
                    <option className="dark:bg-slate-900">Delay Notice</option>
                    <option className="dark:bg-slate-900">Maintenance</option>
                    <option className="dark:bg-slate-900">Weather Warning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                  >
                    <option className="dark:bg-slate-900">Normal</option>
                    <option className="dark:bg-slate-900">High</option>
                    <option className="dark:bg-slate-900">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Expiry Date (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 rounded-lg font-bold bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/25"
                >
                  Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;

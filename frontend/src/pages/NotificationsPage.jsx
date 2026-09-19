import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ShieldAlert, Activity, AlertTriangle, AlertCircle, Users } from 'lucide-react';
import api from '../utils/api';
import GlassmorphicCard from '../components/GlassmorphicCard';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const getIcon = (type) => {
    if (type.includes("Crowd") || type.includes("Overcrowding")) return <Users className="text-orange-500" size={20} />;
    if (type.includes("Delay")) return <Activity className="text-amber-500" size={20} />;
    if (type.includes("Emergency")) return <ShieldAlert className="text-red-500" size={20} />;
    return <AlertCircle className="text-cyan-500" size={20} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            Notification Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400">View and manage your real-time system alerts.</p>
        </div>
      </div>

      <GlassmorphicCard gradient="purple" className="min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Bell size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">You're all caught up!</p>
            <p className="text-sm">No notifications available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                  notif.is_read 
                    ? 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 opacity-70' 
                    : 'bg-white dark:bg-slate-800 border-violet-200 dark:border-violet-500/30 shadow-md shadow-violet-500/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${notif.is_read ? 'bg-slate-200 dark:bg-slate-700' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm mb-1 ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {notif.title || notif.type}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className={`px-2 py-0.5 rounded-md ${
                        notif.level === 'Critical' ? 'bg-red-500/10 text-red-500' : 
                        notif.level === 'Warning' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {notif.level}
                      </span>
                      <span className="text-slate-400">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-colors"
                      title="Mark as Read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassmorphicCard>
    </div>
  );
};

export default NotificationsPage;

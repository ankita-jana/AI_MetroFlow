import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [realTimeData, setRealTimeData] = useState({ stations: [], trains: [], alerts: [], timestamp: null });
  const [toasts, setToasts] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  
  // Track latest user object without triggering websocket reconnects
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Helper to remove toast
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to add toast
  const addToast = (message, level = 'Info', type = 'System') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, level, type, timestamp: new Date() };
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts
    
    // Auto remove after 15 seconds
    setTimeout(() => {
      removeToast(id);
    }, 15000);
  };

  const getWsUrl = () => {
    const wsBaseUrl =
      import.meta.env.VITE_WS_BASE_URL ||
      'ws://127.0.0.1:8000';
  
    return `${wsBaseUrl}/api/crowd/ws`;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
      return;
    }
  
    let reconnectTimeout;
    let shouldReconnect = true;
  
    const connect = () => {
      if (!shouldReconnect) return;
  
      const wsUrl = getWsUrl();
  
      console.log("Connecting to MetroFlow WebSocket:", wsUrl);
  
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
  
      ws.onopen = () => {
        console.log("Connected to MetroFlow WebSocket Server.");
        setWsConnected(true);
      };
  
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
  
          if (payload.type === 'init' || payload.type === 'update') {
            setRealTimeData(payload.data);
  
          } else if (payload.type === 'new_alert') {
            const alert = payload.data;
  
            const showNotifications =
              userRef.current?.settings?.notifications ?? true;
  
            if (showNotifications) {
              addToast(alert.message, alert.level, alert.type);
            }
  
            setRealTimeData((prev) => ({
              ...prev,
              alerts: [alert, ...prev.alerts].slice(0, 10)
            }));
  
          } else if (payload.type === 'new_notification') {
            const notif = payload.data;
  
            const showNotifications =
              userRef.current?.settings?.notifications ?? true;
  
            if (showNotifications) {
              addToast(
                notif.message,
                notif.level,
                notif.title || notif.type
              );
            }
  
          } else if (payload.type === 'emergency_announcement') {
            const ann = payload.data;
  
            const showNotifications =
              userRef.current?.settings?.notifications ?? true;
  
            if (showNotifications) {
              addToast(
                `ANNOUNCEMENT: ${ann.title} - ${ann.message}`,
                ann.priority === 'Critical' ? 'Critical' : 'Warning',
                'Announcement'
              );
            }
  
          } else if (payload.type === 'schedule_update') {
            const sched = payload.data;
  
            const showNotifications =
              userRef.current?.settings?.notifications ?? true;
  
            if (showNotifications) {
              addToast(
                `Schedule Updated: Train ${
                  sched.train_name || 'Train'
                } is now ${sched.status}`,
                'Info',
                'Schedule Update'
              );
            }
          }
  
        } catch (e) {
          console.error(
            "Error parsing WebSocket message:",
            e
          );
        }
      };
  
      ws.onclose = () => {
        console.log(
          "WebSocket disconnected."
        );
  
        setWsConnected(false);
  
        if (shouldReconnect) {
          console.log(
            "Retrying WebSocket connection in 5 seconds..."
          );
  
          reconnectTimeout = setTimeout(
            connect,
            5000
          );
        }
      };
  
      ws.onerror = (err) => {
        console.error(
          "MetroFlow WebSocket error:",
          err
        );
  
        setWsConnected(false);
      };
    };
  
    connect();
  
    return () => {
      shouldReconnect = false;
  
      clearTimeout(reconnectTimeout);
  
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
  
      setWsConnected(false);
    };
  
  }, [isAuthenticated]);

  return (
    <WebSocketContext.Provider value={{ realTimeData, toasts, wsConnected, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      {isAuthenticated && toasts.length > 0 && (
        <div className="fixed top-24 right-8 z-50 flex flex-col gap-2 max-w-sm w-full">
          {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`cursor-pointer p-4 rounded-xl shadow-lg border backdrop-blur-md flex flex-col gap-1 transition-all duration-300 transform translate-x-0 hover:scale-[1.02] ${
              toast.level === 'Critical'
                ? 'bg-red-950/45 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                : toast.level === 'Warning'
                ? 'bg-orange-950/30 border-orange-500/50 text-orange-100 shadow-[0_0_10px_rgba(249,115,22,0.15)] animate-pulse'
                : 'bg-slate-900/65 border-white/5 text-slate-100 animate-pulse'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                toast.level === 'Critical' ? 'text-red-400' : toast.level === 'Warning' ? 'text-orange-400' : 'text-blue-400'
              }`}>
                {toast.type} - {toast.level}
              </span>
              <span className="text-[10px] opacity-60">
                {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
        </div>
      )}
    </WebSocketContext.Provider>
  );
};

export const useWebSockets = () => useContext(WebSocketContext);
export default WebSocketContext;

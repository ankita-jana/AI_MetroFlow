import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWebSockets } from '../context/WebSocketContext';
import { Sun, Moon, Bell, Shield, Wifi, WifiOff, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleMobileMenu }) => {
  const { isDark, toggleTheme } = useTheme();
  const { realTimeData, wsConnected } = useWebSockets();
  const [showAlerts, setShowAlerts] = useState(false);

  const activeAlerts = realTimeData?.alerts || [];

  return (
    <header className="h-16 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between gap-8 px-4 sm:px-8 fixed top-0 right-0 left-0 md:left-64 z-20 transition-colors duration-500">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-cyan-500/10 text-slate-800 dark:text-white transition-all duration-200"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-bold text-slate-900 dark:text-white hidden sm:block">
          <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">AI MetroFlow</span>
          <span className="text-slate-600 dark:text-slate-300"> Operations Center</span>
        </h2>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* WebSocket Connection Status */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
          wsConnected 
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-500/10' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {wsConnected ? (
            <>
              <Wifi size={14} className="animate-pulse" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-700 dark:text-white hover:bg-gradient-to-r hover:from-amber-500/15 hover:to-orange-500/15 hover:text-amber-600 dark:hover:text-amber-500 transition-all duration-200"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Alerts Bell Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-red-500/15 hover:to-rose-500/15 hover:text-red-500 transition-all relative duration-200"
            title="System Alerts"
          >
            <Bell size={20} />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-ping shadow-lg shadow-red-500/50" />
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl glass-panel border border-[var(--border)] py-3 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 pb-2 border-b border-[var(--border)] flex justify-between items-center">
                <span className="font-bold text-sm gradient-text">System Alerts ({activeAlerts.length})</span>
                <Link to="/alerts" onClick={() => setShowAlerts(false)} className="text-xs text-cyan-500 hover:text-cyan-400 hover:underline font-bold">
                  View All
                </Link>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No active system alerts.
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="px-4 py-3 hover:bg-gradient-to-r hover:from-violet-500/5 hover:to-cyan-500/5 border-b border-[var(--border)] last:border-b-0 flex flex-col gap-1 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          alert.level === 'Critical' ? 'badge-gradient-red' : 'badge-gradient-amber'
                        }`}>
                          {alert.type}
                        </span>
                        <span className="text-[9px] opacity-60 dark:opacity-100">
                          {alert.timestamp.includes('T') ? alert.timestamp.split('T')[1].substring(0, 8) : 'Now'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

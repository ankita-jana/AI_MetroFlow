import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Shield, Mail, Calendar, Settings, ChevronRight } from 'lucide-react';
import GlassmorphicCard from '../components/GlassmorphicCard';

const Profile = () => {
  const { user } = useAuth();
  
  const userRole = user?.role || 'Guest';

  // System permissions descriptions based on role
  const getPrivilegeDescription = () => {
    switch(userRole) {
      case 'Admin':
        return 'Full System Root Access: Manage all operational configurations, register train dispatches, modify station sequence rules, and configure employee directories.';
      case 'Metro Operator':
        return 'Standard Operator Access: Update passenger schedules, assign tracks/platforms, manage delays, and trigger active station notifications.';
      case 'Analyst':
        return 'Data & Analytics Clearance: Access reports builder, download system metrics, export congestion history logs, and review ML forecast aggregates.';
      default:
        return 'Guest Access: View dashboard overview metrics.';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight gradient-text">
          User Profile
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          View your console access credentials and clearance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Left */}
        <GlassmorphicCard className="md:col-span-1 flex flex-col items-center text-center justify-center p-8 space-y-4" hoverEffect={false} gradient="primary">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center font-black text-white text-3xl shadow-lg shadow-violet-500/30 relative">
            {user?.name?.charAt(0) || 'U'}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 opacity-30 blur-md animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate max-w-full">{user?.name}</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-300 mt-1">{user?.email}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            userRole === 'Admin' 
              ? 'badge-gradient-violet text-violet-600 dark:text-violet-300' 
              : userRole === 'Metro Operator'
              ? 'badge-gradient-cyan text-cyan-600 dark:text-cyan-300'
              : 'badge-gradient-emerald text-emerald-600 dark:text-emerald-300'
          }`}>
            {userRole}
          </span>
        </GlassmorphicCard>

        {/* Profile Details Right */}
        <div className="md:col-span-2 space-y-6">
          <GlassmorphicCard className="space-y-6" hoverEffect={false} gradient="primary">
            <h3 className="font-bold text-base border-b border-slate-200 dark:border-white/5 pb-2">Credentials Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1 p-3 rounded-xl bg-gradient-to-br from-violet-500/5 to-transparent border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Full Name</span>
                <p className="text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                  <User size={14} className="text-violet-400" />
                  <span>{user?.name}</span>
                </p>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Email Address</span>
                <p className="text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 truncate">
                  <Mail size={14} className="text-cyan-400" />
                  <span>{user?.email}</span>
                </p>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Operational Clearance</span>
                <p className="text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                  <Shield size={14} className="text-emerald-400" />
                  <span>{userRole}</span>
                </p>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent border border-slate-200 dark:border-white/5">
                <span className="text-slate-500 dark:text-slate-400">Account Status</span>
                <p className="text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Active / In Service</span>
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Privileges Description</span>
              <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed font-semibold">
                {getPrivilegeDescription()}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex justify-end">
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/25 text-white font-extrabold text-xs transition-all active:scale-[0.97] cursor-pointer"
              >
                <Settings size={14} />
                <span>Configure Profile</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;

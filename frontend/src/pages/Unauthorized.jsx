import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import GlassmorphicCard from '../components/GlassmorphicCard';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6 relative overflow-hidden bg-[#05050e]">
      {/* Background Gradient Mesh */}
      <div className="gradient-mesh-bg absolute inset-0 z-0">
        <div className="blob blob-1" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)' }}></div>
        <div className="blob blob-2" style={{ width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(244, 63, 94, 0.18) 0%, transparent 70%)' }}></div>
        <div className="blob blob-3" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)' }}></div>
        <div className="blob blob-4" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)' }}></div>
      </div>

      <GlassmorphicCard className="max-w-md w-full text-center space-y-6 border-red-500/20 relative z-10" hoverEffect={false}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 animate-bounce">
            <ShieldAlert size={36} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight gradient-text">
            Access Denied
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
            Your active credentials do not have operational clearance to access this control room.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/25 text-white font-extrabold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default Unauthorized;

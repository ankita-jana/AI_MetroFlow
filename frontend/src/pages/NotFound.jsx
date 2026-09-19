import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import GlassmorphicCard from '../components/GlassmorphicCard';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05050e] p-6 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="gradient-mesh-bg">
        <div className="blob blob-1" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)' }}></div>
        <div className="blob blob-2" style={{ width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)' }}></div>
        <div className="blob blob-3" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)' }}></div>
        <div className="blob blob-4" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)' }}></div>
      </div>

      {/* Decorative floating gradient orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      <GlassmorphicCard className="max-w-md w-full text-center space-y-6 border-white/5 relative z-10" hoverEffect={false}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 animate-pulse relative">
            <HelpCircle size={36} />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 opacity-30 blur-md"></div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-black gradient-text select-none">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Station Not Found
          </h2>
          <p className="text-sm font-semibold text-slate-400 leading-relaxed">
            The page or route you are looking for does not exist on the MetroFlow operational map.
          </p>
        </div>

        {/* Decorative gradient divider */}
        <div className="flex justify-center">
          <div className="w-24 h-1 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 opacity-50"></div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/25 text-white font-extrabold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Navigate to Dashboard</span>
          </button>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default NotFound;

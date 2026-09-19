import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Train, Shield, TrendingUp, Sparkles, Activity, Brain } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password, role);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden bg-[#05050e]"
      style={{
        backgroundImage: "url('/metro_background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Left Side: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        
        {/* Top left Brand */}
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg text-white">
              <Train size={20} />
            </div>
            <span className="text-lg font-black tracking-widest text-white uppercase">AI MetroFlow</span>
          </div>

          {/* Center Brand Text */}
          <div className="space-y-6 max-w-xl mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              <Sparkles size={12} className="text-violet-400" /> AI-Powered Operations
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight">
              <span className="text-slate-200">AI Platform for</span><br/>
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Metro Crowd <br/>Management and</span><br/>
              <span className="text-slate-200">Scheduling</span>
            </h1>
            
            <p className="text-slate-300/80 text-sm leading-relaxed max-w-lg mt-6">
              Optimizing urban transit schedules, predicting station inflows, and coordinating fleet dispatches using deep reinforcement learning models and real-time WebSocket telemetries.
            </p>
          </div>
        </div>

        {/* Bottom section (Feature pills and footer) */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-xs font-bold text-white">
            <div className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all cursor-pointer">
              <Activity size={16} className="text-cyan-400" />
              <span>Real-time Density</span>
            </div>
            <div className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all cursor-pointer">
              <Brain size={16} className="text-violet-400" />
              <span>AI Demand Forecasts</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400/60 font-medium">
            &copy; 2026 AI MetroFlow. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Floating Sparkle Decoration */}
        <div className="absolute right-[10%] bottom-[15%] text-slate-400/30 animate-pulse pointer-events-none hidden lg:block">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" />
          </svg>
        </div>

        <div className="w-full max-w-[420px] bg-[#0f111a]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative">
          
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight !text-white mb-1">Sign In</h2>
            <p className="text-[13px] text-slate-400">Access operations management console</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Select Access Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['Admin', 'Operator', 'Analyst'].map((r) => {
                  const isActive = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-3 px-2 rounded-2xl border text-xs font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-violet-900/20 border-violet-500/50 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                          : 'bg-black/20 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-black/40'
                      }`}
                    >
                      {r === 'Admin' && <Shield size={16} className={isActive ? 'text-violet-400' : 'text-slate-500'} />}
                      {r === 'Operator' && <Train size={16} className={isActive ? 'text-violet-400' : 'text-slate-500'} />}
                      {r === 'Analyst' && <TrendingUp size={16} className={isActive ? 'text-violet-400' : 'text-slate-500'} />}
                      <span>{r}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@metroflow.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 text-[13px] focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/5 text-white placeholder-slate-600 text-[13px] focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.2)] active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block align-middle"></span>
              ) : (
                "Sign In"
              )}
            </button>
            
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">OR CONTINUE WITH</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="flex justify-center w-full">
                <div className="w-full" style={{ display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        setError('');
                        setLoading(true);
                        await googleLogin(credentialResponse.credential, role);
                        navigate('/');
                      } catch (err) {
                        console.error(err);
                        setError(err.response?.data?.detail || 'Google Login failed.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    onError={() => {
                      setError('Google Login Failed');
                    }}
                    theme="filled_black"
                    shape="pill"
                    width="350"
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="mt-6 text-center text-[12px] text-slate-400 font-medium">
            New account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

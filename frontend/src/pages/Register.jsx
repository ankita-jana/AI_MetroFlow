import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ShieldCheck, Train, ShieldAlert, Shield, TrendingUp } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Operator');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#05050e] p-6 relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="gradient-mesh-bg absolute inset-0 z-0">
        <div className="blob blob-1" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)' }}></div>
        <div className="blob blob-2" style={{ width: '550px', height: '550px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)' }}></div>
        <div className="blob blob-3" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)' }}></div>
      </div>

      <div className="m-auto w-full max-w-md bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-3xl p-6 sm:p-8 rounded-[2rem] border border-white/8 shadow-[0_0_80px_rgba(139,92,246,0.1)] relative overflow-hidden group z-10">
        
        {/* Glowing orbs */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-violet-500/15 rounded-full blur-[60px] pointer-events-none group-hover:bg-violet-500/25 transition-all duration-700"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>

        <div className="flex flex-col items-center gap-4 mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] text-white relative">
            <Train size={28} />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-cyan-500 blur-xl opacity-50"></div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tighter !text-white">
              Create Account
            </h2>
            <p className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mt-2 uppercase tracking-[0.2em]">
              Join AI MetroFlow Platform
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 text-red-200 text-xs font-semibold flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <div className="p-1.5 bg-red-500/20 rounded-lg">
              <ShieldAlert size={16} className="text-red-400" />
            </div>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-green-200 text-xs font-semibold flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Full Name</label>
            <div className="relative group/input">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-violet-400 transition-colors" size={18} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Email Address</label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-violet-400 transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-violet-500/50 focus:bg-white/8 focus:ring-4 focus:ring-violet-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Password</label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 focus:ring-4 focus:ring-cyan-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Select Operational Role</label>
            <div className="grid grid-cols-3 gap-3">
              {['Admin', 'Operator', 'Analyst'].map((r) => {
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-[0.96] ${
                      isActive
                        ? 'bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border-violet-500/50 text-white shadow-[0_0_24px_rgba(139,92,246,0.25)]'
                        : 'bg-white/3 border-white/5 text-slate-400 hover:text-white hover:bg-white/8 hover:border-white/12'
                    }`}
                  >
                    {r === 'Admin' && <Shield size={18} className={isActive ? 'text-violet-400' : 'text-slate-500'} />}
                    {r === 'Operator' && <Train size={18} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />}
                    {r === 'Analyst' && <TrendingUp size={18} className={isActive ? 'text-violet-400' : 'text-slate-500'} />}
                    <span className="tracking-wide">{r}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 hover:from-violet-500 hover:via-purple-400 hover:to-cyan-400 text-white font-black text-sm tracking-wide shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-4 btn-shimmer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/5 text-center text-xs text-slate-400 font-medium">
          <p className="flex items-center justify-center gap-1.5">
            <span>Already have an account?</span>
            <Link to="/login" className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent hover:from-cyan-300 hover:to-violet-300 hover:underline font-bold transition-all">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

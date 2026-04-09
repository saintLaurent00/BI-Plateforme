import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Mail, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-prism-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-prism-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-prism-200 mb-6 group hover:scale-110 transition-transform duration-500">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Superset Prism</h1>
          <p className="text-slate-500 font-medium mt-2">Enterprise Data Intelligence Platform</p>
        </div>

        {/* Login Card */}
        <div className="prism-card p-8 lg:p-10 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-prism-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-prism-600 hover:text-prism-700 uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-prism-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-prism-500 focus:ring-4 focus:ring-prism-500/10 rounded-xl text-sm transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-prism-600 hover:bg-prism-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-prism-200 active:scale-95 group"
            >
              Sign In to Prism
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-400">Or continue with SSO</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <Chrome className="w-4 h-4" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-medium">Enterprise-grade security enabled</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <button className="hover:text-slate-600 transition-colors">Privacy Policy</button>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <button className="hover:text-slate-600 transition-colors">Terms of Service</button>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <button className="hover:text-slate-600 transition-colors">Contact Support</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
import { supersetService } from '../services/supersetService';
import { toast } from 'sonner';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleSSO = async (provider: 'google' | 'github' | 'ldap') => {
    try {
      await supersetService.authenticateSSO(provider);
      toast.success(`Authentification ${provider.toUpperCase()} réussie`);
      onLogin();
    } catch (error) {
      toast.error(`Échec de l'authentification ${provider.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden text-slate-900">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-48 w-[800px] h-[800px] bg-prism-500/5 blur-[160px] rounded-full"></div>
        <div className="absolute -bottom-48 -right-48 w-[800px] h-[800px] bg-blue-500/5 blur-[160px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.01] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-prism-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-prism-200 mb-8 group hover:rotate-6 transition-transform duration-500"
          >
            <BarChart3 className="w-14 h-14 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-black text-slate-900 tracking-tighter"
          >
            Prism
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 font-bold mt-4 text-[10px] uppercase tracking-[0.4em]"
          >
            Intelligence Platform
          </motion.p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[48px] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-prism-400 via-prism-600 to-blue-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Work Identity</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-prism-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-prism-500/20 focus:ring-12 focus:ring-prism-500/5 rounded-3xl text-sm font-bold transition-all outline-none placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Key</label>
                <button type="button" className="text-[10px] font-black text-prism-600 hover:text-prism-700 uppercase tracking-widest transition-colors">Reset</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-prism-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-prism-500/20 focus:ring-12 focus:ring-prism-500/5 rounded-3xl text-sm font-bold transition-all outline-none placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-prism-600 hover:bg-prism-700 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl shadow-prism-200 active:scale-95 group"
            >
              Enter Workspace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]">
              <span className="bg-white px-8 text-slate-200">SSO Gateway</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <button 
              onClick={() => handleSSO('google')}
              className="flex flex-col items-center justify-center gap-3 py-5 bg-white border-2 border-slate-50 rounded-3xl text-[10px] font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-100 transition-all active:scale-95"
            >
              <Chrome className="w-6 h-6 text-slate-900" />
              Google
            </button>
            <button 
              onClick={() => handleSSO('github')}
              className="flex flex-col items-center justify-center gap-3 py-5 bg-white border-2 border-slate-50 rounded-3xl text-[10px] font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-100 transition-all active:scale-95"
            >
              <Github className="w-6 h-6 text-slate-900" />
              GitHub
            </button>
            <button 
              onClick={() => handleSSO('ldap')}
              className="flex flex-col items-center justify-center gap-3 py-5 bg-white border-2 border-slate-50 rounded-3xl text-[10px] font-black text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-100 transition-all active:scale-95"
            >
              <ShieldCheck className="w-6 h-6 text-slate-900" />
              LDAP
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quantum Security Active</span>
          </div>
          <div className="flex items-center gap-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            <button className="hover:text-prism-600 transition-colors">Privacy</button>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <button className="hover:text-prism-600 transition-colors">Terms</button>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <button className="hover:text-prism-600 transition-colors">Support</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

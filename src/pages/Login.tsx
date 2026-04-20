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
  ChevronRight,
  Database,
  Globe,
  Fingerprint
} from 'lucide-react';
import { supersetService } from '../services/supersetService';
import { toast } from 'sonner';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation d'une légère pause pour l'animation
    setTimeout(() => {
      onLogin();
      setIsSubmitting(false);
    }, 800);
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden text-slate-900 border-t-4 border-slate-900">
      {/* Background Grid - Subtil et technique */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ 
        backgroundImage: `radial-gradient(circle at 2px 2px, black 1px, transparent 0)`,
        backgroundSize: '32px 32px' 
      }}></div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-slate-100 relative z-10 transition-all">
        
        {/* Left Side - Brand & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-50 border-r border-slate-100 relative overflow-hidden">
          {/* Subtle noise pattern */}
          <div className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Prism</span>
            </div>

            <h2 className="text-4xl font-semibold leading-tight tracking-tight mb-6">
              L'intelligence de données, <br />
              <span className="text-slate-400">redéfinie.</span>
            </h2>
            <p className="text-slate-500 text-lg font-light leading-relaxed max-w-sm mb-12 italic serif">
              Connectez vos sources de données et commencez à explorer vos insights dès maintenant.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Database className="w-3 h-3 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Architecture Distribuée</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed uppercase">Accédez à Superset et Datasets locaux en toute transparence.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-3 h-3 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Sécurité Avancée</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed uppercase">Protection de vos données via chiffrement end-to-end.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <span>© 2026 PRISM BI</span>
            <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
            <span>V 4.3.6</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenue</h1>
            <p className="text-slate-400 text-sm">Veuillez vous identifier pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="w-full px-0 py-4 bg-transparent border-b border-slate-200 focus:border-slate-900 text-sm font-medium transition-all outline-none placeholder:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mot de passe</label>
                <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Oublié ?</button>
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-0 py-4 bg-transparent border-b border-slate-200 focus:border-slate-900 text-sm font-medium transition-all outline-none placeholder:text-slate-200"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-slate-900/10"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
              {!isSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative my-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Ou continuer avec</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSSO('google')}
              className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              <Chrome className="w-4 h-4" />
              GOOGLE
            </button>
            <button 
              onClick={() => handleSSO('github')}
              className="flex items-center justify-center gap-3 py-3 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              <Github className="w-4 h-4" />
              GITHUB
            </button>
          </div>

          <button className="mt-8 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest text-center transition-colors">
            Besoin d'aide ? Contactez le support
          </button>
        </div>
      </div>

      {/* Absolute Bottom Info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm z-20">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Environnement Industriel Sécurisé</span>
      </div>
    </div>
  );
};

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
  CheckCircle2
} from 'lucide-react';
import { hifadihService } from '../../lib/hifadihService';
import { toast } from 'sonner';
import { 
  FormSection, 
  FormInput, 
  FormButton 
} from '../../components/ui/FormElements';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = React.useState('admin@hifadih.ai');
  const [password, setPassword] = React.useState('••••••••••••');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin();
      setIsSubmitting(false);
      toast.success('Connexion réussie à Hifadih BI');
    }, 500);
  };

  const handleSSO = async (provider: 'google' | 'github' | 'ldap') => {
    try {
      await hifadihService.authenticateSSO(provider);
      toast.success(`Authentification ${provider.toUpperCase()} réussie`);
      onLogin();
    } catch (error) {
      toast.error(`Échec de l'authentification ${provider.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden text-foreground">
      {/* Background Subtle Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px' 
        }} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md bg-background rounded-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-border relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-md mb-3.5 ring-4 ring-neutral-100 dark:ring-neutral-800">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hifadih BI</h1>
          <p className="text-muted-foreground text-xs mt-1">
            Connectez-vous à votre espace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field with elevated label */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-foreground tracking-tight select-none">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Adresse e-mail</span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground/70 tracking-normal">
                Professionnel
              </span>
            </label>
            <FormInput 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@entreprise.com" 
              required
            />
          </div>

          {/* Password field with elevated label */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between select-none">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-tight">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Mot de passe</span>
              </label>
              <button 
                type="button" 
                onClick={() => toast.info('Un lien de réinitialisation sécurisé sera envoyé à votre adresse.')}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <FormInput 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" 
              required
            />
          </div>

          <div className="flex items-center pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border text-black accent-black cursor-pointer"
              />
              <span className="font-normal">Mémoriser cette session</span>
            </label>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-black"
            >
              {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Ou
          </span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* SSO Options */}
        <div className="grid grid-cols-2 gap-2.5">
          <button 
            type="button"
            onClick={() => handleSSO('google')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-xl text-xs font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Chrome className="w-4 h-4 text-rose-500" />
            <span>Google</span>
          </button>
          <button 
            type="button"
            onClick={() => handleSSO('github')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 border border-border rounded-xl text-xs font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground/70">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Chiffrement 256-bit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>SOC-2 & RGPD</span>
          </div>
        </div>
      </motion.div>
      
      {/* Footer copyright */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-medium text-muted-foreground/60">
        <span>Hifadih BI</span>
        <div className="w-1 h-1 bg-border rounded-full" />
        <span>© 2026</span>
      </div>
    </div>
  );
};

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
import { supersetService } from '../../lib/superset-service';
import { toast } from 'sonner';
import { 
  FormSection, 
  FormInput, 
  FormButton,
  FormLabel
} from '../../components/ui/FormElements';

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
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6 relative overflow-hidden text-foreground">
      {/* Background Grid - Très subtil */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ 
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '24px 24px' 
      }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-background rounded-[15px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-border relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-foreground rounded-xl flex items-center justify-center shadow-lg mb-4">
            <BarChart3 className="w-6 h-6 text-background" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hifadih BI</h1>
          <p className="text-muted-foreground text-sm mt-1">Plateforme Intelligence</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection label="Email">
            <FormInput 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com" 
              required
            />
          </FormSection>

          <FormSection label="Mot de passe">
            <FormInput 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
            />
          </FormSection>

          <div className="space-y-4">
            <FormButton 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 tracking-[0.2em]"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform inline-block" />}
            </FormButton>

            <div className="flex justify-center pt-2">
              <button 
                type="button" 
                className="text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-[0.2em] transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>
        </form>

        <div className="relative my-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Ou</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleSSO('google')}
            className="flex items-center justify-center gap-2 py-3 border border-border rounded-xl text-[9px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
          >
            <Chrome className="w-4 h-4" />
            GOOGLE
          </button>
          <button 
            onClick={() => handleSSO('github')}
            className="flex items-center justify-center gap-2 py-3 border border-border rounded-xl text-[9px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
          >
            <Github className="w-4 h-4" />
            GITHUB
          </button>
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
        <span>Hifadih BI</span>
        <div className="w-1 h-1 bg-border rounded-full"></div>
        <span>© 2026</span>
      </div>
    </div>
  );
};

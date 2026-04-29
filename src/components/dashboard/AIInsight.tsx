import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, ArrowUpRight, Loader2 } from 'lucide-react';
import { aiService } from '../../lib/ai-service';

interface AIInsightProps {
  data?: any[];
  title?: string;
  insight?: string;
}

export const AIInsight = ({ data, title = "Intelligence Insight", insight: staticInsight }: AIInsightProps) => {
  const [insight, setInsight] = React.useState<string | null>(staticInsight || null);
  const [isLoading, setIsLoading] = React.useState(false);

  const getInsight = async () => {
    if (!data || data.length === 0) return;
    setIsLoading(true);
    try {
      const res = await aiService.analyzeData(data);
      setInsight(res);
    } catch (err) {
      console.error('Failed to get AI insight:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (staticInsight) {
        setInsight(staticInsight);
    } else if (data && data.length > 0) {
      getInsight();
    }
  }, [data, staticInsight]);

  if (!staticInsight && (!data || data.length === 0)) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-accent/5 border border-accent/20 rounded-3xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Hifadih AI Analysis</h4>
            <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">{title}</p>
          </div>
        </div>
        <button 
          onClick={getInsight}
          disabled={isLoading}
          className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-all"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
        </button>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-accent/10 animate-pulse rounded w-full" />
            <div className="h-4 bg-accent/10 animate-pulse rounded w-5/6" />
            <div className="h-4 bg-accent/10 animate-pulse rounded w-4/6" />
          </div>
        ) : insight ? (
          <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {insight}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground italic">Click the brain icon to generate a strategic analysis.</p>
        )}
      </div>

      <div className="pt-4 flex gap-2">
        <button className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-900 border border-border text-[10px] font-black uppercase tracking-widest hover:border-accent transition-all flex items-center justify-center gap-2">
          Plus de détails
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

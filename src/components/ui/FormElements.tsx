import React, { forwardRef } from 'react';
import { cn } from '../../core/utils/utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

// Re-defining cn here in case it's not imported or defined in the same way in utils
function localCn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FormLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={localCn("text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 block mb-2", className)}>
    {children}
  </label>
);

export const FormInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={localCn(
        "w-full px-5 py-4 bg-muted/30 border-border focus:bg-background focus:border-accent focus:ring-8 focus:ring-accent/5 rounded-2xl text-sm font-bold transition-all outline-none border text-foreground",
        className
      )}
      {...props}
    />
  )
);

export const FormSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative group">
      <select
        ref={ref}
        className={localCn(
          "w-full px-5 py-4 bg-muted/30 border-border focus:bg-background focus:border-accent focus:ring-8 focus:ring-accent/5 rounded-2xl text-sm font-bold transition-all outline-none border appearance-none text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors z-10">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  )
);

export const FormButtonGroup = ({ 
  options, 
  value, 
  onChange, 
  className 
}: { 
  options: string[], 
  value: string, 
  onChange: (val: string) => void,
  className?: string 
}) => (
  <div className={localCn("grid gap-3", options.length === 2 ? "grid-cols-2" : "grid-cols-3", className)}>
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={localCn(
          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
          value === opt 
            ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/10" 
            : "bg-background text-muted-foreground border-border hover:border-accent/30"
        )}
      >
        {opt}
      </button>
    ))}
  </div>
);

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={localCn(
        "w-full px-5 py-4 bg-muted/30 border-border focus:bg-background focus:border-accent focus:ring-8 focus:ring-accent/5 rounded-2xl text-sm font-medium transition-all outline-none min-h-[120px] resize-none border text-foreground",
        className
      )}
      {...props}
    />
  )
);

export const FormSection = ({ label, description, children, className }: { label?: string; description?: string; children: React.ReactNode; className?: string }) => (
  <div className={localCn("space-y-2", className)}>
    {label && <FormLabel>{label}</FormLabel>}
    {description && <p className="text-[10px] text-muted-foreground px-1 pb-1">{description}</p>}
    {children}
  </div>
);

export const FormButton = ({ 
  children, 
  variant = 'primary', 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) => {
  const variants = {
    primary: "bg-accent text-accent-foreground hover:opacity-90 shadow-xl shadow-accent/10 active:scale-95",
    secondary: "bg-muted text-muted-foreground hover:bg-muted/80 active:scale-95 border border-border/50",
    danger: "bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-xl shadow-rose-500/10"
  };

  return (
    <button
      className={localCn(
        "px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const FormActions = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={localCn("pt-6 flex gap-4", className)}>
    {children}
  </div>
);

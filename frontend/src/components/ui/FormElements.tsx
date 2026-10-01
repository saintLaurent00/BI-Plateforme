import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, AlertCircle, Check, Loader2, Eye, EyeOff } from 'lucide-react';

function localCn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FormLabel = ({ 
  children, 
  required, 
  className 
}: { 
  children: React.ReactNode; 
  required?: boolean; 
  className?: string 
}) => (
  <label className={localCn("text-xs font-semibold text-foreground/80 block mb-1.5 select-none", className)}>
    {children}
    {required && <span className="text-rose-500 font-bold ml-1">*</span>}
  </label>
);

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, helperText, leftIcon, rightIcon, disabled, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const currentType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1">
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors z-10 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={currentType}
            disabled={disabled}
            className={localCn(
              "w-full bg-background border border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/15 rounded-lg text-xs font-medium transition-all outline-none text-foreground placeholder:text-muted-foreground/50 shadow-2xs",
              leftIcon ? "pl-10" : "px-3.5",
              (rightIcon || isPasswordType) ? "pr-10" : "px-3.5",
              "py-2.5",
              error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-500/5",
              disabled && "opacity-50 cursor-not-allowed bg-muted/40",
              className
            )}
            {...props}
          />
          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 p-0.5 rounded-md focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors z-10">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error && typeof error === 'string' && (
          <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 px-1 pt-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-muted-foreground px-1 pt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, children, error, helperText, leftIcon, disabled, ...props }, ref) => (
    <div className="w-full space-y-1">
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors z-10 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={localCn(
            "w-full bg-background border border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/15 rounded-lg text-xs font-medium transition-all outline-none border appearance-none text-foreground shadow-2xs pr-9",
            leftIcon ? "pl-10" : "px-3.5",
            "py-2.5",
            error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-500/5",
            disabled && "opacity-50 cursor-not-allowed bg-muted/40",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-accent transition-colors z-10">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && typeof error === 'string' && (
        <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 px-1 pt-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!error && helperText && (
        <p className="text-[11px] text-muted-foreground px-1 pt-0.5">{helperText}</p>
      )}
    </div>
  )
);
FormSelect.displayName = 'FormSelect';

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
  <div className={localCn("grid gap-1.5 p-1 bg-muted/30 border border-border/60 rounded-xl", options.length === 2 ? "grid-cols-2" : options.length === 3 ? "grid-cols-3" : "grid-cols-4", className)}>
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={localCn(
          "py-2 px-3 rounded-lg text-xs font-bold transition-all",
          value === opt 
            ? "bg-accent text-accent-foreground shadow-xs" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {opt}
      </button>
    ))}
  </div>
);

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean;
  helperText?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, helperText, disabled, ...props }, ref) => (
    <div className="w-full space-y-1">
      <textarea
        ref={ref}
        disabled={disabled}
        className={localCn(
          "w-full px-3.5 py-2.5 bg-background border border-border/80 focus:border-accent focus:ring-2 focus:ring-accent/15 rounded-lg text-xs font-medium transition-all outline-none min-h-[80px] resize-none text-foreground placeholder:text-muted-foreground/50 shadow-2xs",
          error && "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-500/5",
          disabled && "opacity-50 cursor-not-allowed bg-muted/40",
          className
        )}
        {...props}
      />
      {error && typeof error === 'string' && (
        <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 px-1 pt-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!error && helperText && (
        <p className="text-[11px] text-muted-foreground px-1 pt-0.5">{helperText}</p>
      )}
    </div>
  )
);
FormTextarea.displayName = 'FormTextarea';

export const FormSwitch = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  className
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) => (
  <label className={localCn("flex items-start gap-3 cursor-pointer group select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
    <div 
      onClick={() => !disabled && onChange(!checked)}
      className={localCn(
        "w-10 h-5 rounded-full p-0.5 transition-colors relative shrink-0 mt-0.5",
        checked ? "bg-accent" : "bg-muted-foreground/30 group-hover:bg-muted-foreground/40"
      )}
    >
      <div 
        className={localCn(
          "w-4 h-4 rounded-full bg-white transition-transform shadow-xs",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </div>
    {(label || description) && (
      <div>
        {label && <p className="text-xs font-semibold text-foreground">{label}</p>}
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
    )}
  </label>
);

export const FormCheckbox = ({
  checked,
  onChange,
  label,
  description,
  disabled,
  className
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) => (
  <label className={localCn("flex items-center gap-2 cursor-pointer group select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
    <div 
      onClick={() => !disabled && onChange(!checked)}
      className={localCn(
        "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
        checked ? "bg-accent border-accent text-accent-foreground" : "border-border/80 group-hover:border-accent/50 bg-background"
      )}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </div>
    {(label || description) && (
      <div>
        {label && <p className="text-xs font-semibold text-foreground">{label}</p>}
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
    )}
  </label>
);

export const FormSection = ({ 
  label, 
  description, 
  required,
  children, 
  className 
}: { 
  label?: string; 
  description?: string; 
  required?: boolean;
  children: React.ReactNode; 
  className?: string 
}) => (
  <div className={localCn("space-y-1", className)}>
    {label && <FormLabel required={required}>{label}</FormLabel>}
    {description && <p className="text-[11px] text-muted-foreground px-0.5 pb-1">{description}</p>}
    {children}
  </div>
);

export const FormGrid = ({
  cols = 2,
  children,
  className
}: {
  cols?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}) => {
  const colMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
  };

  return (
    <div className={localCn("grid gap-3.5", colMap[cols], className)}>
      {children}
    </div>
  );
};

export const FormButton = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className, 
  disabled,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  isLoading?: boolean;
}) => {
  const variants = {
    primary: "bg-foreground text-background hover:opacity-90 font-semibold shadow-xs active:scale-[0.98]",
    secondary: "bg-muted text-foreground border border-border hover:bg-muted/80 font-semibold active:scale-[0.98]",
    danger: "bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98] shadow-xs",
    outline: "bg-transparent text-foreground border border-border hover:bg-muted/40 active:scale-[0.98]",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={localCn(
        "px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : null}
      {children}
    </button>
  );
};

export const FormActions = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={localCn("pt-4 border-t border-border/60 flex items-center justify-end gap-2.5", className)}>
    {children}
  </div>
);

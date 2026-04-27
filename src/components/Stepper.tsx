import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper = ({ steps, currentStep, className }: StepperProps) => {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center gap-2 max-w-xl mx-auto px-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex-1 space-y-2">
              {/* Subtle Segment Bar */}
              <div className="relative h-[2px] w-full bg-border/40 rounded-full overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{
                    width: isCompleted || isActive ? '100%' : '0%',
                    backgroundColor: isActive ? 'var(--accent)' : isCompleted ? 'var(--accent)' : 'transparent',
                    opacity: isActive ? 1 : isCompleted ? 0.4 : 0
                  }}
                  className="absolute inset-0 bg-accent transition-colors duration-500"
                />
              </div>

              {/* Minimalist Label */}
              <div className="flex flex-col">
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.2,
                    y: isActive ? 0 : 2
                  }}
                  className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] transition-all",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


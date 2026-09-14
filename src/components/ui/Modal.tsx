import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = '2xl' }: ModalProps) => {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  }[maxWidth] || 'max-w-2xl';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`w-full ${maxWidthClass} bg-background border border-border/80 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto text-foreground flex flex-col max-h-[88vh]`}
            >
              {/* Header */}
              <div className="px-6 py-3.5 border-b border-border/80 flex items-center justify-between bg-muted/30 shrink-0">
                <h3 className="text-base font-bold text-foreground tracking-tight">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

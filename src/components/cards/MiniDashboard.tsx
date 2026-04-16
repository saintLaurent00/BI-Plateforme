import React from 'react';
import { motion } from 'motion/react';

export const MiniDashboard: React.FC = () => {
  return (
    <div className="w-full h-full p-3 grid grid-cols-4 grid-rows-4 gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
      {/* Header-like blocks */}
      <div className="col-span-4 row-span-1 bg-muted rounded-md border border-border/50" />
      
      {/* Main content blocks */}
      <div className="col-span-2 row-span-2 bg-prism-500/20 rounded-lg border border-prism-500/30" />
      <div className="col-span-1 row-span-1 bg-muted rounded-md border border-border/50" />
      <div className="col-span-1 row-span-1 bg-muted rounded-md border border-border/50" />
      <div className="col-span-1 row-span-1 bg-muted rounded-md border border-border/50" />
      <div className="col-span-1 row-span-1 bg-muted rounded-md border border-border/50" />
      
      {/* Footer-like blocks */}
      <div className="col-span-2 row-span-1 bg-muted rounded-md border border-border/50" />
      <div className="col-span-2 row-span-1 bg-muted rounded-md border border-border/50" />
    </div>
  );
};

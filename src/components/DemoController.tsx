import React from 'react';
import { motion } from 'motion/react';
import { Play, Square } from 'lucide-react';
import { useStore } from '../store/useStore';

export const DemoController: React.FC = () => {
  const { demoState, startDemo, stopDemo } = useStore();

  if (!demoState.isActive) {
    return (
      <button
        onClick={startDemo}
        className="glass-pill px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 border border-[#FACC15]/40 hover:border-[#FACC15] text-[11px] sm:text-xs font-mono text-white transition-all shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:shadow-[0_0_20px_rgba(250,204,21,0.45)] group cursor-pointer"
        title="Start presentation demo tour"
      >
        <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FACC15] fill-[#FACC15] group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-white group-hover:text-[#FEF08A] whitespace-nowrap">
          <span className="hidden sm:inline">Play Demo</span>
          <span className="sm:hidden">Demo</span>
        </span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="glass-pill px-2.5 sm:px-4 py-1 sm:py-2 rounded-full border border-[#FACC15] flex items-center gap-2 sm:gap-3 shadow-[0_0_30px_rgba(250,204,21,0.35)] max-w-[200px] sm:max-w-md"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FACC15] animate-ping" />
        <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#FACC15] uppercase tracking-wider whitespace-nowrap">
          {demoState.step}/{demoState.totalSteps}
        </span>
      </div>

      <div className="hidden sm:block h-3 w-px bg-white/20 shrink-0" />

      <span className="hidden sm:inline-block text-xs font-mono text-white font-medium max-w-[120px] md:max-w-xs truncate">
        {demoState.caption}
      </span>

      <div className="h-3 w-px bg-white/20 shrink-0" />

      <button
        onClick={stopDemo}
        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#F43F5E]/30 hover:bg-[#F43F5E] border border-[#F43F5E] text-[9px] sm:text-[10px] font-mono font-bold text-white transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
      >
        <Square className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
        <span>Stop</span>
      </button>
    </motion.div>
  );
};

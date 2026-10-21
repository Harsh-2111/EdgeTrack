import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Layers } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed left-3 sm:left-6 bottom-18 sm:bottom-6 z-30">
      <div className="glass-panel border border-white/14 shadow-2xl overflow-hidden transition-all duration-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse legend' : 'Expand legend'}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-[#FACC15]" />
          <span className="font-semibold tracking-wider uppercase hidden sm:inline">Legend</span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-1 sm:ml-auto" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-white/40 ml-1 sm:ml-auto" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2 text-xs font-sans"
            >
              <div className="text-[10px] uppercase font-mono tracking-wider text-white/40 pt-1">
                Resource Status
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C084FC] shadow-[0_0_6px_#C084FC]" />
                  <span className="text-white/80">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] shadow-[0_0_6px_#FACC15]" />
                  <span className="text-white/80">In Use</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shadow-[0_0_6px_#F43F5E]" />
                  <span className="text-white/80">Maintenance</span>
                </div>
              </div>

              <div className="text-[10px] uppercase font-mono tracking-wider text-white/40 pt-1.5 border-t border-white/10">
                Network Elements
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rotate-45 border border-[#C084FC] bg-[#C084FC]/20" />
                  <span className="text-white/80">Edge Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm border border-[#FACC15] bg-[#FACC15]/20" />
                  <span className="text-white/80">Central DB</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

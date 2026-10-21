import React from 'react';

interface TopBrandPillProps {
  onReplayIntro?: () => void;
}

export const TopBrandPill: React.FC<TopBrandPillProps> = ({ onReplayIntro }) => {
  return (
    <div
      onClick={onReplayIntro}
      role="button"
      tabIndex={0}
      title="Click to replay boot sequence"
      className="glass-pill px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 sm:gap-2.5 border border-white/14 shadow-lg cursor-pointer hover:border-white/30 transition-all"
    >
      <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#C084FC] shadow-[0_0_8px_#C084FC]" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
        <span className="absolute -bottom-0.5 -left-0.5 w-1 h-1 rounded-full bg-[#DEC7E7]" />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-heading">
          Edge<span className="text-[#FACC15]">Track</span>
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse" />
      </div>
    </div>
  );
};

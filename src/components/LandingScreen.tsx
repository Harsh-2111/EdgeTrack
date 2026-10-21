import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface LandingScreenProps {
  onComplete: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const statusMessages = [
    'Booting edge nodes',
    'Building zone index',
    'Syncing audit log',
    'Ready',
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400;
    let completed = false;

    const interval = setInterval(() => {
      if (completed) return;
      const elapsed = Date.now() - startTime;
      let rawPercent = (elapsed / duration) * 100;

      if (rawPercent > 24 && rawPercent < 30) {
        rawPercent = 26 + Math.sin(elapsed / 100) * 1.2;
      } else if (rawPercent > 58 && rawPercent < 65) {
        rawPercent = 60 + Math.sin(elapsed / 90) * 1.0;
      } else if (rawPercent > 86 && rawPercent < 92) {
        rawPercent = 88 + Math.sin(elapsed / 70) * 0.6;
      }

      const clamped = Math.min(100, Math.max(0, Math.round(rawPercent)));
      setProgress(clamped);

      if (clamped < 28) {
        setStatusIndex(0);
      } else if (clamped < 62) {
        setStatusIndex(1);
      } else if (clamped < 92) {
        setStatusIndex(2);
      } else {
        setStatusIndex(3);
      }

      if (elapsed >= duration && !completed) {
        completed = true;
        setProgress(100);
        setStatusIndex(3);
        clearInterval(interval);
        setTimeout(() => {
          onCompleteRef.current();
        }, 250);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    setProgress(100);
    onCompleteRef.current();
  };

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#190826] select-none overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(138, 48, 168, 0.32) 0%, rgba(53, 17, 72, 0.65) 50%, rgba(25, 8, 38, 1) 90%)',
        }}
      />

      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="landing-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#C084FC" opacity="0.65" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#landing-dots)" />
      </svg>

      <div className="relative z-10 flex items-center justify-end p-4 sm:p-6">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/12 border border-white/15 transition-colors cursor-pointer"
        >
          <span>Skip boot</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center -mt-6 px-4">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-6 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-purple-400/25 border-dashed"
          />

          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute w-20 h-20 rounded-full border border-[#C084FC]"
          />
          <motion.div
            animate={{ scale: [1, 2.3], opacity: [0.4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.7, ease: 'easeOut' }}
            className="absolute w-20 h-20 rounded-full border border-[#FACC15]"
          />

          <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#280F3B] border-2 border-[#C084FC] flex items-center justify-center shadow-[0_0_30px_rgba(192,132,252,0.4)]">
            <div className="w-6 h-6 rounded-lg bg-[#C084FC] flex items-center justify-center shadow-[0_0_12px_#C084FC]">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#FACC15]" />
            </div>
          </div>

          {[0, 120, 240].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const dist = 54;
            const x = Math.cos(rad) * dist;
            const y = Math.sin(rad) * dist;
            const color = idx === 0 ? '#C084FC' : idx === 1 ? '#FACC15' : '#E9D5FF';

            return (
              <React.Fragment key={deg}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="80"
                    y1="80"
                    x2={80 + x}
                    y2={80 + y}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                </svg>

                <motion.div
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: idx * 0.4,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    backgroundColor: '#280F3B',
                    border: `1.5px solid ${color}`,
                    boxShadow: `0 0 14px ${color}80`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white font-heading text-center">
          Edge<span className="text-[#FACC15]">Track</span>
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm tracking-[0.22em] uppercase font-mono text-[#DEC7E7] font-medium text-center">
          Smart Campus Resource Tracking
        </p>
      </div>

      <div className="relative z-10 mx-4 sm:mx-8 mb-6 sm:mb-8 pb-2">
        <div className="flex items-center justify-between mb-2 text-xs text-white/70 font-mono tracking-wide">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FACC15] animate-pulse shadow-[0_0_8px_#FACC15]" />
            <span className="text-white/90 font-medium">{statusMessages[statusIndex]}</span>
          </div>
          <span className="text-[#FACC15] font-semibold">{progress}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full rounded-full bg-[#FACC15] shadow-[0_0_14px_#FACC15]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

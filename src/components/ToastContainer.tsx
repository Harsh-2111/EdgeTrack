import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastNotification } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-18 sm:bottom-24 right-2 left-2 sm:left-auto sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-xs sm:max-w-sm w-full mx-auto sm:mx-0">
      <AnimatePresence>
        {toasts.slice(-3).map((toast) => {
          const isTeal = toast.type === 'teal';
          const isGold = toast.type === 'gold';
          const isBerry = toast.type === 'berry';

          const borderColor = isTeal
            ? 'rgba(192, 132, 252, 0.4)'
            : isGold
            ? 'rgba(250, 204, 21, 0.5)'
            : isBerry
            ? 'rgba(244, 63, 94, 0.5)'
            : 'rgba(255, 255, 255, 0.15)';

          const iconColor = isTeal
            ? '#C084FC'
            : isGold
            ? '#FACC15'
            : isBerry
            ? '#F43F5E'
            : '#ffffff';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto glass-panel p-3.5 shadow-2xl flex items-start gap-3 border"
              style={{
                borderColor,
                boxShadow: `0 12px 30px rgba(0,0,0,0.65), 0 0 15px ${iconColor}20`,
              }}
            >
              <div className="mt-0.5 shrink-0">
                {isTeal && <CheckCircle2 className="w-4 h-4 text-[#C084FC]" />}
                {isGold && <RefreshCw className="w-4 h-4 text-[#FACC15] animate-spin" style={{ animationDuration: '3s' }} />}
                {isBerry && <AlertCircle className="w-4 h-4 text-[#F43F5E]" />}
                {!isTeal && !isGold && !isBerry && <AlertTriangle className="w-4 h-4 text-white" />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-white font-heading leading-tight">
                  {toast.title}
                </h4>
                <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-white/30 hover:text-white transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

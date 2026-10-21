import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { UserRole } from '../types';
import { Shield, UserCheck, Eye, RotateCcw } from 'lucide-react';

export const TopControlBar: React.FC = () => {
  const { role, setRole, nodes, toggleNodeStatus, resetDemoData } = useStore();
  const [showNetworkDetail, setShowNetworkDetail] = useState(false);

  const roles: UserRole[] = ['Admin', 'Staff', 'Auditor'];

  const onlineCount = nodes.filter((n) => n.status === 'online').length;
  const syncingCount = nodes.filter((n) => n.status === 'syncing').length;
  const offlineCount = nodes.filter((n) => n.status === 'offline').length;

  const dotColor =
    offlineCount > 0
      ? '#F43F5E'
      : syncingCount > 0
      ? '#FACC15'
      : '#C084FC';

  const statusText = `${onlineCount}/${nodes.length} online`;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      <div className="relative">
        <button
          onClick={() => setShowNetworkDetail(!showNetworkDetail)}
          aria-label="Toggle network telemetry"
          className="glass-pill px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 border border-white/14 hover:border-white/25 transition-all text-[11px] sm:text-xs font-mono text-white/90 cursor-pointer"
        >
          <span
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 8px ${dotColor}`,
            }}
          />
          <span className="hidden sm:inline">{statusText}</span>
          <span className="sm:hidden font-mono font-bold text-[10px]">{onlineCount}/{nodes.length}</span>
        </button>

        <AnimatePresence>
          {showNetworkDetail && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 sm:top-11 w-56 sm:w-64 glass-panel p-3.5 shadow-2xl z-50 text-xs"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-white/60 font-mono text-[10px]">
                <span>EDGE BEACONS</span>
                <span className="text-[9px] text-white/40">CLICK TO CYCLE</span>
              </div>
              <div className="space-y-1.5">
                {nodes.map((node) => {
                  const nColor =
                    node.status === 'online'
                      ? '#C084FC'
                      : node.status === 'syncing'
                      ? '#FACC15'
                      : '#F43F5E';
                  return (
                    <div
                      key={node.id}
                      onClick={() => toggleNodeStatus(node.id)}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      title="Click to toggle status"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: nColor }}
                        />
                        <span className="font-mono font-medium text-white text-[11px]">
                          {node.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-white/60">
                        <span>{node.latencyMs}ms</span>
                        <span
                          className="capitalize px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            color: nColor,
                            backgroundColor: `${nColor}20`,
                          }}
                        >
                          {node.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-pill p-0.5 sm:p-1 rounded-full flex items-center border border-white/14">
        {roles.map((r) => {
          const isActive = role === r;
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              aria-label={`Select role ${r}`}
              className={`relative px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#1F0B2E] font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-role-indicator"
                  className="absolute inset-0 bg-[#FACC15] rounded-full shadow-[0_0_12px_rgba(250,204,21,0.4)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                {r === 'Admin' && <Shield className="w-3 h-3" />}
                {r === 'Staff' && <UserCheck className="w-3 h-3" />}
                {r === 'Auditor' && <Eye className="w-3 h-3" />}
                <span className="hidden sm:inline">{r}</span>
                <span className="sm:hidden">{r.slice(0, 3)}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={resetDemoData}
        className="glass-pill p-1.5 sm:p-2 rounded-full border border-white/14 text-white/50 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
        title="Reset demo data"
        aria-label="Reset demo data"
      >
        <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { PanelTab } from '../types';
import { Map, Search, Radio, ShieldCheck, BarChart3, Lock } from 'lucide-react';

interface DockItem {
  id: PanelTab;
  label: string;
  icon: React.ElementType;
  adminOrAuditorOnly?: boolean;
}

export const BottomDock: React.FC = () => {
  const { activePanel, setActivePanel, role, addToast } = useStore();
  const [hoveredItem, setHoveredItem] = useState<PanelTab | null>(null);

  const dockItems: DockItem[] = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'query', label: 'Query', icon: Search },
    { id: 'nodes', label: 'Nodes', icon: Radio },
    { id: 'audit', label: 'Audit', icon: ShieldCheck, adminOrAuditorOnly: true },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  const handleItemClick = (item: DockItem) => {
    if (item.adminOrAuditorOnly && role === 'Staff') {
      addToast({
        title: 'Access Restricted',
        message: 'The immutable audit ledger is restricted to Auditor and Admin roles.',
        type: 'berry',
      });
      setActivePanel('audit');
      return;
    }
    setActivePanel(item.id);
  };

  return (
    <nav className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-16px)] sm:max-w-none">
      <div className="glass-pill px-2 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-1 sm:gap-2 border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.7)]">
        {dockItems.map((item) => {
          const isActive = activePanel === item.id;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;
          const isLocked = item.adminOrAuditorOnly && role === 'Staff';

          return (
            <div key={item.id} className="relative">
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: -8, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="hidden sm:flex absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#1C092C] text-white text-[11px] font-medium font-sans border border-white/20 pointer-events-none whitespace-nowrap shadow-xl items-center gap-1.5"
                  >
                    {isLocked && <Lock className="w-3 h-3 text-[#FACC15]" />}
                    <span>{item.label}</span>
                    {isLocked && <span className="text-[10px] text-[#FACC15] font-mono">(Auditor/Admin)</span>}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1C092C]" />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-label={item.label}
                className={`relative flex flex-col items-center justify-center p-2 sm:px-3.5 sm:py-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-[#FACC15] bg-white/[0.12] shadow-[0_0_18px_rgba(250,204,21,0.4)]'
                    : isLocked
                    ? 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200" />

                {isLocked && (
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3 h-3 rounded-full bg-[#1C092C] border border-[#FACC15] flex items-center justify-center">
                    <Lock className="w-2 h-2 text-[#FACC15]" />
                  </span>
                )}

                {isActive && (
                  <motion.span
                    layoutId="dock-active-dot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#FACC15] shadow-[0_0_8px_#FACC15]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

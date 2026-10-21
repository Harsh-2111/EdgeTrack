import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { PanelTab } from '../types';
import { X, Search, Radio, ShieldCheck, BarChart3 } from 'lucide-react';
import { QueryDrawer } from './QueryDrawer';
import { InsightsDrawer } from './InsightsDrawer';
import { NodesDrawer } from './NodesDrawer';
import { AuditDrawer } from './AuditDrawer';

export const SideDrawer: React.FC = () => {
  const { activePanel, setActivePanel } = useStore();

  const isOpen = activePanel !== 'map';

  const drawerMeta: Record<
    Exclude<PanelTab, 'map'>,
    {
      title: string;
      code: string;
      icon: React.ElementType;
      color: string;
    }
  > = {
    query: {
      title: 'Query Engine',
      code: 'EDGE-QUERY-02',
      icon: Search,
      color: '#DEC7E7',
    },
    nodes: {
      title: 'Edge Beacons',
      code: 'MESH-TELEMETRY',
      icon: Radio,
      color: '#FACC15',
    },
    audit: {
      title: 'Audit Trail',
      code: 'IMMUTABLE-LEDGER',
      icon: ShieldCheck,
      color: '#FACC15',
    },
    insights: {
      title: 'Campus Insights',
      code: 'ANALYTICS-CORE',
      icon: BarChart3,
      color: '#C084FC',
    },
  };

  const currentMeta = isOpen ? drawerMeta[activePanel as Exclude<PanelTab, 'map'>] : null;
  const IconComponent = currentMeta?.icon || Search;

  return (
    <AnimatePresence>
      {isOpen && currentMeta && (
        <motion.aside
          key="side-drawer"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed top-14 bottom-18 sm:top-18 sm:bottom-24 right-2 left-2 sm:left-auto sm:right-6 w-auto sm:w-[460px] sm:max-w-[460px] z-30 glass-panel p-3.5 sm:p-5 flex flex-col shadow-[0_24px_60px_rgba(0,0,0,0.85)] pointer-events-auto border border-white/20"
        >
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: `${currentMeta.color}22`,
                  borderColor: `${currentMeta.color}50`,
                  color: currentMeta.color,
                }}
              >
                <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-white/50 block leading-none">
                  {currentMeta.code}
                </span>
                <h2 className="text-sm sm:text-base font-bold font-heading text-white">
                  {currentMeta.title}
                </h2>
              </div>
            </div>

            <button
              onClick={() => setActivePanel('map')}
              aria-label="Close drawer"
              className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {activePanel === 'query' && <QueryDrawer />}
            {activePanel === 'insights' && <InsightsDrawer />}
            {activePanel === 'nodes' && <NodesDrawer />}
            {activePanel === 'audit' && <AuditDrawer />}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

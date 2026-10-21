import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider, useStore } from './store/useStore';
import { LandingScreen } from './components/LandingScreen';
import { CampusMap } from './components/CampusMap';
import { TopBrandPill } from './components/TopBrandPill';
import { TopControlBar } from './components/TopControlBar';
import { BottomDock } from './components/BottomDock';
import { SideDrawer } from './components/SideDrawer';
import { MapControls } from './components/MapControls';
import { MapLegend } from './components/MapLegend';
import { ResourceCard } from './components/ResourceCard';
import { ToastContainer } from './components/ToastContainer';
import { DemoController } from './components/DemoController';
import { Resource } from './types';
import { X } from 'lucide-react';

function MainApp() {
  const {
    resources,
    selectedResourceId,
    setSelectedResourceId,
    updateResourceStatus,
    activeQueryResult,
    clearActiveQuery,
    toasts,
    removeToast,
    demoState,
  } = useStore();

  const [hasLoaded, setHasLoaded] = useState(false);

  const handleComplete = useCallback(() => {
    setHasLoaded(true);
  }, []);

  const selectedResource = resources.find((r) => r.id === selectedResourceId) || null;

  const handleSelectResource = (resource: Resource) => {
    setSelectedResourceId(resource.id);
  };

  const handleCloseCard = () => {
    setSelectedResourceId(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#14071F] select-none font-sans">
      <AnimatePresence>
        {!hasLoaded && (
          <LandingScreen onComplete={handleComplete} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{
          opacity: hasLoaded ? 1 : 0,
          scale: hasLoaded ? 1 : 1.04,
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full"
      >
        <CampusMap onSelectResource={handleSelectResource} />

        <header className="fixed top-2 sm:top-4 inset-x-2 sm:inset-x-6 z-30 pointer-events-none flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="pointer-events-auto shrink-0">
            <TopBrandPill onReplayIntro={() => setHasLoaded(false)} />
          </div>

          <div className="pointer-events-auto flex items-center gap-2 max-w-full overflow-hidden">
            <DemoController />

            <AnimatePresence>
              {activeQueryResult && !demoState.isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="hidden md:flex items-center gap-2 glass-pill px-3 py-1.5 rounded-full border border-white/14 shadow-xl"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" />
                  <span className="text-xs font-mono text-white/90">
                    Filter: <strong className="text-[#FACC15]">{activeQueryResult.results.length}</strong>
                  </span>
                  <button
                    onClick={clearActiveQuery}
                    className="ml-1 px-2 py-0.5 rounded-full badge-yellow text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Clear</span>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pointer-events-auto shrink-0">
            <TopControlBar />
          </div>
        </header>

        <MapControls />

        <MapLegend />

        <BottomDock />

        <SideDrawer />

        <AnimatePresence>
          {selectedResource && (
            <ResourceCard
              resource={selectedResource}
              onClose={handleCloseCard}
              onStatusChange={(id, status) => updateResourceStatus(id, status)}
            />
          )}
        </AnimatePresence>

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}

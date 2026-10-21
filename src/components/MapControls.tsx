import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';

export const MapControls: React.FC = () => {
  const { setZoom, resetView } = useStore();

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.5, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.65, prev - 0.2));
  };

  return (
    <div className="fixed left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1 sm:gap-1.5 glass-pill p-1 sm:p-1.5 rounded-full border border-white/14 shadow-2xl">
      <button
        onClick={handleZoomIn}
        aria-label="Zoom in map"
        title="Zoom In"
        className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <div className="w-3 sm:w-4 h-px bg-white/10" />

      <button
        onClick={handleZoomOut}
        aria-label="Zoom out map"
        title="Zoom Out"
        className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      <div className="w-3 sm:w-4 h-px bg-white/10" />

      <button
        onClick={resetView}
        aria-label="Reset map view"
        title="Reset Map View"
        className="p-1.5 sm:p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { X, Clock, MapPin, Tag, ChevronDown, Lock } from 'lucide-react';
import { Resource, ResourceStatus } from '../types';
import { useStore } from '../store/useStore';

interface ResourceCardProps {
  resource: Resource;
  onClose: () => void;
  onStatusChange: (id: string, status: ResourceStatus) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onClose,
  onStatusChange,
}) => {
  const { role, zones } = useStore();
  const zone = zones.find((z) => z.id === resource.zoneId);

  const isAuditor = role === 'Auditor';

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'Available':
        return '#C084FC';
      case 'In Use':
        return '#FACC15';
      case 'Maintenance':
        return '#F43F5E';
    }
  };

  const statusColor = getStatusColor(resource.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-14 sm:top-20 left-2 right-2 sm:left-6 sm:right-auto max-w-sm mx-auto sm:mx-0 z-40 max-h-[calc(100vh-130px)] overflow-y-auto glass-panel p-3.5 sm:p-5 shadow-2xl border border-white/20"
      style={{
        boxShadow: `0 20px 45px rgba(0,0,0,0.7), 0 0 25px ${statusColor}30`,
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3 mb-2.5 sm:mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md badge-yellow text-xs font-mono font-bold">
            {resource.id}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-white/60">
            <Clock className="w-3 h-3" />
            {resource.updatedAt}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close card"
          className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-white font-heading leading-tight mb-2">
        {resource.name}
      </h3>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/90">
          <Tag className="w-3 h-3 text-[#FACC15]" />
          {resource.type}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: `${zone?.themeColor || '#DEC7E7'}22`,
            border: `1px solid ${zone?.themeColor || '#DEC7E7'}50`,
            color: zone?.themeColor || '#DEC7E7',
          }}
        >
          <MapPin className="w-3 h-3" />
          {zone?.code} • {zone?.shortName}
        </span>
      </div>

      {resource.details && (
        <div className="mb-3 text-xs text-white/75 bg-white/[0.04] p-2.5 rounded-xl border border-white/8">
          <p className="line-clamp-2">{resource.details}</p>
          {resource.assignedTo && (
            <p className="mt-1 text-[11px] text-[#FACC15] font-mono">
              Assigned: {resource.assignedTo}
            </p>
          )}
          {resource.batteryLevel !== undefined && (
            <p className="mt-1 text-[11px] text-[#DEC7E7] font-mono">
              Battery: {resource.batteryLevel}%
            </p>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">Current Status</span>
          <span
            className="flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: `${statusColor}22`,
              color: statusColor,
              border: `1px solid ${statusColor}45`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            {resource.status}
          </span>
        </div>

        <div className="relative mt-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] text-white/50 font-mono uppercase tracking-wider">
              Change status:
            </label>
            {isAuditor && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#FACC15]">
                <Lock className="w-2.5 h-2.5" />
                <span>Auditor: Read-only</span>
              </span>
            )}
          </div>
          <div className="relative">
            <select
              disabled={isAuditor}
              value={resource.status}
              onChange={(e) =>
                onStatusChange(resource.id, e.target.value as ResourceStatus)
              }
              className={`w-full appearance-none bg-[#1F0A2E] text-white text-xs py-2 px-3 pr-8 rounded-xl border border-white/15 focus:outline-none focus:border-[#FACC15] ${
                isAuditor ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <option value="Available">Available (Online / Free)</option>
              <option value="In Use">In Use (Active session)</option>
              <option value="Maintenance">Maintenance (Service mode)</option>
            </select>
            {!isAuditor && (
              <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-white/50 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import {
  QueryParams,
  ResourceType,
  ResourceStatus,
  QueryResult,
} from '../types';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  FlaskConical,
  Monitor,
  Car,
  Cpu,
  DoorClosed,
  X,
} from 'lucide-react';
import { ZONES } from '../data/mockData';

export const QueryDrawer: React.FC = () => {
  const {
    executeUserQuery,
    isQueryLoading,
    activeQueryResult,
    recentQueries,
    setHoveredResourceId,
    focusResourceOnMap,
    clearActiveQuery,
  } = useStore();

  const [zoneId, setZoneId] = useState<string>('any');
  const [type, setType] = useState<ResourceType | 'any'>('any');
  const [status, setStatus] = useState<ResourceStatus | 'any'>('any');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | 'custom'>('24h');
  const [search, setSearch] = useState<string>('');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [isRecentOpen, setIsRecentOpen] = useState<boolean>(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params: QueryParams = {
      zoneId,
      type,
      status,
      timeRange,
      search: search.trim(),
      from: customFrom,
      to: customTo,
    };
    await executeUserQuery(params);
  };

  const handleRerun = async (item: QueryResult) => {
    setZoneId(item.query.zoneId);
    setType(item.query.type);
    setStatus(item.query.status);
    setTimeRange(item.query.timeRange);
    setSearch(item.query.search || '');
    await executeUserQuery(item.query);
  };

  const renderTypeIcon = (rType: ResourceType) => {
    switch (rType) {
      case 'Lab':
        return <FlaskConical className="w-3.5 h-3.5 text-[#C084FC]" />;
      case 'Projector':
        return <Monitor className="w-3.5 h-3.5 text-[#FACC15]" />;
      case 'Vehicle':
        return <Car className="w-3.5 h-3.5 text-[#FEF08A]" />;
      case 'Equipment':
        return <Cpu className="w-3.5 h-3.5 text-[#DEC7E7]" />;
      case 'Room':
        return <DoorClosed className="w-3.5 h-3.5 text-white/80" />;
    }
  };

  const getStatusColor = (st: ResourceStatus) => {
    switch (st) {
      case 'Available':
        return '#C084FC';
      case 'In Use':
        return '#FACC15';
      case 'Maintenance':
        return '#F43F5E';
    }
  };

  const getServedBadgeColor = (served: string) => {
    if (served.includes('Edge')) return { bg: 'bg-[#C084FC]/25', border: 'border-[#C084FC]/50', text: 'text-[#E9D5FF]' };
    if (served === 'Central DB') return { bg: 'badge-yellow', border: 'border-[#FACC15]/60', text: 'text-[#FACC15]' };
    return { bg: 'bg-[#F43F5E]/20', border: 'border-[#F43F5E]/50', text: 'text-[#F43F5E]' };
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-3 pb-3 border-b border-white/10 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search resources by name, ID or specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder-white/35 focus:outline-none focus:border-[#FACC15] font-sans"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase tracking-wider">
              Zone
            </label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full bg-[#1F0A2E] border border-white/20 text-white text-[11px] font-mono rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FACC15]"
            >
              <option value="any">Any Zone</option>
              <option value="zone-a">Zone A (Admin)</option>
              <option value="zone-b">Zone B (Engg)</option>
              <option value="zone-c">Zone C (Sports)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase tracking-wider">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType | 'any')}
              className="w-full bg-[#1F0A2E] border border-white/20 text-white text-[11px] font-mono rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FACC15]"
            >
              <option value="any">Any Type</option>
              <option value="Lab">Lab</option>
              <option value="Equipment">Equipment</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Projector">Projector</option>
              <option value="Room">Room</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono text-white/50 block mb-1 uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus | 'any')}
              className="w-full bg-[#1F0A2E] border border-white/20 text-white text-[11px] font-mono rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FACC15]"
            >
              <option value="any">Any Status</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
            {(['1h', '24h', '7d', 'custom'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                  timeRange === range
                    ? 'badge-yellow-solid'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isQueryLoading}
            className="px-4 py-1.5 rounded-xl badge-yellow-solid text-xs flex items-center gap-1.5 hover:bg-[#FEF08A] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isQueryLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Routing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Query</span>
              </>
            )}
          </button>
        </div>

        {timeRange === 'custom' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-[#1F0A2E] border border-white/20 text-white text-[10px] font-mono rounded-lg px-2 py-1"
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-[#1F0A2E] border border-white/20 text-white text-[10px] font-mono rounded-lg px-2 py-1"
            />
          </div>
        )}
      </form>

      {activeQueryResult && (
        <div className="py-2.5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {(() => {
              const b = getServedBadgeColor(activeQueryResult.servedBy);
              return (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${b.bg} ${b.border} ${b.text}`}
                >
                  Served: {activeQueryResult.servedBy}
                </span>
              );
            })()}

            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                activeQueryResult.latencyMs < 200
                  ? 'bg-[#C084FC]/20 border-[#C084FC]/40 text-[#E9D5FF]'
                  : 'bg-[#FACC15]/20 border-[#FACC15]/50 text-[#FACC15]'
              }`}
            >
              {activeQueryResult.latencyMs} ms
            </span>

            {activeQueryResult.cacheHit && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold badge-yellow">
                Cache Hit
              </span>
            )}
          </div>

          <button
            onClick={clearActiveQuery}
            className="text-[10px] font-mono text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>Clear</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {activeQueryResult && (
        <div className="py-2 px-1 border-b border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-white/60 overflow-x-auto whitespace-nowrap shrink-0">
          <span className="text-white/40">Route:</span>
          {activeQueryResult.path.map((segment, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`px-1.5 py-0.5 rounded ${
                  segment.includes('Edge')
                    ? 'bg-[#C084FC]/20 text-[#E9D5FF] border border-[#C084FC]/40'
                    : segment === 'Central DB'
                    ? 'badge-yellow'
                    : 'bg-white/5 text-white/70'
                }`}
              >
                {segment}
              </span>
              {idx < activeQueryResult.path.length - 1 && (
                <span className="text-white/30">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pt-2 space-y-2 pr-1">
        {activeQueryResult && activeQueryResult.results.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-xs font-mono">
            No resources match current query filter.
          </div>
        ) : (
          (activeQueryResult ? activeQueryResult.results : []).map((res) => {
            const z = ZONES.find((zn) => zn.id === res.zoneId);
            const statusColor = getStatusColor(res.status);

            return (
              <div
                key={res.id}
                onMouseEnter={() => setHoveredResourceId(res.id)}
                onMouseLeave={() => setHoveredResourceId(null)}
                onClick={() => focusResourceOnMap(res)}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/20 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md badge-yellow text-[10px] font-mono font-bold">
                      {res.id}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-[#FACC15] transition-colors truncate max-w-[190px]">
                      {res.name}
                    </span>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border"
                    style={{
                      backgroundColor: `${statusColor}18`,
                      borderColor: `${statusColor}40`,
                      color: statusColor,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    {res.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <div className="flex items-center gap-1.5">
                    {renderTypeIcon(res.type)}
                    <span>{res.type}</span>
                  </div>

                  <span
                    className="font-mono text-[10px]"
                    style={{ color: z?.themeColor || '#DEC7E7' }}
                  >
                    {z?.code} • {z?.shortName}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 border-t border-white/10 shrink-0">
        <button
          onClick={() => setIsRecentOpen(!isRecentOpen)}
          className="flex items-center justify-between w-full text-xs font-mono text-white/60 hover:text-white py-1 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#FACC15]" />
            <span>Recent Queries ({recentQueries.length})</span>
          </div>
          {isRecentOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <AnimatePresence>
          {isRecentOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-1.5 pt-2 max-h-36 overflow-y-auto"
            >
              {recentQueries.length === 0 ? (
                <div className="text-[11px] text-white/40 font-mono text-center py-2">
                  No previous runs
                </div>
              ) : (
                recentQueries.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleRerun(item)}
                    className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 flex items-center justify-between text-[11px] font-mono cursor-pointer transition-colors"
                  >
                    <div className="truncate max-w-[210px] text-white/80">
                      <span>{item.query.zoneId !== 'any' ? item.query.zoneId.toUpperCase() : 'ANY'}</span>
                      {' • '}
                      <span>{item.query.type}</span>
                      {item.query.search ? ` • "${item.query.search}"` : ''}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#FACC15]">{item.latencyMs}ms</span>
                      <span className="text-white/40 text-[10px]">Re-run</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

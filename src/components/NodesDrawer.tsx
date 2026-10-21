import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { EdgeNode } from '../types';
import { ZONES } from '../data/mockData';
import {
  Power,
  RefreshCw,
  Plus,
  Scale,
  Lock,
} from 'lucide-react';
import { AddNodeModal } from './AddNodeModal';

export const NodesDrawer: React.FC = () => {
  const {
    role,
    nodes,
    resources,
    toggleNodeStatus,
    syncNode,
    rebalanceZones,
    addNode,
    addToast,
  } = useStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);

  const isAdmin = role === 'Admin';

  const handleToggleOnline = (node: EdgeNode) => {
    toggleNodeStatus(node.id);
    const nextWillBeOffline = node.status === 'online' || node.status === 'syncing';
    if (nextWillBeOffline) {
      addToast({
        title: `${node.code} Offline`,
        message: 'Network partition simulated. Changes in this zone will be queued locally.',
        type: 'berry',
      });
    } else {
      addToast({
        title: `${node.code} Online`,
        message: 'Reconnected to central backbone. Ready to reconcile write-ahead queue.',
        type: 'teal',
      });
    }
  };

  const handleSyncNode = async (node: EdgeNode) => {
    if (node.status === 'offline' || node.queuedCount === 0) return;
    await syncNode(node.id);
  };

  const handleRebalance = async () => {
    if (!isAdmin || isRebalancing) return;
    setIsRebalancing(true);
    await rebalanceZones();
    setIsRebalancing(false);
  };

  const totalRes = resources.length;
  const zoneCounts: Record<string, number> = {};
  ZONES.forEach((z) => {
    zoneCounts[z.id] = resources.filter((r) => r.zoneId === z.id).length;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-4 pr-1">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div>
          <span className="text-xs font-semibold text-white font-heading block">
            Mesh Topology
          </span>
          <span className="text-[10px] text-white/50 font-mono">
            {nodes.length} edge nodes active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              onClick={handleRebalance}
              disabled={!isAdmin || isRebalancing}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border cursor-pointer ${
                isAdmin
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  : 'bg-white/[0.02] border-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              {!isAdmin && <Lock className="w-3 h-3 text-[#FACC15]" />}
              <Scale className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin' : ''}`} />
              <span>{isRebalancing ? 'Rebalancing...' : 'Rebalance'}</span>
            </button>
            {!isAdmin && (
              <div className="absolute right-0 -top-8 px-2 py-1 rounded bg-[#1C092C] text-[10px] font-mono text-white/80 border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                Admin only
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!isAdmin}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
                isAdmin
                  ? 'badge-yellow-solid'
                  : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
              }`}
            >
              {!isAdmin && <Lock className="w-3 h-3 text-[#FACC15]" />}
              <Plus className="w-3.5 h-3.5" />
              <span>Add Node</span>
            </button>
            {!isAdmin && (
              <div className="absolute right-0 -top-8 px-2 py-1 rounded bg-[#1C092C] text-[10px] font-mono text-white/80 border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                Admin only
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 shrink-0">
        {nodes.map((node) => {
          const isOnline = node.status === 'online';
          const isSyncing = node.status === 'syncing';
          const isOffline = node.status === 'offline';

          const statusColor = isOnline ? '#C084FC' : isSyncing ? '#FACC15' : '#F43F5E';
          const zone = ZONES.find((z) => z.id === node.zoneId);

          return (
            <div
              key={node.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border font-mono text-xs font-bold"
                    style={{
                      backgroundColor: `${statusColor}20`,
                      borderColor: `${statusColor}50`,
                      color: statusColor,
                    }}
                  >
                    {node.code.replace('EDGE ', '')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">
                      {node.name}
                    </h4>
                    <span className="text-[10px] font-mono text-white/50">
                      {zone?.code} • {zone?.shortName}
                    </span>
                  </div>
                </div>

                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border"
                  style={{
                    backgroundColor: `${statusColor}18`,
                    borderColor: `${statusColor}40`,
                    color: statusColor,
                  }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${!isOffline ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="capitalize">{node.status}</span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-white/60">
                  <span>Compute Load</span>
                  <span className="text-white/90">{node.loadPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${node.loadPercent}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span className="text-white/50">Queued</span>
                  <span
                    className={`font-bold ${
                      node.queuedCount > 0 ? 'badge-yellow px-1.5 py-0.5 rounded text-[10px]' : 'text-white/70'
                    }`}
                  >
                    {node.queuedCount} pending
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span className="text-white/50">Last Sync</span>
                  <span className="text-white/80 font-medium">{node.lastSync}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={() => handleToggleOnline(node)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border cursor-pointer ${
                    isOffline
                      ? 'bg-[#C084FC]/20 hover:bg-[#C084FC]/30 border-[#C084FC]/40 text-[#DEC7E7]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOffline ? 'Bring Online' : 'Simulate Offline'}</span>
                </button>

                <button
                  onClick={() => handleSyncNode(node)}
                  disabled={isOffline || node.queuedCount === 0 || node.isSyncingInProgress}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    node.queuedCount > 0 && !isOffline
                      ? 'badge-yellow-solid'
                      : 'bg-white/[0.02] border border-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      node.isSyncingInProgress ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Sync Now</span>
                </button>
              </div>

              {node.isSyncingInProgress && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#FACC15]">
                    <span>Replaying Write-Ahead Log...</span>
                    <span>{node.syncProgress || 45}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#FACC15] rounded-full transition-all duration-150"
                      style={{ width: `${node.syncProgress || 45}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white/60">Partition Distribution</span>
          <span className="text-white/90 font-bold">{totalRes} Resources</span>
        </div>

        <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden flex">
          {ZONES.map((zone) => {
            const count = zoneCounts[zone.id] || 0;
            const pct = (count / totalRes) * 100;
            return (
              <div
                key={zone.id}
                title={`${zone.name}: ${count} resources (${Math.round(pct)}%)`}
                style={{
                  width: `${pct}%`,
                  backgroundColor: zone.themeColor,
                }}
                className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full hover:brightness-125"
              />
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono text-white/60">
          {ZONES.map((zone) => (
            <div key={zone.id} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: zone.themeColor }}
              />
              <span className="truncate">{zone.code}: {zoneCounts[zone.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <AddNodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (nodeData) => {
          await addNode(nodeData);
        }}
      />
    </div>
  );
};

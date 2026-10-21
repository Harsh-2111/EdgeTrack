import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useStore } from '../store/useStore';
import { Zap, Activity, Clock, Server, Play, Loader2 } from 'lucide-react';

export const InsightsDrawer: React.FC = () => {
  const { queryMetrics, nodes, runDemoLoad, isDemoLoadRunning } = useStore();

  const totalQueries = queryMetrics.length;
  const avgLatency =
    totalQueries > 0
      ? Math.round(queryMetrics.reduce((acc, m) => acc + m.latencyMs, 0) / totalQueries)
      : 58;
  const edgeHits = queryMetrics.filter((m) => m.cacheHit).length;
  const edgeHitRate = totalQueries > 0 ? Math.round((edgeHits / totalQueries) * 100) : 84;
  const offlineNodesCount = nodes.filter((n) => n.status === 'offline').length;

  const lineChartData = queryMetrics.slice(-20).map((m, idx) => ({
    index: idx + 1,
    time: m.timestamp.slice(-5),
    latency: m.latencyMs,
  }));

  const edgeCount = queryMetrics.filter((m) => m.servedBy.includes('Edge')).length;
  const dbCount = queryMetrics.filter((m) => m.servedBy === 'Central DB').length;
  const offlineCount = queryMetrics.filter((m) => m.servedBy === 'Offline cache').length;

  const donutData = [
    { name: 'Edge Node', value: edgeCount || 1, color: '#C084FC' },
    { name: 'Central DB', value: dbCount || 1, color: '#FACC15' },
    { name: 'Offline Cache', value: offlineCount || 1, color: '#F43F5E' },
  ];

  const barData = [
    { name: 'Zone A', queries: queryMetrics.filter((m) => m.zoneId === 'zone-a').length, fill: '#DEC7E7' },
    { name: 'Zone B', queries: queryMetrics.filter((m) => m.zoneId === 'zone-b').length, fill: '#FACC15' },
    { name: 'Zone C', queries: queryMetrics.filter((m) => m.zoneId === 'zone-c').length, fill: '#C084FC' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3.5 pr-1">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/8 shrink-0">
        <div>
          <span className="text-xs font-semibold text-white font-heading block">
            Live Telemetry Engine
          </span>
          <span className="text-[10px] text-white/50 font-mono">
            {totalQueries} queries recorded
          </span>
        </div>
        <button
          onClick={runDemoLoad}
          disabled={isDemoLoadRunning}
          className="px-3 py-1.5 rounded-xl badge-yellow-solid text-xs flex items-center gap-1.5 hover:bg-[#FEF08A] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isDemoLoadRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Run demo load</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 shrink-0">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between text-white/40 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-3 h-3 text-[#C084FC]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {avgLatency} <span className="text-xs font-normal text-white/50">ms</span>
          </div>
          <div className="text-[10px] font-mono text-[#DEC7E7] mt-0.5">
            {avgLatency < 120 ? 'Optimal Edge P95' : 'Central DB bound'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between text-white/40 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Edge Hit Rate</span>
            <Zap className="w-3 h-3 text-[#FACC15]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {edgeHitRate}%
          </div>
          <div className="text-[10px] font-mono text-[#FACC15] mt-0.5">
            {edgeHits} served locally
          </div>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white font-heading">
            Latency Timeline (ms)
          </span>
          <span className="text-[10px] font-mono text-white/40">Last 20 queries</span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#ffffff30" fontSize={9} tickLine={false} />
              <YAxis stroke="#ffffff30" fontSize={9} tickLine={false} domain={[0, 550]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E0B2D',
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              <ReferenceLine y={120} stroke="#C084FC" strokeDasharray="3 3" opacity={0.6} />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#FACC15"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#FACC15' }}
                activeDot={{ r: 4.5, fill: '#FEF08A' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1 border-t border-white/5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#FACC15]" /> Latency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#C084FC] border-dashed" /> 120ms Edge Target
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 shrink-0">
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
          <span className="text-xs font-semibold text-white font-heading block">
            Resolution Source
          </span>
          <div className="h-24 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={24}
                  outerRadius={38}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 font-mono text-[9px]">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-white/70">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
          <span className="text-xs font-semibold text-white font-heading block">
            Queries per Zone
          </span>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 0, left: -30, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={8.5} tickLine={false} />
                <YAxis stroke="#ffffff30" fontSize={8} tickLine={false} />
                <Bar dataKey="queries" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] font-mono text-white/40 text-center">
            Local partition query volume
          </div>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2 shrink-0">
        <span className="text-xs font-semibold text-white font-heading block">
          Network Topology Health
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-white/40 block">Mesh Status</span>
            <span className="text-[#C084FC] font-semibold flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3" />
              {offlineNodesCount === 0 ? 'Full Quorum' : `${offlineNodesCount} Partitioned`}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-white/40 block">Backbone Hub</span>
            <span className="text-[#FACC15] font-semibold flex items-center gap-1 mt-0.5">
              <Server className="w-3 h-3" />
              Sync Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

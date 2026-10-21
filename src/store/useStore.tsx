import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserRole,
  EdgeNode,
  Resource,
  AuditLogEntry,
  PanelTab,
  ResourceStatus,
  NodeStatus,
  QueryParams,
  QueryResult,
  QueryMetric,
  ActiveQueryAnimation,
  ToastNotification,
  DemoScenarioState,
  CampusZone,
} from '../types';
import {
  INITIAL_EDGE_NODES,
  INITIAL_RESOURCES,
  INITIAL_AUDIT_LOG,
  ZONES as BASE_ZONES,
} from '../data/mockData';
import { runQuery, generateSeedMetrics, ZONE_TO_EDGE } from '../lib/simulator';
import { computeEntryHash, verifyHashChain, GENESIS_HASH } from '../lib/crypto';

interface EdgeTrackState {
  role: UserRole;
  nodes: EdgeNode[];
  resources: Resource[];
  zones: CampusZone[];
  auditLog: AuditLogEntry[];
  selectedResourceId: string | null;
  hoveredResourceId: string | null;
  activePanel: PanelTab;
  systemClock: string;
  zoom: number;
  pan: { x: number; y: number };

  queryMetrics: QueryMetric[];
  recentQueries: QueryResult[];
  activeQueryResult: QueryResult | null;
  activeQueryAnimation: ActiveQueryAnimation | null;
  floatingLatencyTag: { nodeId: string; latencyMs: number } | null;
  isQueryLoading: boolean;
  isDemoLoadRunning: boolean;

  toasts: ToastNotification[];
  isTampered: boolean;
  demoState: DemoScenarioState;

  setRole: (role: UserRole) => void;
  setSelectedResourceId: (id: string | null) => void;
  setHoveredResourceId: (id: string | null) => void;
  setActivePanel: (panel: PanelTab) => void;
  updateResourceStatus: (id: string, nextStatus: ResourceStatus) => Promise<void>;
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  toggleNodeStatus: (nodeId: string) => void;
  syncNode: (nodeId: string) => Promise<void>;
  addNode: (nodeData: { name: string; zoneId: string; isNewZone: boolean; zoneName?: string }) => Promise<void>;
  rebalanceZones: () => Promise<void>;
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  setZoom: (zoomOrUpdater: number | ((prev: number) => number)) => void;
  setPan: (panOrUpdater: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  resetView: () => void;
  focusResourceOnMap: (resource: Resource) => void;

  executeUserQuery: (params: QueryParams) => Promise<QueryResult>;
  clearActiveQuery: () => void;
  runDemoLoad: () => Promise<void>;

  verifyAuditChain: () => { valid: boolean; tamperedIndex: number | null; reason?: string };
  simulateTampering: () => void;
  restoreTampering: () => void;
  exportAuditCsv: (customEntries?: AuditLogEntry[]) => void;

  startDemo: () => void;
  stopDemo: () => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<EdgeTrackState | null>(null);

const STORAGE_KEY_ROLE = 'edgetrack_role_v3';
const STORAGE_KEY_LOGS = 'edgetrack_audit_logs_v3';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      if (saved === 'Admin' || saved === 'Staff' || saved === 'Auditor') return saved;
    } catch {
      return 'Admin';
    }
    return 'Admin';
  });

  const [nodes, setNodes] = useState<EdgeNode[]>(INITIAL_EDGE_NODES);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [zones, setZones] = useState<CampusZone[]>(BASE_ZONES);

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      return INITIAL_AUDIT_LOG;
    }
    return INITIAL_AUDIT_LOG;
  });

  const [isTampered, setIsTampered] = useState<boolean>(false);
  const untamperedBackupRef = useRef<AuditLogEntry[] | null>(null);

  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [hoveredResourceId, setHoveredResourceId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<PanelTab>('map');
  const [systemClock, setSystemClock] = useState<string>('00:00:00 UTC');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [queryMetrics, setQueryMetrics] = useState<QueryMetric[]>(() => generateSeedMetrics());
  const [recentQueries, setRecentQueries] = useState<QueryResult[]>([]);
  const [activeQueryResult, setActiveQueryResult] = useState<QueryResult | null>(null);
  const [activeQueryAnimation, setActiveQueryAnimation] = useState<ActiveQueryAnimation | null>(null);
  const [floatingLatencyTag, setFloatingLatencyTag] = useState<{ nodeId: string; latencyMs: number } | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);
  const [isDemoLoadRunning, setIsDemoLoadRunning] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [demoState, setDemoState] = useState<DemoScenarioState>({
    isActive: false,
    step: 0,
    totalSteps: 6,
    caption: '',
  });

  const latencyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemClock(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, newRole);
    } catch {
      return;
    }
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `TOAST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev.slice(-4), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateResourceStatus = useCallback(
    async (id: string, nextStatus: ResourceStatus) => {
      const target = resources.find((r) => r.id === id);
      if (!target) return;
      const prevStatus = target.status;
      if (prevStatus === nextStatus) return;

      const targetNodeId = ZONE_TO_EDGE[target.zoneId] || 'edge-b';
      const targetNode = nodes.find((n) => n.id === targetNodeId);
      const isNodeOffline = targetNode?.status === 'offline';

      setResources((prev) =>
        prev.map((res) => {
          if (res.id === id) {
            return {
              ...res,
              status: nextStatus,
              updatedAt: 'Just now',
            };
          }
          return res;
        })
      );

      if (isNodeOffline) {
        setNodes((prev) =>
          prev.map((n) => (n.id === targetNodeId ? { ...n, queuedCount: n.queuedCount + 1 } : n))
        );
        addToast({
          title: 'Offline Change Queued',
          message: `${target.name} status updated locally on ${targetNode?.code}. Pending central sync.`,
          type: 'gold',
        });
      } else {
        addToast({
          title: 'Resource Updated',
          message: `${target.name} marked as ${nextStatus} via ${targetNode?.code}.`,
          type: 'teal',
        });
      }

      const latestHash = auditLog.length > 0 ? auditLog[0].hash : GENESIS_HASH;
      const logId = `LOG-${(auditLog.length + 1).toString().padStart(3, '0')}`;
      const nowTime = new Date().toLocaleTimeString();
      const nodeOrigin = targetNode?.code || 'EDGE B';
      const user = `${role} Operator`;

      const newHash = computeEntryHash(latestHash, {
        id: logId,
        timestamp: nowTime,
        nodeId: nodeOrigin,
        action: 'UPDATE',
        resourceId: id,
        user,
        oldValue: prevStatus,
        newValue: nextStatus,
      });

      const newEntry: AuditLogEntry = {
        id: logId,
        timestamp: nowTime,
        nodeId: nodeOrigin,
        nodeOrigin,
        action: 'UPDATE',
        resourceId: id,
        resourceName: target.name,
        performedBy: user,
        user,
        role,
        oldValue: prevStatus,
        newValue: nextStatus,
        hash: newHash,
        prevHash: latestHash,
        synced: !isNodeOffline,
      };

      setAuditLog((prev) => {
        const next = [newEntry, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(next));
        } catch {
          return next;
        }
        return next;
      });
    },
    [resources, nodes, role, auditLog, addToast]
  );

  const syncNode = useCallback(
    async (nodeId: string) => {
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode || targetNode.queuedCount === 0 || targetNode.status === 'offline') return;

      const countToSync = targetNode.queuedCount;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, status: 'syncing', isSyncingInProgress: true, syncProgress: 10 }
            : n
        )
      );

      addToast({
        title: `Reconciling ${targetNode.code}`,
        message: `Streaming ${countToSync} pending write-ahead transaction(s) to Central DB...`,
        type: 'gold',
      });

      for (let p = 20; p <= 100; p += 25) {
        await new Promise((r) => setTimeout(r, 220));
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, syncProgress: p } : n))
        );
      }

      setAuditLog((prev) => {
        const updated = prev.map((entry) => {
          if (entry.nodeId === targetNode.code && !entry.synced) {
            return { ...entry, synced: true };
          }
          return entry;
        });
        try {
          localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
        } catch {
          return updated;
        }
        return updated;
      });

      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                status: 'online',
                queuedCount: 0,
                lastSync: 'Just now',
                isSyncingInProgress: false,
                syncProgress: 100,
              }
            : n
        )
      );

      addToast({
        title: `${targetNode.code} Synchronized`,
        message: `All ${countToSync} offline change(s) verified & committed to Central DB.`,
        type: 'teal',
      });
    },
    [nodes, addToast]
  );

  const toggleNodeStatus = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id !== nodeId) return node;
          const nextStatus: NodeStatus = node.status === 'offline' ? 'online' : 'offline';
          return {
            ...node,
            status: nextStatus,
          };
        })
      );
    },
    []
  );

  const setNodeStatus = useCallback((nodeId: string, status: NodeStatus) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, status } : node))
    );
  }, []);

  const addNode = useCallback(
    async (nodeData: { name: string; zoneId: string; isNewZone: boolean; zoneName?: string }) => {
      const newNodeId = `edge-${Date.now().toString(36).substring(4, 7)}`;
      const nodeLetter = String.fromCharCode(65 + nodes.length);
      const nodeCode = `EDGE ${nodeLetter}`;

      let assignedZoneId = nodeData.zoneId;

      if (nodeData.isNewZone) {
        assignedZoneId = `zone-${nodeLetter.toLowerCase()}`;
        const newZone: CampusZone = {
          id: assignedZoneId,
          code: `ZONE ${nodeLetter}`,
          name: nodeData.zoneName || `Innovation Quad ${nodeLetter}`,
          shortName: 'Innovation Annex',
          themeColor: '#FACC15',
          borderColor: 'rgba(250, 204, 21, 0.5)',
          fillColor: 'rgba(250, 204, 21, 0.08)',
          description: 'Special innovation partition deployed by Admin',
          x: 1040,
          y: 540,
          width: 320,
          height: 300,
        };
        setZones((prev) => [...prev, newZone]);

        setResources((prev) => {
          let count = 0;
          return prev.map((res) => {
            if (count < 4 && res.x > 800 && res.y > 500) {
              count++;
              return { ...res, zoneId: assignedZoneId };
            }
            return res;
          });
        });
      }

      const newNode: EdgeNode = {
        id: newNodeId,
        name: nodeData.name,
        code: nodeCode,
        zoneId: assignedZoneId,
        status: 'online',
        loadPercent: 24,
        lastSync: 'Just now',
        latencyMs: 12,
        x: nodeData.isNewZone ? 1160 : 680,
        y: nodeData.isNewZone ? 660 : 420,
        connectedClients: 16,
        queuedCount: 0,
      };

      setNodes((prev) => [...prev, newNode]);

      addToast({
        title: `Node ${nodeCode} Deployed`,
        message: `${nodeData.name} initialized on partition ${assignedZoneId.toUpperCase()}.`,
        type: 'teal',
      });
    },
    [nodes, addToast]
  );

  const rebalanceZones = useCallback(async () => {
    const counts: Record<string, number> = {};
    resources.forEach((r) => {
      counts[r.zoneId] = (counts[r.zoneId] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length < 2) return;

    const busiest = entries[0][0];
    const lightest = entries[entries.length - 1][0];

    let moved = 0;
    setResources((prev) =>
      prev.map((res) => {
        if (res.zoneId === busiest && moved < 2) {
          moved++;
          return {
            ...res,
            zoneId: lightest,
            updatedAt: 'Just now',
          };
        }
        return res;
      })
    );

    addToast({
      title: 'Partition Rebalanced',
      message: `Reallocated 2 workloads from ${busiest.toUpperCase()} to ${lightest.toUpperCase()} for load balancing.`,
      type: 'teal',
    });
  }, [resources, addToast]);

  const verifyAuditChain = useCallback(() => {
    return verifyHashChain(auditLog);
  }, [auditLog]);

  const simulateTampering = useCallback(() => {
    if (auditLog.length === 0 || isTampered) return;
    untamperedBackupRef.current = [...auditLog];

    const targetIdx = Math.min(3, auditLog.length - 1);
    setAuditLog((prev) => {
      const copy = [...prev];
      copy[targetIdx] = {
        ...copy[targetIdx],
        newValue: 'FORGED_ACCESS_GRANTED',
        hash: 'deadbeef00000000000000000000000000000000000000000000000000000000',
      };
      return copy;
    });
    setIsTampered(true);

    addToast({
      title: 'Tampering Injected',
      message: `Audit entry at index ${targetIdx} modified in memory. Click "Verify chain" to detect forgery!`,
      type: 'berry',
    });
  }, [auditLog, isTampered, addToast]);

  const restoreTampering = useCallback(() => {
    if (untamperedBackupRef.current) {
      setAuditLog(untamperedBackupRef.current);
      untamperedBackupRef.current = null;
    }
    setIsTampered(false);
    addToast({
      title: 'Ledger Restored',
      message: 'Cryptographic hash chain restored to valid state.',
      type: 'teal',
    });
  }, [addToast]);

  const exportAuditCsv = useCallback((customEntries?: AuditLogEntry[]) => {
    const dataToExport = customEntries || auditLog;
    const headers = ['ID', 'Timestamp', 'Node', 'Action', 'ResourceID', 'ResourceName', 'User', 'Role', 'OldValue', 'NewValue', 'Hash', 'PrevHash', 'Synced'];
    const rows = dataToExport.map((e) => [
      e.id,
      e.timestamp,
      e.nodeId,
      e.action,
      e.resourceId,
      `"${e.resourceName || ''}"`,
      `"${e.user}"`,
      e.role,
      e.oldValue || '-',
      e.newValue || '-',
      e.hash,
      e.prevHash,
      e.synced ? 'YES' : 'PENDING',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EdgeTrack_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [auditLog]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const focusResourceOnMap = useCallback((resource: Resource) => {
    setSelectedResourceId(resource.id);
    const targetZoom = 1.35;
    const nextPanX = (700 - resource.x) * targetZoom;
    const nextPanY = (450 - resource.y) * targetZoom;
    setZoom(targetZoom);
    setPan({ x: nextPanX, y: nextPanY });
  }, []);

  const executeUserQuery = useCallback(
    async (params: QueryParams): Promise<QueryResult> => {
      setIsQueryLoading(true);
      const targetNodeId = params.zoneId !== 'any' ? ZONE_TO_EDGE[params.zoneId] : 'edge-b';
      const fellBackToDb = params.zoneId === 'any';

      setActiveQueryAnimation({
        id: `ANIM-${Date.now()}`,
        stage: 'client-to-router',
        targetNodeId,
        fellBackToDb,
        latencyMs: 100,
        servedBy: 'Edge B',
      });

      try {
        const result = await runQuery(params, resources, nodes);

        setActiveQueryAnimation({
          id: result.id,
          stage: 'completed',
          targetNodeId,
          fellBackToDb: result.servedBy === 'Central DB',
          latencyMs: result.latencyMs,
          servedBy: result.servedBy,
        });

        setFloatingLatencyTag({
          nodeId: targetNodeId,
          latencyMs: result.latencyMs,
        });
        if (latencyTimeoutRef.current) clearTimeout(latencyTimeoutRef.current);
        latencyTimeoutRef.current = setTimeout(() => {
          setFloatingLatencyTag(null);
          setActiveQueryAnimation(null);
        }, 3200);

        setActiveQueryResult(result);
        setRecentQueries((prev) => [result, ...prev.slice(0, 4)]);

        const newMetric: QueryMetric = {
          id: result.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          latencyMs: result.latencyMs,
          servedBy: result.servedBy,
          zoneId: params.zoneId,
          cacheHit: result.cacheHit,
          resultCount: result.results.length,
        };
        setQueryMetrics((prev) => [...prev.slice(-24), newMetric]);

        return result;
      } finally {
        setIsQueryLoading(false);
      }
    },
    [resources, nodes]
  );

  const clearActiveQuery = useCallback(() => {
    setActiveQueryResult(null);
    setActiveQueryAnimation(null);
    setFloatingLatencyTag(null);
  }, []);

  const runDemoLoad = useCallback(async () => {
    if (isDemoLoadRunning) return;
    setIsDemoLoadRunning(true);

    const zList = ['any', 'zone-a', 'zone-b', 'zone-c'] as const;
    const tList = ['any', 'Lab', 'Equipment', 'Vehicle', 'Projector', 'Room'] as const;
    const sList = ['any', 'Available', 'In Use', 'Maintenance'] as const;

    for (let i = 0; i < 20; i++) {
      const randomZone = zList[Math.floor(Math.random() * zList.length)];
      const randomType = tList[Math.floor(Math.random() * tList.length)];
      const randomStatus = sList[Math.floor(Math.random() * sList.length)];

      const queryParams: QueryParams = {
        zoneId: randomZone,
        type: randomType,
        status: randomStatus,
        timeRange: '24h',
      };

      const targetNodeId = randomZone !== 'any' ? ZONE_TO_EDGE[randomZone] : 'edge-b';
      const isMultiZone = randomZone === 'any';
      const isEdgeOffline = nodes.find((n) => n.id === targetNodeId)?.status === 'offline';

      let latencyMs: number;
      let servedBy: QueryMetric['servedBy'];
      let cacheHit: boolean;

      if (isMultiZone) {
        latencyMs = Math.floor(Math.random() * (490 - 240)) + 240;
        servedBy = 'Central DB';
        cacheHit = false;
      } else if (isEdgeOffline) {
        latencyMs = Math.floor(Math.random() * (75 - 25)) + 25;
        servedBy = 'Offline cache';
        cacheHit = true;
      } else {
        const isHit = Math.random() > 0.15;
        latencyMs = isHit ? Math.floor(Math.random() * (110 - 25)) + 25 : Math.floor(Math.random() * (450 - 260)) + 260;
        servedBy = isHit
          ? targetNodeId === 'edge-a'
            ? 'Edge A'
            : targetNodeId === 'edge-b'
            ? 'Edge B'
            : 'Edge C'
          : 'Central DB';
        cacheHit = isHit;
      }

      const syntheticMetric: QueryMetric = {
        id: `DEMO-${Date.now()}-${i}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        latencyMs,
        servedBy,
        zoneId: randomZone,
        cacheHit,
        resultCount: Math.floor(Math.random() * 8) + 1,
      };

      setQueryMetrics((prev) => [...prev.slice(-24), syntheticMetric]);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    setIsDemoLoadRunning(false);
  }, [isDemoLoadRunning, nodes]);

  const stopDemo = useCallback(() => {
    if (demoIntervalRef.current) {
      clearTimeout(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setDemoState({
      isActive: false,
      step: 0,
      totalSteps: 6,
      caption: '',
    });
    addToast({
      title: 'Demo Stopped',
      message: 'Returned to manual interactive mode.',
      type: 'info',
    });
  }, [addToast]);

  const startDemo = useCallback(() => {
    setDemoState({
      isActive: true,
      step: 1,
      totalSteps: 6,
      caption: '1. Query served by edge (42ms sub-100ms response)',
    });

    setActivePanel('query');
    executeUserQuery({
      zoneId: 'zone-a',
      type: 'any',
      status: 'any',
      timeRange: '24h',
    });

    demoIntervalRef.current = setTimeout(() => {
      setDemoState({
        isActive: true,
        step: 2,
        totalSteps: 6,
        caption: '2. Cache miss -> Central DB (Multi-zone fallback & warmup)',
      });
      executeUserQuery({
        zoneId: 'any',
        type: 'Equipment',
        status: 'any',
        timeRange: '24h',
      });

      demoIntervalRef.current = setTimeout(() => {
        setDemoState({
          isActive: true,
          step: 3,
          totalSteps: 6,
          caption: '3. Edge B goes offline (Simulating mesh partition)',
        });
        setActivePanel('nodes');
        toggleNodeStatus('edge-b');

        demoIntervalRef.current = setTimeout(() => {
          setDemoState({
            isActive: true,
            step: 4,
            totalSteps: 6,
            caption: '4. Change queued offline (Write-ahead transaction logged)',
          });
          const zoneBRes = resources.find((r) => r.zoneId === 'zone-b') || resources[10];
          setSelectedResourceId(zoneBRes.id);
          updateResourceStatus(zoneBRes.id, zoneBRes.status === 'Available' ? 'In Use' : 'Available');

          demoIntervalRef.current = setTimeout(() => {
            setDemoState({
              isActive: true,
              step: 5,
              totalSteps: 6,
              caption: '5. Back online -> synced (Replaying queued updates with gold beam)',
            });
            toggleNodeStatus('edge-b');
            setTimeout(() => {
              syncNode('edge-b');
            }, 600);

            demoIntervalRef.current = setTimeout(() => {
              setDemoState({
                isActive: true,
                step: 6,
                totalSteps: 6,
                caption: '6. Audit chain verified (Validating SHA-256 cryptographic proof)',
              });
              setActivePanel('audit');

              demoIntervalRef.current = setTimeout(() => {
                setDemoState({
                  isActive: false,
                  step: 6,
                  totalSteps: 6,
                  caption: 'Demo complete!',
                });
                addToast({
                  title: 'Guided Demo Complete',
                  message: 'Successfully demonstrated edge queries, offline partitions, and immutable ledger!',
                  type: 'teal',
                });
              }, 6000);
            }, 9000);
          }, 8000);
        }, 8000);
      }, 9000);
    }, 8000);
  }, [executeUserQuery, toggleNodeStatus, resources, updateResourceStatus, syncNode, addToast]);

  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_LOGS);
    } catch {
      return;
    }
    setRoleState('Admin');
    setNodes(INITIAL_EDGE_NODES);
    setResources(INITIAL_RESOURCES);
    setZones(BASE_ZONES);
    setAuditLog(INITIAL_AUDIT_LOG);
    setIsTampered(false);
    clearActiveQuery();
    addToast({
      title: 'Reset to Factory Demo State',
      message: 'All zones, nodes, resources, and cryptographic logs restored.',
      type: 'teal',
    });
  }, [clearActiveQuery, addToast]);

  const value: EdgeTrackState = {
    role,
    nodes,
    resources,
    zones,
    auditLog,
    selectedResourceId,
    hoveredResourceId,
    activePanel,
    systemClock,
    zoom,
    pan,
    queryMetrics,
    recentQueries,
    activeQueryResult,
    activeQueryAnimation,
    floatingLatencyTag,
    isQueryLoading,
    isDemoLoadRunning,
    toasts,
    isTampered,
    demoState,
    setRole,
    setSelectedResourceId,
    setHoveredResourceId,
    setActivePanel,
    updateResourceStatus,
    setNodeStatus,
    toggleNodeStatus,
    syncNode,
    addNode,
    rebalanceZones,
    addToast,
    removeToast,
    setZoom,
    setPan,
    resetView,
    focusResourceOnMap,
    executeUserQuery,
    clearActiveQuery,
    runDemoLoad,
    verifyAuditChain,
    simulateTampering,
    restoreTampering,
    exportAuditCsv,
    startDemo,
    stopDemo,
    resetDemoData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): EdgeTrackState {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

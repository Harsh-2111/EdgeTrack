import {
  Resource,
  EdgeNode,
  QueryParams,
  QueryResult,
  ServedByType,
  QueryMetric,
} from '../types';
import { INITIAL_RESOURCES } from '../data/mockData';

const edgeCacheIndices: Record<string, Set<string>> = {
  'edge-a': new Set(
    INITIAL_RESOURCES.filter((r) => r.zoneId === 'zone-a').map((r) => r.id)
  ),
  'edge-b': new Set(
    INITIAL_RESOURCES.filter((r) => r.zoneId === 'zone-b').map((r) => r.id)
  ),
  'edge-c': new Set(
    INITIAL_RESOURCES.filter((r) => r.zoneId === 'zone-c').map((r) => r.id)
  ),
};

export const ZONE_TO_EDGE: Record<string, string> = {
  'zone-a': 'edge-a',
  'zone-b': 'edge-b',
  'zone-c': 'edge-c',
};

export const EDGE_LABELS: Record<string, ServedByType> = {
  'edge-a': 'Edge A',
  'edge-b': 'Edge B',
  'edge-c': 'Edge C',
};

export function filterResources(
  resources: Resource[],
  params: QueryParams
): Resource[] {
  return resources.filter((res) => {
    if (params.zoneId !== 'any' && res.zoneId !== params.zoneId) {
      return false;
    }
    if (params.type !== 'any' && res.type !== params.type) {
      return false;
    }
    if (params.status !== 'any' && res.status !== params.status) {
      return false;
    }
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      const matchesName = res.name.toLowerCase().includes(q);
      const matchesId = res.id.toLowerCase().includes(q);
      const matchesDetails = res.details?.toLowerCase().includes(q);
      if (!matchesName && !matchesId && !matchesDetails) {
        return false;
      }
    }
    return true;
  });
}

export async function runQuery(
  params: QueryParams,
  allResources: Resource[],
  nodes: EdgeNode[]
): Promise<QueryResult> {
  const isMultiZone = params.zoneId === 'any';
  const targetNodeId = !isMultiZone ? ZONE_TO_EDGE[params.zoneId] : 'edge-b';
  const targetNode = nodes.find((n) => n.id === targetNodeId);

  const isOffline = targetNode?.status === 'offline';
  const targetEdgeLabel = EDGE_LABELS[targetNodeId] || 'Edge B';

  let servedBy: ServedByType;
  let latencyMs: number;
  let path: string[];
  let cacheHit = false;
  let results: Resource[] = [];

  if (isMultiZone) {
    latencyMs = Math.floor(Math.random() * (520 - 240 + 1)) + 240;
    servedBy = 'Central DB';
    cacheHit = false;
    path = ['Dashboard', 'Router', targetEdgeLabel, 'Central DB'];
    results = filterResources(allResources, params);

    const edgeCache = edgeCacheIndices[targetNodeId];
    if (edgeCache) {
      results.forEach((r) => edgeCache.add(r.id));
    }
  } else if (isOffline) {
    latencyMs = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
    servedBy = 'Offline cache';
    cacheHit = true;
    path = ['Dashboard', 'Router', `${targetEdgeLabel} (offline)`];

    const cachedIds = edgeCacheIndices[targetNodeId] || new Set();
    const cachedResources = allResources.filter((r) => cachedIds.has(r.id));
    results = filterResources(cachedResources, params);
  } else {
    const edgeCache = edgeCacheIndices[targetNodeId];
    const candidateMatches = filterResources(allResources, params);
    const allInCache = candidateMatches.every((r) => edgeCache?.has(r.id));

    if (allInCache && edgeCache) {
      latencyMs = Math.floor(Math.random() * (120 - 25 + 1)) + 25;
      servedBy = targetEdgeLabel;
      cacheHit = true;
      path = ['Dashboard', 'Router', targetEdgeLabel];
      results = candidateMatches;
    } else {
      latencyMs = Math.floor(Math.random() * (480 - 250 + 1)) + 250;
      servedBy = 'Central DB';
      cacheHit = false;
      path = ['Dashboard', 'Router', targetEdgeLabel, 'Central DB'];
      results = candidateMatches;

      candidateMatches.forEach((r) => edgeCache?.add(r.id));
    }
  }

  await new Promise((resolve) => setTimeout(resolve, latencyMs));

  const queryResult: QueryResult = {
    id: `QRY-${Date.now().toString(36).toUpperCase()}`,
    query: params,
    results,
    servedBy,
    latencyMs,
    path,
    cacheHit,
    timestamp: new Date().toLocaleTimeString(),
  };

  return queryResult;
}

export function generateSeedMetrics(): QueryMetric[] {
  const seed: QueryMetric[] = [];
  const baseTime = Date.now() - 1000 * 60 * 30;

  const samples = [
    { zone: 'zone-a', served: 'Edge A' as ServedByType, latency: 42, cache: true, count: 6 },
    { zone: 'zone-b', served: 'Edge B' as ServedByType, latency: 38, cache: true, count: 8 },
    { zone: 'any', served: 'Central DB' as ServedByType, latency: 380, cache: false, count: 22 },
    { zone: 'zone-c', served: 'Edge C' as ServedByType, latency: 55, cache: true, count: 7 },
    { zone: 'zone-b', served: 'Edge B' as ServedByType, latency: 68, cache: true, count: 4 },
    { zone: 'zone-a', served: 'Edge A' as ServedByType, latency: 45, cache: true, count: 5 },
    { zone: 'any', served: 'Central DB' as ServedByType, latency: 310, cache: false, count: 18 },
    { zone: 'zone-c', served: 'Edge C' as ServedByType, latency: 82, cache: true, count: 3 },
    { zone: 'zone-b', served: 'Edge B' as ServedByType, latency: 35, cache: true, count: 9 },
    { zone: 'zone-a', served: 'Edge A' as ServedByType, latency: 29, cache: true, count: 4 },
    { zone: 'any', served: 'Central DB' as ServedByType, latency: 420, cache: false, count: 20 },
    { zone: 'zone-c', served: 'Edge C' as ServedByType, latency: 61, cache: true, count: 5 },
    { zone: 'zone-b', served: 'Edge B' as ServedByType, latency: 50, cache: true, count: 7 },
  ];

  samples.forEach((s, idx) => {
    seed.push({
      id: `SEED-${idx + 1}`,
      timestamp: new Date(baseTime + idx * 120000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      latencyMs: s.latency,
      servedBy: s.served,
      zoneId: s.zone,
      cacheHit: s.cache,
      resultCount: s.count,
    });
  });

  return seed;
}

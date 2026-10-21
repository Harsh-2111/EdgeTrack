export type UserRole = 'Admin' | 'Staff' | 'Auditor';

export type ResourceStatus = 'Available' | 'In Use' | 'Maintenance';

export type ResourceType = 'Lab' | 'Projector' | 'Vehicle' | 'Equipment' | 'Room';

export type NodeStatus = 'online' | 'syncing' | 'offline';

export type PanelTab = 'map' | 'query' | 'nodes' | 'audit' | 'insights';

export type ServedByType = 'Edge A' | 'Edge B' | 'Edge C' | 'Central DB' | 'Offline cache';

export interface CampusZone {
  id: string;
  code: string;
  name: string;
  shortName: string;
  themeColor: string;
  borderColor: string;
  fillColor: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgeNode {
  id: string;
  name: string;
  code: string;
  zoneId: string;
  status: NodeStatus;
  loadPercent: number;
  lastSync: string;
  latencyMs: number;
  x: number;
  y: number;
  connectedClients: number;
  queuedCount: number;
  isSyncingInProgress?: boolean;
  syncProgress?: number;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  zoneId: string;
  status: ResourceStatus;
  x: number;
  y: number;
  updatedAt: string;
  assignedTo?: string;
  batteryLevel?: number;
  details?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeOrigin: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | string;
  resourceId: string;
  resourceName?: string;
  performedBy: string;
  user: string;
  role: UserRole;
  oldValue?: string;
  newValue?: string;
  hash: string;
  prevHash: string;
  synced: boolean;
}

export interface QueryParams {
  zoneId: string | 'any';
  type: ResourceType | 'any';
  status: ResourceStatus | 'any';
  search?: string;
  timeRange: '1h' | '24h' | '7d' | 'custom';
  from?: string;
  to?: string;
}

export interface QueryResult {
  id: string;
  query: QueryParams;
  results: Resource[];
  servedBy: ServedByType;
  latencyMs: number;
  path: string[];
  cacheHit: boolean;
  timestamp: string;
}

export interface QueryMetric {
  id: string;
  timestamp: string;
  latencyMs: number;
  servedBy: ServedByType;
  zoneId: string;
  cacheHit: boolean;
  resultCount: number;
}

export interface ActiveQueryAnimation {
  id: string;
  stage: 'idle' | 'client-to-router' | 'router-to-edge' | 'edge-to-db' | 'returning' | 'completed';
  targetNodeId: string;
  fellBackToDb: boolean;
  latencyMs: number;
  servedBy: ServedByType;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'teal' | 'gold' | 'berry' | 'info';
  timestamp: number;
}

export interface DemoScenarioState {
  isActive: boolean;
  step: number;
  totalSteps: number;
  caption: string;
}

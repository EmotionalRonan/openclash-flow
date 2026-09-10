import { RuleType } from './openclash';

export type DeviceType = 
  | 'mac'
  | 'iphone'
  | 'ipad'
  | 'tv'
  | 'windows'
  | 'linux'
  | 'nas'
  | 'smart_speaker'
  | 'iot'
  | 'other';

export interface ClientDevice {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  name: string;
  deviceType: DeviceType;
  vendor: string;
  activeConnections: number;
  uploadSpeed: number; // bytes/s
  downloadSpeed: number; // bytes/s
  totalUpload: number; // bytes
  totalDownload: number; // bytes
  topDomain: string;
  activeTargetGroup: string;
  activeProxyNode?: string;
  matchedRuleSummaries: {
    rulePayload: string;
    ruleType: RuleType;
    targetGroup: string;
    hitCount: number;
  }[];
  isBlocked?: boolean;
}

export interface RuleAuditRecord {
  id: string;
  ruleType: RuleType;
  payload: string;
  targetGroup: string;
  comment?: string;
  category?: string;
  hits: number;
  activeConnections: number;
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  lastHitAgo: string;
  hitPercentage: number;
  isCold: boolean; // 零命中冷规则
  isHot: boolean; // 高频热规则 (Top 15%)
  recentTrend: number[]; // 迷你趋势线 6个点
}

export type TimeWindow = 'live' | '30m' | '1h' | '24h';

export interface NodeLoadTelemetry {
  id: string;
  name: string;
  type: string;
  server: string;
  port: number;
  currentLatency: number;
  activeConnections: number;
  currentUploadSpeed: number; // B/s
  currentDownloadSpeed: number; // B/s
  totalTrafficBytes: number;
  packetLoss: number; // %
  loadScore: number; // 0 - 100
  loadStatus: 'healthy' | 'moderate' | 'heavy' | 'timeout';
  latencySparkline: number[]; // 12-16 data points for sparkline SVG
  speedSparkline: number[];
}

export interface GlobalTrafficOverview {
  totalUploadSpeed: number; // B/s
  totalDownloadSpeed: number; // B/s
  totalUploadBytes: number;
  totalDownloadBytes: number;
  activeConnectionsCount: number;
  activeClientCount: number;
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  clashCoreStatus: 'running' | 'reloading' | 'stopped';
}

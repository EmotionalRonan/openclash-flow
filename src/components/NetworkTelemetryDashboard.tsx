import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Laptop, 
  Tv, 
  Smartphone, 
  HardDrive, 
  Monitor, 
  Speaker, 
  Cpu, 
  Flame, 
  Snowflake, 
  Filter, 
  Search, 
  RotateCcw, 
  Play, 
  Sparkles, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Radio, 
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { TrafficRule, PolicyGroup, ProxyNode } from '../types/openclash';
import { ClientDevice, RuleAuditRecord, TimeWindow, DeviceType } from '../types/telemetry';
import { 
  INITIAL_CLIENT_DEVICES, 
  buildRuleAuditRecords, 
  formatSpeed, 
  formatBytes,
  generateSparklineSvgPath,
  generateSparklineAreaPath
} from '../utils/telemetryEngine';

interface NetworkTelemetryDashboardProps {
  rules: TrafficRule[];
  policyGroups: PolicyGroup[];
  proxies: ProxyNode[];
  onNavigateToRouting?: (highlightPayload?: string) => void;
}

export const NetworkTelemetryDashboard: React.FC<NetworkTelemetryDashboardProps> = ({
  rules,
  policyGroups,
  proxies,
  onNavigateToRouting,
}) => {
  // Main view filter
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'clients' | 'audit'>('overview');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('live');
  const [clients, setClients] = useState<ClientDevice[]>(INITIAL_CLIENT_DEVICES);
  const [selectedClientId, setSelectedClientId] = useState<string>('client-macbook');
  
  // Rule audit states
  const [auditRecords, setAuditRecords] = useState<RuleAuditRecord[]>(() => buildRuleAuditRecords(rules));
  const [auditFilter, setAuditFilter] = useState<'all' | 'hot' | 'cold'>('all');
  const [auditSort, setAuditSort] = useState<'hits-desc' | 'traffic-desc' | 'recent'>('hits-desc');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Traffic heartbeat state (fluctuates every 2 seconds for micro-animation)
  const [heartbeatTick, setHeartbeatTick] = useState(0);
  const [totalUpSpeed, setTotalUpSpeed] = useState(1850000);
  const [totalDownSpeed, setTotalDownSpeed] = useState(24500000);
  const [speedHistory, setSpeedHistory] = useState<number[]>([18, 22, 19, 25, 24, 28, 26, 31, 29, 34, 30, 32]);

  // Re-sync audit records when rules change
  useEffect(() => {
    setAuditRecords(buildRuleAuditRecords(rules));
  }, [rules]);

  // Heartbeat simulation for live network metrics
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatTick((prev) => prev + 1);
      
      // Jitter total speed
      setTotalUpSpeed((prev) => Math.max(500000, Math.floor(prev + (Math.random() - 0.5) * 400000)));
      setTotalDownSpeed((prev) => Math.max(8000000, Math.floor(prev + (Math.random() - 0.5) * 3500000)));
      
      setSpeedHistory((prev) => {
        const nextVal = Math.round(20 + Math.random() * 20);
        return [...prev.slice(1), nextVal];
      });

      // Micro-jitter client speeds
      setClients((prev) => 
        prev.map((c) => ({
          ...c,
          uploadSpeed: Math.max(5000, Math.floor(c.uploadSpeed + (Math.random() - 0.48) * 40000)),
          downloadSpeed: Math.max(20000, Math.floor(c.downloadSpeed + (Math.random() - 0.48) * 500000)),
        }))
      );
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Selected client details
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0];
  }, [clients, selectedClientId]);

  // Filtered & sorted audit records
  const filteredAuditRecords = useMemo(() => {
    let list = auditRecords;

    if (auditFilter === 'hot') {
      list = list.filter((r) => r.isHot);
    } else if (auditFilter === 'cold') {
      list = list.filter((r) => r.isCold);
    }

    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      list = list.filter(
        (r) =>
          r.payload.toLowerCase().includes(q) ||
          r.targetGroup.toLowerCase().includes(q) ||
          (r.comment && r.comment.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      if (auditSort === 'hits-desc') return b.hits - a.hits;
      if (auditSort === 'traffic-desc') return b.totalBytes - a.totalBytes;
      return 0;
    });
  }, [auditRecords, auditFilter, auditSort, auditSearch]);

  // Reset audit hits
  const handleResetAudit = () => {
    setAuditRecords((prev) =>
      prev.map((r) => ({
        ...r,
        hits: 0,
        activeConnections: 0,
        uploadBytes: 0,
        downloadBytes: 0,
        totalBytes: 0,
        lastHitAgo: '已重置 (零命中)',
        hitPercentage: 0,
        isCold: true,
        isHot: false,
        recentTrend: [0, 0, 0, 0, 0, 0],
      }))
    );
  };

  // Simulate inject traffic burst
  const handleInjectTraffic = () => {
    setAuditRecords((prev) =>
      prev.map((r, idx) => {
        if (idx === 0 || idx === 1 || r.payload.includes('openai') || r.payload === 'CN') {
          const addHits = Math.floor(Math.random() * 150) + 50;
          return {
            ...r,
            hits: r.hits + addHits,
            totalBytes: r.totalBytes + addHits * 80 * 1024,
            lastHitAgo: '刚刚 (刚刚命中)',
            isCold: false,
            isHot: true,
          };
        }
        return r;
      })
    );
  };

  // Device type icon mapping
  const renderDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'mac':
        return <Laptop className="w-4 h-4 text-indigo-500" />;
      case 'tv':
        return <Tv className="w-4 h-4 text-purple-500" />;
      case 'iphone':
      case 'ipad':
        return <Smartphone className="w-4 h-4 text-sky-500" />;
      case 'nas':
        return <HardDrive className="w-4 h-4 text-emerald-500" />;
      case 'windows':
        return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'smart_speaker':
        return <Speaker className="w-4 h-4 text-amber-500" />;
      default:
        return <Cpu className="w-4 h-4 text-gray-500" />;
    }
  };

  const hotCount = auditRecords.filter((r) => r.isHot).length;
  const coldCount = auditRecords.filter((r) => r.isCold).length;
  const totalHits = auditRecords.reduce((s, r) => s + r.hits, 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* TOP CONTROL BAR: Apple HIG segmented controls & window selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/70 dark:bg-[#12131a]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] p-3 rounded-2xl shadow-xs">
        
        {/* Navigation Segments */}
        <div className="flex items-center gap-1.5 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all apple-press ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-[#1e1f29] text-[#1d1d1f] dark:text-white shadow-xs'
                : 'text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>全景指标</span>
          </button>
          <button
            onClick={() => setActiveSubTab('clients')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all apple-press ${
              activeSubTab === 'clients'
                ? 'bg-white dark:bg-[#1e1f29] text-[#1d1d1f] dark:text-white shadow-xs'
                : 'text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-sky-500" />
            <span>终端画像 ({clients.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all apple-press ${
              activeSubTab === 'audit'
                ? 'bg-white dark:bg-[#1e1f29] text-[#1d1d1f] dark:text-white shadow-xs'
                : 'text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>规则链审计 ({auditRecords.length})</span>
            {coldCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-mono">
                {coldCount}冷
              </span>
            )}
          </button>
        </div>

        {/* Right side: Time Window & Heartbeat badge */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>实时采集 (WebSocket)</span>
          </div>

          <div className="flex items-center p-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg text-xs">
            {(['live', '30m', '1h', '24h'] as TimeWindow[]).map((tw) => (
              <button
                key={tw}
                onClick={() => setTimeWindow(tw)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                  timeWindow === tw
                    ? 'bg-white dark:bg-[#1e1f29] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                {tw === 'live' ? '实时' : tw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW HERO METRICS (Apple HIG Sparklines & Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Downstream Speed */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#12131a]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#86868b] dark:text-[#a1a1aa] flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
              下行实时速率
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Peak 42 MB/s
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1d1d1f] dark:text-white tracking-tight">
            {formatSpeed(totalDownSpeed)}
          </div>
          {/* Sparkline */}
          <div className="mt-2 h-7 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d={generateSparklineAreaPath(speedHistory, 100, 24)}
                className="fill-emerald-500/15"
              />
              <path
                d={generateSparklineSvgPath(speedHistory, 100, 24)}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Upstream Speed */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#12131a]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#86868b] dark:text-[#a1a1aa] flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
              上行实时速率
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
              Smooth
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1d1d1f] dark:text-white tracking-tight">
            {formatSpeed(totalUpSpeed)}
          </div>
          {/* Sparkline */}
          <div className="mt-2 h-7 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d={generateSparklineAreaPath(speedHistory.map(v => Math.floor(v * 0.4)), 100, 24)}
                className="fill-indigo-500/15"
              />
              <path
                d={generateSparklineSvgPath(speedHistory.map(v => Math.floor(v * 0.4)), 100, 24)}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Active Connections */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#12131a]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#86868b] dark:text-[#a1a1aa] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              当前活跃连接数
            </span>
            <span className="text-[10px] font-mono text-[#6e6e73] dark:text-[#a1a1aa]">
              {clients.length} 个终端
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1d1d1f] dark:text-white tracking-tight">
            174 <span className="text-xs font-normal text-[#86868b]">Conns</span>
          </div>
          <div className="mt-2 text-xs text-[#6e6e73] dark:text-[#a1a1aa] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>核心运行健康 • 内存 138MB (14%)</span>
          </div>
        </div>

        {/* Total Hits & Audit Summary */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#12131a]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#86868b] dark:text-[#a1a1aa] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              规则链总命中
            </span>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
              {hotCount} 热 / {coldCount} 冷
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#1d1d1f] dark:text-white tracking-tight">
            {totalHits.toLocaleString()} <span className="text-xs font-normal text-[#86868b]">Hits</span>
          </div>
          <div className="mt-2 text-xs text-[#6e6e73] dark:text-[#a1a1aa] flex items-center justify-between">
            <span>DIRECT: 48%</span>
            <span>PROXY: 52%</span>
          </div>
        </div>

      </div>

      {/* SUB-SECTION 1: CLIENT TELEMETRY & FLOW MAPPING */}
      {(activeSubTab === 'overview' || activeSubTab === 'clients') && (
        <div className="bg-white/70 dark:bg-[#12131a]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-500" />
                <span>局域网终端画像与专属流向透视</span>
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1aa] mt-0.5">
                实时识别局域网设备类型、实时速率与规则流向。点击任意设备可查看其分流详情或定位至拓扑画布。
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
              在线设备: {clients.length}
            </span>
          </div>

          {/* Client Device Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {clients.map((device) => {
              const isSelected = device.id === selectedClientId;
              return (
                <div
                  key={device.id}
                  onClick={() => setSelectedClientId(device.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer apple-press ${
                    isSelected
                      ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/40 shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center shrink-0">
                        {renderDeviceIcon(device.deviceType)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1d1d1f] dark:text-white truncate">
                          {device.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#86868b] dark:text-[#a1a1aa] truncate">
                          {device.ip} • {device.hostname}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-600 text-white shrink-0">
                        已选透视
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <div>
                      <span className="text-[#86868b] block text-[10px]">下行速率</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ↓ {formatSpeed(device.downloadSpeed)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#86868b] block text-[10px]">活跃连接</span>
                      <span className="text-[#1d1d1f] dark:text-[#e4e4e7]">
                        {device.activeConnections} Conns
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#86868b] dark:text-[#a1a1aa]">
                    <span>流向: <strong className="text-indigo-600 dark:text-indigo-400">{device.activeTargetGroup}</strong></span>
                    <span>累计: {formatBytes(device.totalDownload)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE DEVICE INSPECTION PANEL */}
          {selectedClient && (
            <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {renderDeviceIcon(selectedClient.deviceType)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                      <span>{selectedClient.name}</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#a1a1aa]">
                        {selectedClient.vendor}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#86868b] dark:text-[#a1a1aa]">
                      MAC: {selectedClient.mac} • 活跃出口: {selectedClient.activeProxyNode || 'DIRECT 直连'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToRouting && (
                    <button
                      onClick={() => onNavigateToRouting(selectedClient.matchedRuleSummaries[0]?.rulePayload)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all apple-press"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>在拓扑画布中高亮流向</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Matched Rules flow breakdown for this device */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#86868b] dark:text-[#a1a1aa] block mb-1">
                  当前设备高频匹配规则流向:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {selectedClient.matchedRuleSummaries.map((ruleSum, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white dark:bg-[#181922] border border-black/[0.06] dark:border-white/[0.06] text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {ruleSum.ruleType}
                        </span>
                        <span className="text-[10px] text-[#86868b]">
                          命中 {ruleSum.hitCount} 次
                        </span>
                      </div>
                      <div className="font-mono font-medium text-[#1d1d1f] dark:text-white truncate">
                        {ruleSum.rulePayload}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#6e6e73] dark:text-[#a1a1aa]">
                        <span>➔</span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {ruleSum.targetGroup}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-SECTION 2: RULE CHAIN HIT ANALYTICS & AUDIT */}
      {(activeSubTab === 'overview' || activeSubTab === 'audit') && (
        <div className="bg-white/70 dark:bg-[#12131a]/70 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>规则链命中审计 (Rule Hit Analytics)</span>
              </h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1aa] mt-0.5">
                深度审计每条分流规则命中频次、实时连接与带宽消耗。精准识别高频热规则，标记长期零命中的冗余冷规则。
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={handleInjectTraffic}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-all apple-press"
                title="模拟注入测试流量包以触发规则匹配"
              >
                <Play className="w-3.5 h-3.5" />
                <span>模拟匹配</span>
              </button>
              <button
                onClick={handleResetAudit}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#6e6e73] dark:text-[#a1a1aa] text-xs font-semibold transition-all apple-press"
                title="重置所有规则命中计数器"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置审计</span>
              </button>
            </div>
          </div>

          {/* Filter, Search & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-lg text-xs">
              <button
                onClick={() => setAuditFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  auditFilter === 'all'
                    ? 'bg-white dark:bg-[#1e1f29] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-[#6e6e73] dark:text-[#a1a1aa]'
                }`}
              >
                全部 ({auditRecords.length})
              </button>
              <button
                onClick={() => setAuditFilter('hot')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  auditFilter === 'hot'
                    ? 'bg-white dark:bg-[#1e1f29] text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-[#6e6e73] dark:text-[#a1a1aa]'
                }`}
              >
                <Flame className="w-3 h-3 text-rose-500" />
                <span>高频热规则 ({hotCount})</span>
              </button>
              <button
                onClick={() => setAuditFilter('cold')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  auditFilter === 'cold'
                    ? 'bg-white dark:bg-[#1e1f29] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-[#6e6e73] dark:text-[#a1a1aa]'
                }`}
              >
                <Snowflake className="w-3 h-3 text-blue-500" />
                <span>零命中冷规则 ({coldCount})</span>
              </button>
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="搜索规则、域名、策略组..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-[#1d1d1f] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={auditSort}
                onChange={(e) => setAuditSort(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-[#1d1d1f] dark:text-white focus:outline-hidden"
              >
                <option value="hits-desc">按命中数降序</option>
                <option value="traffic-desc">按总吞吐量降序</option>
              </select>
            </div>

          </div>

          {/* Audit Table */}
          <div className="overflow-x-auto rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.06] text-[#86868b] dark:text-[#a1a1aa]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">状态与类型</th>
                  <th className="py-2.5 px-3 font-semibold">规则匹配内容 (Payload)</th>
                  <th className="py-2.5 px-3 font-semibold">流向目标策略组</th>
                  <th className="py-2.5 px-3 font-semibold">累计命中数</th>
                  <th className="py-2.5 px-3 font-semibold">占比</th>
                  <th className="py-2.5 px-3 font-semibold">累计吞吐量</th>
                  <th className="py-2.5 px-3 font-semibold">活跃连接</th>
                  <th className="py-2.5 px-3 font-semibold">最近活跃</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {filteredAuditRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#86868b] dark:text-[#a1a1aa]">
                      未匹配到符合条件的审计规则记录
                    </td>
                  </tr>
                ) : (
                  filteredAuditRecords.map((record) => (
                    <tr 
                      key={record.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Status tag */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {record.isHot ? (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400">
                              <Flame className="w-3 h-3" />
                              热
                            </span>
                          ) : record.isCold ? (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                              <Snowflake className="w-3 h-3" />
                              冷
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-[#e4e4e7]">
                            {record.ruleType}
                          </span>
                        </div>
                      </td>

                      {/* Payload */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-medium text-[#1d1d1f] dark:text-white">
                          {record.payload}
                        </div>
                        {record.comment && (
                          <div className="text-[10px] text-[#86868b] dark:text-[#a1a1aa]">
                            {record.comment}
                          </div>
                        )}
                      </td>

                      {/* Target Group */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {record.targetGroup}
                        </span>
                      </td>

                      {/* Hits Count */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                        {record.hits.toLocaleString()}
                      </td>

                      {/* Hit Percentage Bar */}
                      <td className="py-2.5 px-3 whitespace-nowrap min-w-24">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-black/[0.06] dark:bg-white/[0.08] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                record.isHot ? 'bg-rose-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min(100, record.hitPercentage * 3)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-[#86868b] w-8">
                            {record.hitPercentage}%
                          </span>
                        </div>
                      </td>

                      {/* Total Traffic */}
                      <td className="py-2.5 px-3 font-mono text-[#1d1d1f] dark:text-[#e4e4e7] whitespace-nowrap">
                        {formatBytes(record.totalBytes)}
                      </td>

                      {/* Active Conns */}
                      <td className="py-2.5 px-3 font-mono text-[#86868b] whitespace-nowrap">
                        {record.activeConnections}
                      </td>

                      {/* Last Hit Ago */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-[#86868b] dark:text-[#a1a1aa]">
                        {record.lastHitAgo}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Audit Cold Rule Tip Banner */}
          {coldCount > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-blue-500" />
                <span>
                  检测到 <strong>{coldCount}</strong> 条长期零命中的规则。冷规则可能是未使用的旧域名或冲突被前置拦截的冗余规则，建议适时精简。
                </span>
              </div>
              <button
                onClick={() => setAuditFilter('cold')}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
              >
                仅查看冷规则 ➔
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

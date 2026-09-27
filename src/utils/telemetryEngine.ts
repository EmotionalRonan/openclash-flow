import { TrafficRule, ProxyNode, PolicyGroup } from '../types/openclash';
import { ClientDevice, RuleAuditRecord, NodeLoadTelemetry, GlobalTrafficOverview, TimeWindow } from '../types/telemetry';

export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  if (bytesPerSec < 1024 * 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
  return `${(bytesPerSec / (1024 * 1024 * 1024)).toFixed(2)} GB/s`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export const INITIAL_CLIENT_DEVICES: ClientDevice[] = [
  {
    id: 'client-macbook',
    ip: '192.168.1.102',
    mac: 'F4:D4:88:5A:21:BC',
    hostname: 'MacBook-Pro.lan',
    name: 'Ronan’s MacBook Pro M3',
    deviceType: 'mac',
    vendor: 'Apple Inc.',
    isCurrentClient: true,
    bypassMode: 'rule',
    activeConnections: 34,
    uploadSpeed: 142000,
    downloadSpeed: 3820000,
    totalUpload: 480 * 1024 * 1024,
    totalDownload: 4200 * 1024 * 1024,
    topDomain: 'github.com',
    activeTargetGroup: '🚀 节点选择 (PROXY)',
    activeProxyNode: '🇭🇰 香港 IPLC 01',
    matchedRuleSummaries: [
      { rulePayload: 'github.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: '🚀 节点选择 (PROXY)', hitCount: 142 },
      { rulePayload: 'openai.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: '🚀 节点选择 (PROXY)', hitCount: 98 },
      { rulePayload: 'CN', ruleType: 'GEOIP', targetGroup: 'DIRECT', hitCount: 520 },
    ],
    activeConnectionsList: [
      {
        id: 'conn-mb-1',
        network: 'tcp',
        type: 'HTTPS',
        host: 'api.github.com',
        destinationIP: '140.82.114.6',
        destinationPort: 443,
        sourcePort: 54122,
        rule: 'DOMAIN-SUFFIX',
        rulePayload: 'github.com',
        outboundGroup: '🚀 节点选择 (PROXY)',
        outboundNode: '🇭🇰 香港 IPLC 01',
        upload: 14200,
        download: 245000,
        uploadSpeed: 1800,
        downloadSpeed: 42000,
        start: '12 秒前',
        process: '/Applications/Google Chrome.app',
      },
      {
        id: 'conn-mb-2',
        network: 'tcp',
        type: 'HTTPS',
        host: 'chatgpt.com',
        destinationIP: '104.18.2.161',
        destinationPort: 443,
        sourcePort: 54138,
        rule: 'DOMAIN-SUFFIX',
        rulePayload: 'chatgpt.com',
        outboundGroup: '🚀 节点选择 (PROXY)',
        outboundNode: '🇭🇰 香港 IPLC 01',
        upload: 8200,
        download: 112000,
        uploadSpeed: 950,
        downloadSpeed: 15400,
        start: '28 秒前',
        process: '/Applications/Google Chrome.app',
      },
      {
        id: 'conn-mb-3',
        network: 'tcp',
        type: 'HTTPS',
        host: 'bilibili.com',
        destinationIP: '119.3.70.198',
        destinationPort: 443,
        sourcePort: 54190,
        rule: 'GEOIP',
        rulePayload: 'CN',
        outboundGroup: 'DIRECT',
        outboundNode: 'DIRECT',
        upload: 4500,
        download: 3200000,
        uploadSpeed: 1200,
        downloadSpeed: 1450000,
        start: '45 秒前',
        process: '/Applications/Safari.app',
      },
    ],
  },
  {
    id: 'client-appletv',
    ip: '192.168.1.108',
    mac: '40:B3:95:C2:10:99',
    hostname: 'Apple-TV-LivingRoom.lan',
    name: '客厅 Apple TV 4K',
    deviceType: 'tv',
    vendor: 'Apple Inc.',
    bypassMode: 'rule',
    activeConnections: 18,
    uploadSpeed: 45000,
    downloadSpeed: 12500000,
    totalUpload: 220 * 1024 * 1024,
    totalDownload: 18400 * 1024 * 1024,
    topDomain: 'netflix.com',
    activeTargetGroup: '🎬 国际流媒体 (Media)',
    activeProxyNode: '🇭🇰 香港 IPLC 01',
    matchedRuleSummaries: [
      { rulePayload: 'netflix.com', ruleType: 'DOMAIN-KEYWORD', targetGroup: '🎬 国际流媒体 (Media)', hitCount: 630 },
      { rulePayload: 'youtube.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: '🎬 国际流媒体 (Media)', hitCount: 310 },
      { rulePayload: 'bilibili.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: 'DIRECT', hitCount: 140 },
    ],
    activeConnectionsList: [
      {
        id: 'conn-tv-1',
        network: 'tcp',
        type: 'HTTPS',
        host: 'ipv4-c001-hkg001-ix.1.oca.nflxvideo.net',
        destinationIP: '198.38.118.140',
        destinationPort: 443,
        sourcePort: 49812,
        rule: 'DOMAIN-KEYWORD',
        rulePayload: 'netflix.com',
        outboundGroup: '🎬 国际流媒体 (Media)',
        outboundNode: '🇭🇰 香港 IPLC 01',
        upload: 35000,
        download: 11800000,
        uploadSpeed: 4200,
        downloadSpeed: 11200000,
        start: '3 分钟前',
        process: 'com.apple.TVPlayer',
      },
    ],
  },
  {
    id: 'client-iphone',
    ip: '192.168.1.121',
    mac: '7C:50:49:EE:41:03',
    hostname: 'iPhone-16-Pro.lan',
    name: 'iPhone 16 Pro Max',
    deviceType: 'iphone',
    vendor: 'Apple Inc.',
    bypassMode: 'rule',
    activeConnections: 12,
    uploadSpeed: 28000,
    downloadSpeed: 890000,
    totalUpload: 180 * 1024 * 1024,
    totalDownload: 1650 * 1024 * 1024,
    topDomain: 'apple.com',
    activeTargetGroup: '🚀 节点选择 (PROXY)',
    activeProxyNode: '🇯🇵 日本 软银 01',
    matchedRuleSummaries: [
      { rulePayload: 'telegram.org', ruleType: 'DOMAIN-SUFFIX', targetGroup: '🚀 节点选择 (PROXY)', hitCount: 88 },
      { rulePayload: 'twitter.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: '🚀 节点选择 (PROXY)', hitCount: 65 },
      { rulePayload: 'CN', ruleType: 'GEOIP', targetGroup: 'DIRECT', hitCount: 340 },
    ],
    activeConnectionsList: [
      {
        id: 'conn-ph-1',
        network: 'tcp',
        type: 'HTTPS',
        host: 'api.telegram.org',
        destinationIP: '149.154.167.220',
        destinationPort: 443,
        sourcePort: 51204,
        rule: 'DOMAIN-SUFFIX',
        rulePayload: 'telegram.org',
        outboundGroup: '🚀 节点选择 (PROXY)',
        outboundNode: '🇯🇵 日本 软银 01',
        upload: 9400,
        download: 48000,
        uploadSpeed: 1200,
        downloadSpeed: 8400,
        start: '1 分钟前',
        process: 'Telegram.app',
      },
    ],
  },
  {
    id: 'client-synology',
    ip: '192.168.1.115',
    mac: '00:11:32:8F:90:4B',
    hostname: 'DS920-Plus.lan',
    name: '家庭存储 Synology NAS',
    deviceType: 'nas',
    vendor: 'Synology Inc.',
    bypassMode: 'direct',
    activeConnections: 86,
    uploadSpeed: 5600000,
    downloadSpeed: 1840000,
    totalUpload: 45000 * 1024 * 1024,
    totalDownload: 12000 * 1024 * 1024,
    topDomain: 'docker.io',
    activeTargetGroup: 'DIRECT',
    matchedRuleSummaries: [
      { rulePayload: 'docker.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: '🚀 节点选择 (PROXY)', hitCount: 52 },
      { rulePayload: 'CN', ruleType: 'GEOIP', targetGroup: 'DIRECT', hitCount: 1420 },
    ],
  },
  {
    id: 'client-pc',
    ip: '192.168.1.130',
    mac: 'D8:BB:C1:22:98:40',
    hostname: 'Gaming-Rig-PC.lan',
    name: '书房主机 Windows PC',
    deviceType: 'windows',
    vendor: 'ASUSTeK Computer',
    bypassMode: 'rule',
    activeConnections: 24,
    uploadSpeed: 95000,
    downloadSpeed: 2100000,
    totalUpload: 890 * 1024 * 1024,
    totalDownload: 8600 * 1024 * 1024,
    topDomain: 'steampowered.com',
    activeTargetGroup: '🎮 游戏电竞 (Game)',
    activeProxyNode: '🇭🇰 香港 IPLC 01',
    matchedRuleSummaries: [
      { rulePayload: 'steampowered.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: 'DIRECT', hitCount: 280 },
      { rulePayload: 'epicgames.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: '🚀 节点选择 (PROXY)', hitCount: 95 },
    ],
  },
  {
    id: 'client-homepod',
    ip: '192.168.1.144',
    mac: 'A4:83:E7:01:DF:32',
    hostname: 'HomePod-mini-Bedroom.lan',
    name: '卧室 HomePod mini',
    deviceType: 'smart_speaker',
    vendor: 'Apple Inc.',
    bypassMode: 'direct',
    activeConnections: 4,
    uploadSpeed: 4200,
    downloadSpeed: 120000,
    totalUpload: 45 * 1024 * 1024,
    totalDownload: 560 * 1024 * 1024,
    topDomain: 'apple-cloudkit.com',
    activeTargetGroup: 'DIRECT',
    matchedRuleSummaries: [
      { rulePayload: 'apple.com', ruleType: 'DOMAIN-SUFFIX', targetGroup: 'DIRECT', hitCount: 120 },
    ],
  },
];

// Generate Rule Hit Audit Records from live rules
export function buildRuleAuditRecords(rules: TrafficRule[]): RuleAuditRecord[] {
  // Preset hit factors based on payload patterns for realism
  const records = rules.map((r, index) => {
    let baseHits = 0;
    let baseUpload = 0;
    let baseDownload = 0;

    const payload = (r.payload || '').toLowerCase();
    if (payload === 'cn' || payload.includes('china')) {
      baseHits = 4250 + (index * 73) % 800;
      baseUpload = 180 * 1024 * 1024;
      baseDownload = 2400 * 1024 * 1024;
    } else if (payload.includes('openai') || payload.includes('chatgpt') || payload.includes('anthropic')) {
      baseHits = 1890 + (index * 37) % 300;
      baseUpload = 95 * 1024 * 1024;
      baseDownload = 820 * 1024 * 1024;
    } else if (payload.includes('netflix') || payload.includes('youtube') || payload.includes('disney')) {
      baseHits = 2840 + (index * 41) % 400;
      baseUpload = 120 * 1024 * 1024;
      baseDownload = 14500 * 1024 * 1024;
    } else if (payload.includes('github') || payload.includes('google')) {
      baseHits = 1530 + (index * 29) % 250;
      baseUpload = 78 * 1024 * 1024;
      baseDownload = 920 * 1024 * 1024;
    } else if (payload.includes('adaway') || payload.includes('advert') || r.targetGroup === 'REJECT') {
      baseHits = 890 + (index * 13) % 150;
      baseUpload = 12 * 1024;
      baseDownload = 0;
    } else if (index % 5 === 0) {
      // Intentionally simulate some zero-hit cold/redundant rules!
      baseHits = 0;
      baseUpload = 0;
      baseDownload = 0;
    } else {
      baseHits = Math.max(0, 320 - index * 18);
      baseUpload = baseHits * 12 * 1024;
      baseDownload = baseHits * 86 * 1024;
    }

    const totalBytes = baseUpload + baseDownload;
    const activeConn = baseHits > 0 ? Math.floor((baseHits % 11) + 1) : 0;
    
    // Sparkline trend (6 points)
    const trend = [
      Math.max(0, Math.floor(baseHits * 0.15)),
      Math.max(0, Math.floor(baseHits * 0.18)),
      Math.max(0, Math.floor(baseHits * 0.22)),
      Math.max(0, Math.floor(baseHits * 0.14)),
      Math.max(0, Math.floor(baseHits * 0.26)),
      Math.max(0, Math.floor(baseHits * 0.32)),
    ];

    return {
      id: r.id,
      ruleType: r.type,
      payload: r.payload,
      targetGroup: r.targetGroup,
      comment: r.comment,
      category: r.category,
      hits: baseHits,
      activeConnections: activeConn,
      uploadBytes: baseUpload,
      downloadBytes: baseDownload,
      totalBytes,
      lastHitAgo: baseHits === 0 ? '从未命中 (冷规则)' : `${(index * 3) % 55 + 1}秒前`,
      hitPercentage: 0, // calculated below
      isCold: baseHits === 0,
      isHot: false,
      recentTrend: trend,
    };
  });

  const totalHitsSum = records.reduce((sum, r) => sum + r.hits, 0) || 1;
  const sortedByHits = [...records].sort((a, b) => b.hits - a.hits);
  const hotThreshold = sortedByHits[Math.min(3, sortedByHits.length - 1)]?.hits || 1000;

  return records.map((rec) => ({
    ...rec,
    hitPercentage: Number(((rec.hits / totalHitsSum) * 100).toFixed(1)),
    isHot: rec.hits >= hotThreshold && rec.hits > 0,
  }));
}

// Generate Proxy Node Load Telemetry with Sparkline series
export function buildNodeLoadTelemetry(proxies: ProxyNode[], timeWindow: TimeWindow = 'live'): NodeLoadTelemetry[] {
  return proxies.map((p, index) => {
    const lat = p.latency ?? 0;
    const isOffline = lat < 0;
    const isSlow = lat > 280;

    let status: 'healthy' | 'moderate' | 'heavy' | 'timeout' = 'healthy';
    if (isOffline) status = 'timeout';
    else if (isSlow) status = 'heavy';
    else if (lat > 120) status = 'moderate';

    // Sparkline history (12 points)
    const pointsCount = 14;
    const baseLat = isOffline ? 0 : Math.max(15, lat);
    const latencySparkline: number[] = [];
    const speedSparkline: number[] = [];

    for (let i = 0; i < pointsCount; i++) {
      if (isOffline) {
        latencySparkline.push(0);
        speedSparkline.push(0);
      } else {
        const jitter = Math.sin(i * 0.9 + index) * (baseLat * 0.25);
        latencySparkline.push(Math.round(Math.max(10, baseLat + jitter)));
        const speedJitter = Math.abs(Math.cos(i * 0.7 + index)) * 2400000;
        speedSparkline.push(Math.round(speedJitter));
      }
    }

    const activeConn = isOffline ? 0 : Math.floor((index * 7) % 28 + 2);
    const currentDown = isOffline ? 0 : Math.floor((index * 850000) % 4500000 + 350000);
    const currentUp = isOffline ? 0 : Math.floor(currentDown * 0.15);
    const loadScore = isOffline ? 0 : Math.min(100, Math.floor((lat / 300) * 50 + (activeConn / 30) * 50));

    return {
      id: p.id,
      name: p.name,
      type: p.type,
      server: p.server,
      port: p.port,
      currentLatency: lat,
      activeConnections: activeConn,
      currentUploadSpeed: currentUp,
      currentDownloadSpeed: currentDown,
      totalTrafficBytes: (index + 1) * 320 * 1024 * 1024,
      packetLoss: isOffline ? 100 : (index % 4 === 0 ? 0.5 : 0),
      loadScore,
      loadStatus: status,
      latencySparkline,
      speedSparkline,
    };
  });
}

// Generate Sparkline SVG path string
export function generateSparklineSvgPath(values: number[], width: number = 80, height: number = 24): string {
  if (!values || values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * width;
    // Invert Y because SVG coordinates go top-to-bottom
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${points.join(' L ')}`;
}

export function generateSparklineAreaPath(values: number[], width: number = 80, height: number = 24): string {
  if (!values || values.length < 2) return '';
  const linePath = generateSparklineSvgPath(values, width, height);
  return `${linePath} L ${width},${height} L 0,${height} Z`;
}

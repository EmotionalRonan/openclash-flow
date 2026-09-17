import { ClientDevice, DeviceType } from '../types/telemetry';
import { TrafficRule } from '../types/openclash';

export interface RealClientFetchResult {
  source: 'clash_api' | 'luci_rpc' | 'stored_real' | 'fallback_simulated';
  clients: ClientDevice[];
  connectedHost: string;
  totalConnections: number;
  uploadTotal: number;
  downloadTotal: number;
  errorMessage?: string;
  timestamp: string;
}

// Helper: Guess device type from hostname, vendor, or OS user agent
export function inferDeviceType(nameOrHost: string, vendor: string = ''): DeviceType {
  const s = `${nameOrHost} ${vendor}`.toLowerCase();
  if (s.includes('mac') || s.includes('darwin') || s.includes('osx') || s.includes('apple silicon')) return 'mac';
  if (s.includes('iphone')) return 'iphone';
  if (s.includes('ipad')) return 'ipad';
  if (s.includes('tv') || s.includes('appletv') || s.includes('shield') || s.includes('chromecast') || s.includes('roku')) return 'tv';
  if (s.includes('win') || s.includes('pc') || s.includes('desktop') || s.includes('surface')) return 'windows';
  if (s.includes('nas') || s.includes('synology') || s.includes('qnap') || s.includes('truenas') || s.includes('unraid')) return 'nas';
  if (s.includes('homepod') || s.includes('echo') || s.includes('alexa') || s.includes('speaker') || s.includes('sonos')) return 'smart_speaker';
  if (s.includes('linux') || s.includes('ubuntu') || s.includes('debian') || s.includes('arch') || s.includes('raspb')) return 'linux';
  if (s.includes('iot') || s.includes('esp') || s.includes('camera') || s.includes('switch') || s.includes('plug')) return 'iot';
  return 'other';
}

// Helper: infer vendor from MAC prefix or hostname
export function inferVendor(mac: string, hostname: string): string {
  const cleanMac = mac.replace(/[:-]/g, '').toUpperCase().slice(0, 6);
  const h = hostname.toLowerCase();

  if (h.includes('apple') || h.includes('mac') || h.includes('iphone') || h.includes('ipad') || h.includes('homepod')) {
    return 'Apple Inc.';
  }
  if (h.includes('synology')) return 'Synology Inc.';
  if (h.includes('asus') || h.includes('rog')) return 'ASUSTeK Computer';
  if (h.includes('intel')) return 'Intel Corp.';
  if (h.includes('dell')) return 'Dell Inc.';
  if (h.includes('lenovo') || h.includes('thinkpad')) return 'Lenovo';
  if (h.includes('samsung') || h.includes('galaxy')) return 'Samsung Electronics';
  if (h.includes('xiaomi') || h.includes('redmi') || h.includes('mi-')) return 'Xiaomi Communications';
  if (h.includes('huawei') || h.includes('honor')) return 'Huawei Technologies';
  if (h.includes('sony') || h.includes('playstation') || h.includes('ps5')) return 'Sony Interactive';
  if (h.includes('nintendo') || h.includes('switch')) return 'Nintendo Co., Ltd.';
  if (h.includes('msi')) return 'Micro-Star International';
  if (h.includes('raspberry') || h.includes('rpi')) return 'Raspberry Pi Foundation';

  // Common MAC OUI prefixes
  if (cleanMac.startsWith('F4D488') || cleanMac.startsWith('7C5049') || cleanMac.startsWith('40B395') || cleanMac.startsWith('A483E7')) {
    return 'Apple Inc.';
  }
  if (cleanMac.startsWith('001132')) return 'Synology Inc.';
  if (cleanMac.startsWith('D8BBC1') || cleanMac.startsWith('04D9F5')) return 'ASUSTeK Computer';
  if (cleanMac.startsWith('B827EB') || cleanMac.startsWith('DCA632')) return 'Raspberry Pi Trading';
  if (cleanMac.startsWith('44650D') || cleanMac.startsWith('FC65DE')) return 'Amazon Technologies';

  return 'Local Network Device';
}

/**
 * Fetch real connections from Clash / Mihomo / OpenClash REST API:
 * GET http://<routerHost>:<controllerPort>/connections
 * Headers: Authorization: Bearer <secret>
 */
export async function fetchClashConnections(
  routerHost: string,
  controllerPort: number,
  secret: string = '',
  timeoutMs: number = 3000
): Promise<{ success: boolean; data?: any; error?: string }> {
  // Try directly or via current host
  const host = routerHost.trim() || '192.168.1.1';
  const port = controllerPort || 9090;
  const baseUrl = `http://${host}:${port}`;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  if (secret.trim()) {
    headers['Authorization'] = `Bearer ${secret.trim()}`;
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/connections`, {
      method: 'GET',
      headers,
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(id);

    if (!res.ok) {
      return {
        success: false,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    clearTimeout(id);
    return {
      success: false,
      error: err.name === 'AbortError' ? '连接超时 (3s)，请检查路由器地址及跨域配置' : (err.message || '网络请求错误'),
    };
  }
}

/**
 * Fetch real DHCP leases from OpenWrt LuCI ubus / rpc:
 * POST http://<routerHost>/ubus or /cgi-bin/luci/rpc/uci
 */
export async function fetchLuciDhcpLeases(
  routerHost: string,
  timeoutMs: number = 2500
): Promise<{ success: boolean; leases?: Record<string, { hostname?: string; mac?: string; ip?: string }>; error?: string }> {
  const host = routerHost.trim() || '192.168.1.1';
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // OpenWrt ubus standard call for dhcp leases: luci-rpc or network.device
    const res = await fetch(`http://${host}/cgi-bin/luci/rpc/sys?auth=anonymous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'net.arptable',
        params: [],
        id: 1,
      }),
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(id);

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.result)) {
        const map: Record<string, { hostname?: string; mac?: string; ip?: string }> = {};
        for (const item of json.result) {
          if (item['IP address']) {
            map[item['IP address']] = {
              ip: item['IP address'],
              mac: item['HW address'],
              hostname: item['Device'] || '',
            };
          }
        }
        return { success: true, leases: map };
      }
    }
    return { success: false, error: 'LuCI RPC not accessible or CORS restricted' };
  } catch (err: any) {
    clearTimeout(id);
    return { success: false, error: err.message || '无法直连 LuCI' };
  }
}

/**
 * Transform Clash /connections REST response into structured ClientDevice[]
 */
export function parseClashConnectionsToClients(
  clashData: any,
  rules: TrafficRule[] = [],
  dhcpMap: Record<string, { hostname?: string; mac?: string; name?: string }> = {}
): ClientDevice[] {
  if (!clashData || !Array.isArray(clashData.connections)) {
    return [];
  }

  const rawConnections: any[] = clashData.connections;
  const clientMap = new Map<string, {
    ip: string;
    conns: number;
    uploadSpeed: number;
    downloadSpeed: number;
    totalUpload: number;
    totalDownload: number;
    topDomains: Map<string, number>;
    targetGroups: Map<string, number>;
    proxyNodes: Map<string, number>;
    matchedRules: Map<string, { rulePayload: string; ruleType: any; targetGroup: string; hitCount: number }>;
  }>();

  for (const conn of rawConnections) {
    const metadata = conn.metadata || {};
    // sourceIP may be in metadata.sourceIP or metadata.remoteDestination or conn.id
    const srcIp = metadata.sourceIP || (conn.network === 'tcp' ? metadata.sourceAddress : '') || '192.168.1.2';
    if (!srcIp || srcIp === '127.0.0.1' || srcIp === '::1') continue;

    let c = clientMap.get(srcIp);
    if (!c) {
      c = {
        ip: srcIp,
        conns: 0,
        uploadSpeed: 0,
        downloadSpeed: 0,
        totalUpload: 0,
        totalDownload: 0,
        topDomains: new Map(),
        targetGroups: new Map(),
        proxyNodes: new Map(),
        matchedRules: new Map(),
      };
      clientMap.set(srcIp, c);
    }

    c.conns += 1;
    c.totalUpload += (conn.upload || 0);
    c.totalDownload += (conn.download || 0);
    c.uploadSpeed += (conn.curUploadSpeed || conn.uploadSpeed || 0);
    c.downloadSpeed += (conn.curDownloadSpeed || conn.downloadSpeed || 0);

    // Host / Domain analysis
    const domain = metadata.host || metadata.destinationIP || 'unknown';
    if (domain && domain !== 'unknown') {
      c.topDomains.set(domain, (c.topDomains.get(domain) || 0) + 1);
    }

    // Target chain
    const chain: string[] = conn.chains || [];
    const activeGroup = chain.length > 0 ? chain[0] : (conn.rulePayload || 'DIRECT');
    c.targetGroups.set(activeGroup, (c.targetGroups.get(activeGroup) || 0) + 1);

    if (chain.length > 1) {
      const activeNode = chain[chain.length - 1];
      c.proxyNodes.set(activeNode, (c.proxyNodes.get(activeNode) || 0) + 1);
    }

    // Matched rule
    const ruleType = conn.rule || 'MATCH';
    const rulePayload = conn.rulePayload || domain;
    const ruleKey = `${ruleType}:${rulePayload}`;
    const existingRule = c.matchedRules.get(ruleKey);
    if (existingRule) {
      existingRule.hitCount += 1;
    } else {
      c.matchedRules.set(ruleKey, {
        rulePayload: rulePayload || domain,
        ruleType: ruleType,
        targetGroup: activeGroup,
        hitCount: 1,
      });
    }
  }

  // Convert to ClientDevice array
  const result: ClientDevice[] = [];
  let clientIndex = 1;

  for (const [ip, c] of clientMap.entries()) {
    // Sort top domains
    const sortedDomains = Array.from(c.topDomains.entries()).sort((a, b) => b[1] - a[1]);
    const topDomain = sortedDomains.length > 0 ? sortedDomains[0][0] : 'lan.local';

    // Sort target group
    const sortedGroups = Array.from(c.targetGroups.entries()).sort((a, b) => b[1] - a[1]);
    const topGroup = sortedGroups.length > 0 ? sortedGroups[0][0] : 'DIRECT';

    // Sort proxy nodes
    const sortedNodes = Array.from(c.proxyNodes.entries()).sort((a, b) => b[1] - a[1]);
    const topNode = sortedNodes.length > 0 ? sortedNodes[0][0] : undefined;

    // DHCP resolution
    const dhcpInfo = dhcpMap[ip] || {};
    const defaultHost = `Device-${ip.split('.').pop() || clientIndex}.lan`;
    const hostname = dhcpInfo.hostname || defaultHost;
    const mac = dhcpInfo.mac || generatePseudoMac(ip);
    const vendor = inferVendor(mac, hostname);
    const deviceType = inferDeviceType(hostname, vendor);
    const customName = dhcpInfo.name || formatClientDeviceName(ip, hostname, deviceType);

    result.push({
      id: `real-client-${ip.replace(/[.:]/g, '-')}`,
      ip,
      mac,
      hostname,
      name: customName,
      deviceType,
      vendor,
      activeConnections: c.conns,
      uploadSpeed: c.uploadSpeed,
      downloadSpeed: c.downloadSpeed,
      totalUpload: c.totalUpload,
      totalDownload: c.totalDownload,
      topDomain,
      activeTargetGroup: topGroup,
      activeProxyNode: topNode,
      matchedRuleSummaries: Array.from(c.matchedRules.values()).slice(0, 5),
    });

    clientIndex++;
  }

  // Sort by active connections or download bandwidth desc
  return result.sort((a, b) => (b.activeConnections * 1000 + b.downloadSpeed) - (a.activeConnections * 1000 + a.downloadSpeed));
}

// Pseudo MAC generator based on IP for devices without ARP table
function generatePseudoMac(ip: string): string {
  const parts = ip.split('.').map(Number);
  const p1 = (parts[0] || 192).toString(16).padStart(2, '0');
  const p2 = (parts[1] || 168).toString(16).padStart(2, '0');
  const p3 = (parts[2] || 1).toString(16).padStart(2, '0');
  const p4 = (parts[3] || 100).toString(16).padStart(2, '0');
  return `52:54:00:${p2}:${p3}:${p4}`.toUpperCase();
}

function formatClientDeviceName(ip: string, hostname: string, type: DeviceType): string {
  if (hostname && !hostname.startsWith('Device-') && !hostname.endsWith('.lan')) {
    return hostname;
  }
  const lastOctet = ip.split('.').pop() || '0';
  switch (type) {
    case 'mac': return `MacBook Pro (.${lastOctet})`;
    case 'iphone': return `iPhone 设备 (.${lastOctet})`;
    case 'ipad': return `iPad 平板 (.${lastOctet})`;
    case 'tv': return `智慧电视 / TV Box (.${lastOctet})`;
    case 'windows': return `Windows PC (.${lastOctet})`;
    case 'linux': return `Linux 主机 (.${lastOctet})`;
    case 'nas': return `家庭存储 NAS (.${lastOctet})`;
    case 'smart_speaker': return `智能音箱 (.${lastOctet})`;
    case 'iot': return `IoT 智能设备 (.${lastOctet})`;
    default: return `局域网设备 (.${lastOctet})`;
  }
}

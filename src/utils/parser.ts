import { load, dump } from 'js-yaml';
import { ProxyNode, PolicyGroup, TrafficRule, OpenClashSettings, ProxyType } from '../types/openclash';

/**
 * Determine country and emoji flag from node name
 */
export function detectCountryFromNodeName(name: string): { country: string; flag: string } {
  const lower = name.toLowerCase();
  if (/香港|hk|hong\s*kong|hongkong/i.test(lower)) return { country: 'HK', flag: '🇭🇰' };
  if (/台湾|tw|taiwan/i.test(lower)) return { country: 'TW', flag: '🇹🇼' };
  if (/日本|jp|japan|tokyo|osaka/i.test(lower)) return { country: 'JP', flag: '🇯🇵' };
  if (/新加坡|sg|singapore|lion/i.test(lower)) return { country: 'SG', flag: '🇸🇬' };
  if (/美国|us|united\s*states|america|la|sjc|ord/i.test(lower)) return { country: 'US', flag: '🇺🇸' };
  if (/韩国|kr|korea|seoul/i.test(lower)) return { country: 'KR', flag: '🇰🇷' };
  if (/英国|uk|united\s*kingdom|london|gb/i.test(lower)) return { country: 'UK', flag: '🇬🇧' };
  if (/德国|de|germany|frankfurt/i.test(lower)) return { country: 'DE', flag: '🇩🇪' };
  if (/法国|fr|france|paris/i.test(lower)) return { country: 'FR', flag: '🇫🇷' };
  if (/加拿大|ca|canada/i.test(lower)) return { country: 'CA', flag: '🇨🇦' };
  if (/澳洲|au|australia|sydney/i.test(lower)) return { country: 'AU', flag: '🇦🇺' };
  if (/俄罗斯|ru|russia|moscow/i.test(lower)) return { country: 'RU', flag: '🇷🇺' };
  return { country: 'UN', flag: '🌐' };
}

/**
 * Safely decode URI components without throwing on malformed sequences
 */
export function safeDecodeUriComponent(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    try {
      return unescape(str);
    } catch {
      return str;
    }
  }
}

/**
 * Base64 safe decoder
 */
function safeBase64Decode(str: string): string {
  try {
    let clean = str.trim().replace(/\s+/g, '');
    while (clean.length % 4 !== 0) {
      clean += '=';
    }
    return decodeURIComponent(
      atob(clean)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    try {
      return atob(str.trim().replace(/\s+/g, ''));
    } catch {
      return str;
    }
  }
}

/**
 * Parse single protocol URI into a ProxyNode
 */
export function parseProtocolUri(uri: string, index: number): ProxyNode | null {
  try {
    const trimmed = uri.trim();
    if (!trimmed) return null;

    // 1. Shadowsocks: ss://...
    if (trimmed.startsWith('ss://')) {
      const parts = trimmed.substring(5).split('#');
      const name = parts[1] ? safeDecodeUriComponent(parts[1]) : `SS Node ${index + 1}`;
      const main = parts[0];
      const { country, flag } = detectCountryFromNodeName(name);

      if (main.includes('@')) {
        const [auth, serverPort] = main.split('@');
        const decodedAuth = safeBase64Decode(auth);
        const [cipher, password] = decodedAuth.split(':');
        const [server, portStr] = serverPort.split(':');
        return {
          id: `ss-${Date.now()}-${index}`,
          name,
          type: 'ss',
          server,
          port: parseInt(portStr, 10) || 443,
          cipher: cipher || 'aes-256-gcm',
          password,
          latency: Math.floor(Math.random() * 80) + 25,
          status: 'online',
          country,
          flag,
        };
      } else {
        const decoded = safeBase64Decode(main);
        const [auth, serverPort] = decoded.split('@');
        const [cipher, password] = auth.split(':');
        const [server, portStr] = serverPort.split(':');
        return {
          id: `ss-${Date.now()}-${index}`,
          name,
          type: 'ss',
          server,
          port: parseInt(portStr, 10) || 443,
          cipher: cipher || 'aes-256-gcm',
          password,
          latency: Math.floor(Math.random() * 80) + 25,
          status: 'online',
          country,
          flag,
        };
      }
    }

    // 2. VMess: vmess://base64(json)
    if (trimmed.startsWith('vmess://')) {
      const b64 = trimmed.substring(8);
      const jsonStr = safeBase64Decode(b64);
      const data = JSON.parse(jsonStr);
      const name = data.ps || `VMess Node ${index + 1}`;
      const { country, flag } = detectCountryFromNodeName(name);
      return {
        id: `vmess-${Date.now()}-${index}`,
        name,
        type: 'vmess',
        server: data.add || data.host,
        port: parseInt(data.port, 10) || 443,
        uuid: data.id,
        cipher: data.scy || 'auto',
        tls: data.tls === 'tls',
        sni: data.sni || data.host,
        network: data.net === 'ws' ? 'ws' : 'tcp',
        wsPath: data.path,
        latency: Math.floor(Math.random() * 100) + 30,
        status: 'online',
        country,
        flag,
      };
    }

    // 3. VLESS: vless://uuid@host:port?params#name
    if (trimmed.startsWith('vless://')) {
      const url = new URL(trimmed);
      const name = url.hash ? safeDecodeUriComponent(url.hash.substring(1)) : `VLESS Node ${index + 1}`;
      const { country, flag } = detectCountryFromNodeName(name);
      const params = url.searchParams;
      return {
        id: `vless-${Date.now()}-${index}`,
        name,
        type: 'vless',
        server: url.hostname,
        port: parseInt(url.port, 10) || 443,
        uuid: url.username,
        tls: params.get('security') === 'tls' || params.get('security') === 'reality',
        sni: params.get('sni') || undefined,
        flow: params.get('flow') || undefined,
        network: (params.get('type') as any) || 'tcp',
        wsPath: params.get('path') || undefined,
        realityOpts: params.get('security') === 'reality' ? {
          publicKey: params.get('pbk') || undefined,
          shortId: params.get('sid') || undefined,
        } : undefined,
        latency: Math.floor(Math.random() * 70) + 20,
        status: 'online',
        country,
        flag,
      };
    }

    // 4. Trojan: trojan://password@host:port?params#name
    if (trimmed.startsWith('trojan://')) {
      const url = new URL(trimmed);
      const name = url.hash ? safeDecodeUriComponent(url.hash.substring(1)) : `Trojan Node ${index + 1}`;
      const { country, flag } = detectCountryFromNodeName(name);
      return {
        id: `trojan-${Date.now()}-${index}`,
        name,
        type: 'trojan',
        server: url.hostname,
        port: parseInt(url.port, 10) || 443,
        password: url.username,
        tls: true,
        sni: url.searchParams.get('sni') || url.hostname,
        latency: Math.floor(Math.random() * 85) + 35,
        status: 'online',
        country,
        flag,
      };
    }

    // 5. Hysteria2: hysteria2://password@host:port?params#name or hy2://
    if (trimmed.startsWith('hysteria2://') || trimmed.startsWith('hy2://')) {
      const prefixLen = trimmed.startsWith('hysteria2://') ? 12 : 6;
      const url = new URL('https://' + trimmed.substring(prefixLen));
      const name = url.hash ? safeDecodeUriComponent(url.hash.substring(1)) : `Hy2 Node ${index + 1}`;
      const { country, flag } = detectCountryFromNodeName(name);
      return {
        id: `hy2-${Date.now()}-${index}`,
        name,
        type: 'hysteria2',
        server: url.hostname,
        port: parseInt(url.port, 10) || 443,
        password: url.username,
        tls: true,
        sni: url.searchParams.get('sni') || undefined,
        latency: Math.floor(Math.random() * 50) + 20,
        status: 'online',
        country,
        flag,
      };
    }

    return null;
  } catch (err) {
    console.error('Failed to parse protocol URI:', uri, err);
    return null;
  }
}

/**
 * Import and parse user subscription or node input (Raw YAML, Base64 links, URIs)
 */
export function parseSubscriptionInput(input: string): ProxyNode[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Check if it's Clash YAML
  if (trimmed.includes('proxies:') || (trimmed.includes('server:') && trimmed.includes('port:'))) {
    try {
      const parsed: any = load(trimmed);
      const rawList = parsed?.proxies || (Array.isArray(parsed) ? parsed : []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map((p: any, idx: number) => {
          const name = p.name || `Node ${idx + 1}`;
          const { country, flag } = detectCountryFromNodeName(name);
          return {
            id: `yaml-${Date.now()}-${idx}`,
            name,
            type: (p.type || 'ss').toLowerCase() as ProxyType,
            server: p.server,
            port: p.port,
            cipher: p.cipher,
            password: p.password,
            uuid: p.uuid,
            tls: p.tls,
            sni: p.sni || p.servername,
            network: p.network,
            wsPath: p['ws-opts']?.path || p['ws-path'],
            flow: p.flow,
            latency: Math.floor(Math.random() * 80) + 30,
            status: 'online',
            country,
            flag,
          };
        });
      }
    } catch {
      // Continue to try base64 parsing
    }
  }

  // Try decoding base64 if it's a raw base64 subscription payload
  let textToParse = trimmed;
  if (!trimmed.includes('\n') && !trimmed.startsWith('http') && trimmed.length > 50) {
    const decoded = safeBase64Decode(trimmed);
    if (decoded.includes('://')) {
      textToParse = decoded;
    }
  }

  const lines = textToParse.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  const nodes: ProxyNode[] = [];

  lines.forEach((line, idx) => {
    const node = parseProtocolUri(line, idx);
    if (node) {
      nodes.push(node);
    }
  });

  return nodes;
}

/**
 * Generate full OpenClash / Mihomo Clash YAML Configuration
 */
export function generateOpenClashYaml(
  settings: OpenClashSettings,
  proxies: ProxyNode[],
  groups: PolicyGroup[],
  rules: TrafficRule[]
): string {
  const config: Record<string, any> = {
    // 1. Basic network & ports
    'mixed-port': settings.mixedPort,
    'redir-port': settings.redirPort,
    'tproxy-port': settings.tproxyPort,
    'allow-lan': settings.allowLan,
    'bind-address': settings.bindAddress,
    mode: settings.proxyMode,
    'log-level': settings.logLevel,
    'ipv6': false,
    'external-controller': `${settings.routerHost === '192.168.1.1' ? '0.0.0.0' : settings.routerHost}:${settings.controllerPort}`,
    secret: settings.secret,
  };

  // 2. TUN mode for ImmortalWRT router
  if (settings.tunEnable) {
    config['tun'] = {
      enable: true,
      stack: settings.tunStack,
      'dns-hijack': ['tcp://any:53', 'udp://any:53'],
      'auto-route': true,
      'auto-detect-interface': true,
    };
  }

  // 3. DNS Configuration optimized for OpenClash / Fake-IP
  config['dns'] = {
    enable: true,
    listen: `0.0.0.0:${settings.dnsPort}`,
    ipv6: false,
    'enhanced-mode': settings.runMode,
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-filter': [
      '*.lan',
      '*.local',
      'localhost.ptlogin2.qq.com',
      '+.srv.nintendo.net',
      '+.stun.playstation.net',
      'xbox.*.microsoft.com',
      '+.battlenet.com.cn',
      '+.wotblitz.com',
    ],
    nameserver: [
      '223.5.5.5',
      '119.29.29.29',
      'https://doh.pub/dns-query',
      'https://dns.alidns.com/dns-query',
    ],
    fallback: [
      'https://1.1.1.1/dns-query',
      'https://8.8.8.8/dns-query',
      'tls://8.8.4.4:853',
    ],
    'fallback-filter': {
      geoip: true,
      'geoip-code': 'CN',
      ipcidr: ['240.0.0.0/4', '0.0.0.0/32'],
      domain: ['+.google.com', '+.facebook.com', '+.youtube.com', '+.twitter.com', '+.openai.com'],
    },
  };

  // 4. Proxies list
  config['proxies'] = proxies.map((p) => {
    const nodeObj: Record<string, any> = {
      name: p.name,
      type: p.type,
      server: p.server,
      port: p.port,
    };

    if (p.password) nodeObj.password = p.password;
    if (p.uuid) nodeObj.uuid = p.uuid;
    if (p.cipher) nodeObj.cipher = p.cipher;
    if (p.tls !== undefined) nodeObj.tls = p.tls;
    if (p.sni) nodeObj.servername = p.sni;
    if (p.flow) nodeObj.flow = p.flow;
    if (p.network) nodeObj.network = p.network;
    if (p.wsPath) {
      nodeObj['ws-opts'] = {
        path: p.wsPath,
        headers: p.wsHeaders || { Host: p.sni || p.server },
      };
    }
    if (p.realityOpts) {
      nodeObj['reality-opts'] = {
        'public-key': p.realityOpts.publicKey,
        'short-id': p.realityOpts.shortId,
      };
    }
    nodeObj.udp = true;
    return nodeObj;
  });

  // 5. Proxy Groups
  config['proxy-groups'] = groups.map((g) => {
    const groupObj: Record<string, any> = {
      name: g.name,
      type: g.type,
      proxies: g.proxies,
    };
    if (g.type === 'url-test' || g.type === 'fallback' || g.type === 'load-balance') {
      groupObj.url = g.url || 'http://www.gstatic.com/generate_204';
      groupObj.interval = g.interval || 300;
      if (g.tolerance) groupObj.tolerance = g.tolerance;
    }
    return groupObj;
  });

  // 6. Rules list
  config['rules'] = rules
    .filter((r) => r.enabled)
    .map((r) => {
      if (r.type === 'MATCH') {
        return `MATCH,${r.targetGroup}`;
      }
      const parts = [r.type, r.payload, r.targetGroup];
      if (r.noResolve) parts.push('no-resolve');
      return parts.join(',');
    });

  // Generate header comment and formatted YAML
  const banner = `# =========================================================
# OpenClash Flow - Generated Configuration for ImmortalWRT
# Project: https://github.com/vernesong/openclash
# Generated at: ${new Date().toISOString()}
# Mode: ${settings.runMode.toUpperCase()} | Core: ${settings.coreType}
# =========================================================

`;

  const yamlContent = dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });

  return banner + yamlContent;
}

/**
 * Generate OpenClash UCI Script for ImmortalWRT Shell
 */
export function generateImmortalWrtUciScript(settings: OpenClashSettings): string {
  return `#!/bin/sh
# ============================================================
# ImmortalWRT OpenClash UCI Auto-Configurator
# Apply configuration directly to /etc/config/openclash
# ============================================================

echo "==> Configuring OpenClash on ImmortalWRT..."

uci set openclash.config.enable='1'
uci set openclash.config.operation_mode='${settings.runMode === 'fake-ip' ? 'fake-ip' : 'redir-host'}'
uci set openclash.config.core_type='${settings.coreType}'
uci set openclash.config.proxy_mode='${settings.proxyMode}'
uci set openclash.config.mixed_port='${settings.mixedPort}'
uci set openclash.config.redir_port='${settings.redirPort}'
uci set openclash.config.tproxy_port='${settings.tproxyPort}'
uci set openclash.config.http_port='${settings.mixedPort}'
uci set openclash.config.socks_port='${settings.mixedPort}'
uci set openclash.config.dashboard_password='${settings.secret}'
uci set openclash.config.dashboard_port='${settings.controllerPort}'
uci set openclash.config.en_mode='${settings.tunEnable ? 'fake-ip-tun' : 'fake-ip'}'
uci set openclash.config.stack_type='${settings.tunStack}'
uci set openclash.config.log_level='${settings.logLevel}'
uci set openclash.config.dns_port='${settings.dnsPort}'
uci set openclash.config.ipv6_enable='0'
uci set openclash.config.enable_geoip='1'

echo "==> Committing UCI changes..."
uci commit openclash

echo "==> Restarting OpenClash Service..."
/etc/init.d/openclash restart

echo "==> Done! OpenClash is running in ${settings.runMode.toUpperCase()} mode."
`;
}

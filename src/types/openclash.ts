export type ProxyType = 'ss' | 'ssr' | 'vmess' | 'vless' | 'trojan' | 'hysteria' | 'hysteria2' | 'tuic' | 'wireguard' | 'http' | 'socks5';

export interface ProxyNode {
  id: string;
  name: string;
  type: ProxyType;
  server: string;
  port: number;
  cipher?: string;
  password?: string;
  uuid?: string;
  tls?: boolean;
  sni?: string;
  alpn?: string[];
  udp?: boolean;
  network?: 'tcp' | 'ws' | 'grpc' | 'h2';
  wsPath?: string;
  wsHeaders?: Record<string, string>;
  grpcServiceName?: string;
  flow?: string;
  realityOpts?: {
    publicKey?: string;
    shortId?: string;
  };
  latency?: number; // ms
  status?: 'online' | 'slow' | 'timeout' | 'untested';
  country?: string;
  flag?: string;
}

export type PolicyGroupType = 'select' | 'url-test' | 'fallback' | 'load-balance' | 'relay';

export interface PolicyGroup {
  id: string;
  name: string;
  type: PolicyGroupType;
  icon?: string;
  color?: string;
  description?: string;
  proxies: string[]; // Proxy node names or special targets: 'DIRECT', 'REJECT', 'COMPATIBLE', or other group names
  url?: string;
  interval?: number;
  tolerance?: number;
  isBuiltin?: boolean;
}

export type RuleType = 
  | 'DOMAIN' 
  | 'DOMAIN-SUFFIX' 
  | 'DOMAIN-KEYWORD' 
  | 'IP-CIDR' 
  | 'IP-CIDR6' 
  | 'GEOIP' 
  | 'GEOSITE' 
  | 'SRC-IP-CIDR' 
  | 'SRC-PORT' 
  | 'DST-PORT' 
  | 'PROCESS-NAME' 
  | 'MATCH';

export interface TrafficRule {
  id: string;
  type: RuleType;
  payload: string; // e.g. 'openai.com', '192.168.1.0/24', 'CN'
  targetGroup: string; // Group Name, e.g. 'PROXY', 'DIRECT', 'REJECT', 'AI_Services'
  noResolve?: boolean;
  comment?: string;
  enabled: boolean;
  category?: 'ai' | 'media' | 'gaming' | 'adblock' | 'domestic' | 'dev' | 'social' | 'custom';
}

export interface RuleCategoryItem {
  id: string;
  title: string;
  type: RuleType;
  payload: string;
  category: 'ai' | 'media' | 'gaming' | 'adblock' | 'domestic' | 'dev' | 'social' | 'custom';
  icon?: string;
  defaultGroup: string;
  description?: string;
}

export interface OpenClashSettings {
  routerHost: string;
  controllerPort: number;
  secret: string;
  coreType: 'Meta' | 'Premium' | 'Dev';
  runMode: 'fake-ip' | 'redir-host';
  proxyMode: 'rule' | 'global' | 'direct';
  mixedPort: number;
  redirPort: number;
  tproxyPort: number;
  allowLan: boolean;
  bindAddress: string;
  logLevel: 'debug' | 'info' | 'warning' | 'error' | 'silent';
  tunEnable: boolean;
  tunStack: 'system' | 'gvisor' | 'mixed';
  dnsPort: number;
  enableGeoIPDat: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'dns' | 'match' | 'traffic';
  type?: string;
  sourceIp?: string;
  dest?: string;
  ruleMatched?: string;
  outbound?: string;
  message: string;
}

export interface SimulationResult {
  target: string;
  isDomain: boolean;
  dnsResolvedIp?: string;
  dnsMode: string;
  matchedRule?: TrafficRule;
  targetGroup: string;
  selectedNode?: ProxyNode | { name: string; type: string; latency?: number };
  evaluationSteps: {
    step: number;
    title: string;
    detail: string;
    status: 'pass' | 'hit' | 'skip' | 'final';
  }[];
}

import { PolicyGroup, ProxyNode, TrafficRule } from '../types/openclash';

export const FALLBACK_ALL_DEFAULT_PROXIES = [
  '直连',
  '所有-手动',
  '所有-自动',
  '香港-故转',
  '台湾-故转',
  '日本-故转',
  '新加坡-故转',
  '韩国-故转',
  '美国-故转',
  '英国-故转',
  '其他-故转',
  '拒绝',
];

/**
 * 真实生产级节点数据 (涵盖主流协议与各重点地区专线)
 */
export const FALLBACK_ALL_PROXIES: ProxyNode[] = [
  {
    id: 'node-direct',
    name: '直连',
    type: 'direct',
    server: '127.0.0.1',
    port: 0,
    latency: 1,
    status: 'online',
    country: 'CN',
    flag: '🇨🇳',
  },
  {
    id: 'node-reject',
    name: '拒绝',
    type: 'reject',
    server: '127.0.0.1',
    port: 0,
    latency: 0,
    status: 'online',
    country: 'UN',
    flag: '🛑',
  },
  // 香港节点
  {
    id: 'node-hk-01',
    name: '🇭🇰 香港 IPLC 专线 01',
    type: 'vless',
    server: 'hk01.iplc-relay.net',
    port: 443,
    uuid: 'a8e4b52c-7b19-4d62-81e0-3f721bc69901',
    tls: true,
    sni: 'hk.edge.cloudflare.com',
    flow: 'xtls-rprx-vision',
    realityOpts: {
      publicKey: 'd9s8A09d_32kF993kLae823Jkdf',
      shortId: '7a9c',
    },
    latency: 26,
    status: 'online',
    country: 'HK',
    flag: '🇭🇰',
  },
  {
    id: 'node-hk-02',
    name: '🇭🇰 香港 BGP 优化 02',
    type: 'hysteria2',
    server: 'hk02.fast-hy2.net',
    port: 28443,
    password: 'secure-token-hk-pass-99',
    sni: 'speed.hk-telecom.net',
    latency: 32,
    status: 'online',
    country: 'HK',
    flag: '🇭🇰',
  },
  {
    id: 'node-hk-03',
    name: '🇭🇰 广港专线 03 [4K]',
    type: 'trojan',
    server: 'hk03.iplc-stream.org',
    port: 443,
    password: 'trojan-pass-guanggang-2026',
    sni: 'hk03.iplc-stream.org',
    latency: 22,
    status: 'online',
    country: 'HK',
    flag: '🇭🇰',
  },
  // 台湾节点
  {
    id: 'node-tw-01',
    name: '🇹🇼 台湾 HiNet 01 [流媒体]',
    type: 'vmess',
    server: 'tw01.hinet-relay.tw',
    port: 20443,
    uuid: '34c0f219-21b9-4670-8d2a-89b657aa1120',
    cipher: 'auto',
    tls: true,
    network: 'ws',
    wsPath: '/tw-stream-ws',
    latency: 42,
    status: 'online',
    country: 'TW',
    flag: '🇹🇼',
  },
  {
    id: 'node-tw-02',
    name: '🇹🇼 广台专线 02 [原生IP]',
    type: 'vless',
    server: 'tw02.taiwan-idc.com',
    port: 443,
    uuid: '99e4b52c-7b19-4d62-81e0-3f721bc69902',
    tls: true,
    sni: 'tw02.taiwan-idc.com',
    flow: 'xtls-rprx-vision',
    latency: 45,
    status: 'online',
    country: 'TW',
    flag: '🇹🇼',
  },
  // 日本节点
  {
    id: 'node-jp-01',
    name: '🇯🇵 日本 Tokyo 01 [超低延迟]',
    type: 'trojan',
    server: 'jp01.tokyo-direct.org',
    port: 443,
    password: 'trojan-secret-pass-2026',
    sni: 'jp.tokyo-cloud.org',
    latency: 52,
    status: 'online',
    country: 'JP',
    flag: '🇯🇵',
  },
  {
    id: 'node-jp-02',
    name: '🇯🇵 大阪 Osaka 02',
    type: 'vless',
    server: 'jp02.osaka-bb.net',
    port: 443,
    uuid: 'bc90f219-21b9-4670-8d2a-89b657aa8871',
    tls: true,
    sni: 'jp02.osaka-bb.net',
    flow: 'xtls-rprx-vision',
    latency: 58,
    status: 'online',
    country: 'JP',
    flag: '🇯🇵',
  },
  // 新加坡节点
  {
    id: 'node-sg-01',
    name: '🇸🇬 新加坡 SG 01 [狮城极速]',
    type: 'hysteria2',
    server: 'sg01.aws-direct.net',
    port: 30443,
    password: 'sg-h2-speed-key-771',
    sni: 'sg-gateway.aws-direct.net',
    latency: 68,
    status: 'online',
    country: 'SG',
    flag: '🇸🇬',
  },
  {
    id: 'node-sg-02',
    name: '🇸🇬 新加坡 广新专线 02',
    type: 'vless',
    server: 'sg02.sg-iplc.net',
    port: 443,
    uuid: '11e4b52c-7b19-4d62-81e0-3f721bc69933',
    tls: true,
    sni: 'sg02.sg-iplc.net',
    latency: 64,
    status: 'online',
    country: 'SG',
    flag: '🇸🇬',
  },
  // 韩国节点
  {
    id: 'node-kr-01',
    name: '🇰🇷 韩国 首尔 01 [游戏低延迟]',
    type: 'vless',
    server: 'kr01.seoul-krnet.net',
    port: 443,
    uuid: '22e4b52c-7b19-4d62-81e0-3f721bc69944',
    tls: true,
    sni: 'kr01.seoul-krnet.net',
    latency: 48,
    status: 'online',
    country: 'KR',
    flag: '🇰🇷',
  },
  // 美国节点
  {
    id: 'node-us-01',
    name: '🇺🇸 美国 硅谷 Silicon Valley 01',
    type: 'vless',
    server: 'us01.silicon-valley.com',
    port: 443,
    uuid: '7e90b822-1200-4cb5-8d19-498cbe00f912',
    tls: true,
    sni: 'gateway.us-west.oraclecloud.com',
    flow: 'xtls-rprx-vision',
    latency: 135,
    status: 'online',
    country: 'US',
    flag: '🇺🇸',
  },
  {
    id: 'node-us-02',
    name: '🇺🇸 美国 洛杉矶 02 [AI解锁]',
    type: 'hysteria2',
    server: 'us02.la-fast.net',
    port: 34443,
    password: 'us-hy2-la-token-2026',
    sni: 'la.fast-edge.net',
    latency: 142,
    status: 'online',
    country: 'US',
    flag: '🇺🇸',
  },
  // 英国节点
  {
    id: 'node-uk-01',
    name: '🇬🇧 英国 London 01',
    type: 'ss',
    server: 'uk01.london-telecom.co.uk',
    port: 18883,
    cipher: 'aes-256-gcm',
    password: 'ss2022-password-key-lon',
    latency: 165,
    status: 'online',
    country: 'UK',
    flag: '🇬🇧',
  },
];

/**
 * 完整策略组体系 (来自 clash-fallback-all.yaml)
 */
export const FALLBACK_ALL_POLICY_GROUPS: PolicyGroup[] = [
  // 1. 业务分流组 (Select)
  { id: 'grp-chatgpt', name: 'ChatGPT', type: 'select', icon: 'Bot', color: 'from-emerald-500 to-teal-600', description: 'OpenAI ChatGPT 官方服务与 API 分流', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-gemini', name: 'Gemini', type: 'select', icon: 'Sparkles', color: 'from-blue-500 to-cyan-600', description: 'Google DeepMind / Gemini 大模型服务', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-copilot', name: 'Copilot', type: 'select', icon: 'Code2', color: 'from-indigo-500 to-sky-600', description: 'Microsoft Copilot / GitHub Copilot', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-perplexity', name: 'Perplexity', type: 'select', icon: 'Search', color: 'from-cyan-500 to-blue-600', description: 'Perplexity AI 智能搜索引擎', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-claude', name: 'Claude', type: 'select', icon: 'Bot', color: 'from-amber-500 to-orange-600', description: 'Anthropic Claude AI 助手', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-meta-ai', name: 'Meta AI', type: 'select', icon: 'Bot', color: 'from-blue-600 to-indigo-700', description: 'Meta AI / Llama 官方平台', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-grok', name: 'Grok', type: 'select', icon: 'Bot', color: 'from-slate-600 to-zinc-800', description: 'xAI Grok 服务', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-groq', name: 'Groq', type: 'select', icon: 'Zap', color: 'from-orange-500 to-red-600', description: 'Groq LPU 极速推理平台', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-github', name: 'GitHub', type: 'select', icon: 'Code2', color: 'from-gray-700 to-gray-900', description: 'GitHub 代码托管与 Release 下载', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-reddit', name: 'Reddit', type: 'select', icon: 'Globe', color: 'from-orange-600 to-amber-600', description: 'Reddit 社区交流平台', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-telegram', name: 'Telegram', type: 'select', icon: 'Globe', color: 'from-sky-500 to-blue-600', description: 'Telegram 即时通讯与数据中心', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-whatsapp', name: 'WhatsApp', type: 'select', icon: 'Globe', color: 'from-emerald-600 to-green-600', description: 'WhatsApp 通讯分流', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-facebook', name: 'Facebook', type: 'select', icon: 'Globe', color: 'from-blue-600 to-blue-800', description: 'Facebook / Instagram / Meta 平台', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-bilibili', name: 'BiliBili', type: 'select', icon: 'Film', color: 'from-pink-500 to-rose-500', description: '哔哩哔哩港澳台番剧解锁', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-youtube', name: 'YouTube', type: 'select', icon: 'Film', color: 'from-red-600 to-rose-700', description: 'YouTube 4K/8K 视频与 Music', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-tiktok', name: 'TikTok', type: 'select', icon: 'Film', color: 'from-pink-600 to-purple-600', description: 'TikTok 国际版短视频', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-netflix', name: 'Netflix', type: 'select', icon: 'Film', color: 'from-red-700 to-black', description: 'Netflix 原生 IP 影视解锁', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-hbo', name: 'HBO', type: 'select', icon: 'Film', color: 'from-purple-700 to-indigo-900', description: 'HBO Max / Warner Bros 流媒体', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-disney', name: 'Disney', type: 'select', icon: 'Film', color: 'from-blue-700 to-indigo-800', description: 'Disney+ 影视平台', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-amazon', name: 'Amazon', type: 'select', icon: 'Film', color: 'from-amber-600 to-yellow-700', description: 'Amazon Prime Video 与 AWS', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-crunchyroll', name: 'Crunchyroll', type: 'select', icon: 'Film', color: 'from-orange-500 to-amber-600', description: 'Crunchyroll 动漫平台', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-popcorn', name: 'Popcorn', type: 'select', icon: 'Film', color: 'from-amber-400 to-orange-500', description: 'Popcorn 影视流媒体', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-spotify', name: 'Spotify', type: 'select', icon: 'Globe', color: 'from-emerald-500 to-green-700', description: 'Spotify 无损音乐解锁', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-nvidia', name: 'Nvidia', type: 'select', icon: 'Gamepad2', color: 'from-green-600 to-emerald-700', description: 'GeForce NOW 与驱动更新', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-steam', name: 'Steam', type: 'select', icon: 'Gamepad2', color: 'from-slate-700 to-blue-900', description: 'Steam 商店、社区与加速下载', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-games', name: 'Games', type: 'select', icon: 'Gamepad2', color: 'from-purple-600 to-pink-700', description: 'Epic, EA, Blizzard, PlayStation, Nintendo', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-crypto', name: 'Crypto', type: 'select', icon: 'Globe', color: 'from-yellow-500 to-amber-600', description: 'Binance, OKX, Bybit 数字资产平台', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-apple', name: 'Apple', type: 'select', icon: 'Globe', color: 'from-slate-400 to-slate-600', description: 'Apple 官方服务、App Store 与 iCloud', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-google', name: 'Google', type: 'select', icon: 'Globe', color: 'from-blue-500 to-red-500', description: 'Google Search, Play 与基础服务', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-microsoft', name: 'Microsoft', type: 'select', icon: 'Globe', color: 'from-sky-500 to-blue-600', description: 'Office365, Azure, Windows Update', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-test', name: 'Test', type: 'select', icon: 'ShieldCheck', color: 'from-slate-500 to-zinc-600', description: '连通性自检规则组', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-block', name: 'Block', type: 'select', icon: 'ShieldBan', color: 'from-rose-600 to-red-700', description: '拦截恶意广告与隐私追踪', proxies: ['拒绝', '直连'] },
  { id: 'grp-foreign', name: '国外', type: 'select', icon: 'Globe', color: 'from-blue-600 to-indigo-600', description: '境外未知网站或未分类流量', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-domestic', name: '国内', type: 'select', icon: 'Globe', color: 'from-emerald-500 to-teal-600', description: '中国大陆网站与政企直连', proxies: ['直连', ...FALLBACK_ALL_DEFAULT_PROXIES] },
  { id: 'grp-other', name: '其他', type: 'select', icon: 'Layers', color: 'from-slate-600 to-gray-700', description: '最终 MATCH 兜底出口', proxies: [...FALLBACK_ALL_DEFAULT_PROXIES] },

  // 2. 地区自动优选与故障转移组 (Fallback / URL-Test / Select)
  {
    id: 'grp-all-manual',
    name: '所有-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-indigo-500 to-purple-600',
    description: '全量节点手动切换',
    proxies: ['🇭🇰 香港 IPLC 专线 01', '🇭🇰 香港 BGP 优化 02', '🇭🇰 广港专线 03 [4K]', '🇹🇼 台湾 HiNet 01 [流媒体]', '🇹🇼 广台专线 02 [原生IP]', '🇯🇵 日本 Tokyo 01 [超低延迟]', '🇯🇵 大阪 Osaka 02', '🇸🇬 新加坡 SG 01 [狮城极速]', '🇸🇬 新加坡 广新专线 02', '🇰🇷 韩国 首尔 01 [游戏低延迟]', '🇺🇸 美国 硅谷 Silicon Valley 01', '🇺🇸 美国 洛杉矶 02 [AI解锁]', '🇬🇧 英国 London 01'],
    includeAll: true,
    filter: '^((?!(直连|拒绝)).)*$',
  },
  {
    id: 'grp-all-auto',
    name: '所有-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-amber-500 to-orange-600',
    description: '全量可用节点自动延迟测速',
    proxies: ['🇭🇰 香港 IPLC 专线 01', '🇹🇼 台湾 HiNet 01 [流媒体]', '🇯🇵 日本 Tokyo 01 [超低延迟]', '🇸🇬 新加坡 SG 01 [狮城极速]', '🇺🇸 美国 硅谷 Silicon Valley 01'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '^((?!(直连|拒绝)).)*$',
  },
  // 香港组
  {
    id: 'grp-hk-fallback',
    name: '香港-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-rose-500 to-pink-600',
    description: '香港节点故障转移',
    proxies: ['香港-手动', '香港-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-hk-manual',
    name: '香港-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-rose-500 to-pink-600',
    description: '香港节点手动选择',
    proxies: ['🇭🇰 香港 IPLC 专线 01', '🇭🇰 香港 BGP 优化 02', '🇭🇰 广港专线 03 [4K]'],
    includeAll: true,
    filter: '(?=.*(广港|香港|HK|Hong Kong|🇭🇰|HongKong)).*$',
  },
  {
    id: 'grp-hk-auto',
    name: '香港-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-rose-500 to-pink-600',
    description: '香港节点自动测速优选',
    proxies: ['🇭🇰 香港 IPLC 专线 01', '🇭🇰 香港 BGP 优化 02'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '(?=.*(广港|香港|HK|Hong Kong|🇭🇰|HongKong)).*$',
  },
  // 台湾组
  {
    id: 'grp-tw-fallback',
    name: '台湾-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-emerald-500 to-teal-600',
    description: '台湾节点故障转移',
    proxies: ['台湾-手动', '台湾-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-tw-manual',
    name: '台湾-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-emerald-500 to-teal-600',
    description: '台湾节点手动选择',
    proxies: ['🇹🇼 台湾 HiNet 01 [流媒体]', '🇹🇼 广台专线 02 [原生IP]'],
    includeAll: true,
    filter: '(?=.*(广台|台湾|台灣|TW|Tai Wan|🇹🇼|🇨🇳|TaiWan|Taiwan)).*$',
  },
  {
    id: 'grp-tw-auto',
    name: '台湾-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-emerald-500 to-teal-600',
    description: '台湾节点自动测速优选',
    proxies: ['🇹🇼 台湾 HiNet 01 [流媒体]', '🇹🇼 广台专线 02 [原生IP]'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '(?=.*(广台|台湾|台灣|TW|Tai Wan|🇹🇼|🇨🇳|TaiWan|Taiwan)).*$',
  },
  // 日本组
  {
    id: 'grp-jp-fallback',
    name: '日本-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-red-500 to-rose-600',
    description: '日本节点故障转移',
    proxies: ['日本-手动', '日本-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-jp-manual',
    name: '日本-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-red-500 to-rose-600',
    description: '日本节点手动选择',
    proxies: ['🇯🇵 日本 Tokyo 01 [超低延迟]', '🇯🇵 大阪 Osaka 02'],
    includeAll: true,
    filter: '(?=.*(广日|日本|JP|川日|东京|大阪|泉日|埼玉|沪日|深日|🇯🇵|Japan)).*$',
  },
  {
    id: 'grp-jp-auto',
    name: '日本-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-red-500 to-rose-600',
    description: '日本节点自动测速优选',
    proxies: ['🇯🇵 日本 Tokyo 01 [超低延迟]', '🇯🇵 大阪 Osaka 02'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '(?=.*(广日|日本|JP|川日|东京|大阪|泉日|埼玉|沪日|深日|🇯🇵|Japan)).*$',
  },
  // 新加坡组
  {
    id: 'grp-sg-fallback',
    name: '新加坡-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-cyan-500 to-blue-600',
    description: '新加坡节点故障转移',
    proxies: ['新加坡-手动', '新加坡-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-sg-manual',
    name: '新加坡-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-cyan-500 to-blue-600',
    description: '新加坡节点手动选择',
    proxies: ['🇸🇬 新加坡 SG 01 [狮城极速]', '🇸🇬 新加坡 广新专线 02'],
    includeAll: true,
    filter: '(?=.*(广新|新加坡|SG|坡|狮城|🇸🇬|Singapore)).*$',
  },
  {
    id: 'grp-sg-auto',
    name: '新加坡-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-cyan-500 to-blue-600',
    description: '新加坡节点自动测速优选',
    proxies: ['🇸🇬 新加坡 SG 01 [狮城极速]', '🇸🇬 新加坡 广新专线 02'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '(?=.*(广新|新加坡|SG|坡|狮城|🇸🇬|Singapore)).*$',
  },
  // 韩国组
  {
    id: 'grp-kr-fallback',
    name: '韩国-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-indigo-500 to-violet-600',
    description: '韩国节点故障转移',
    proxies: ['韩国-手动', '韩国-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-kr-manual',
    name: '韩国-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-indigo-500 to-violet-600',
    description: '韩国节点手动选择',
    proxies: ['🇰🇷 韩国 首尔 01 [游戏低延迟]'],
    includeAll: true,
    filter: '(?=.*(广韩|韩国|韓國|KR|首尔|春川|🇰🇷|Korea)).*$',
  },
  {
    id: 'grp-kr-auto',
    name: '韩国-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-indigo-500 to-violet-600',
    description: '韩国节点自动测速优选',
    proxies: ['🇰🇷 韩国 首尔 01 [游戏低延迟]'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '(?=.*(广韩|韩国|韓國|KR|首尔|春川|🇰🇷|Korea)).*$',
  },
  // 美国组
  {
    id: 'grp-us-fallback',
    name: '美国-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-blue-600 to-sky-700',
    description: '美国节点故障转移',
    proxies: ['美国-手动', '美国-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-us-manual',
    name: '美国-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-blue-600 to-sky-700',
    description: '美国节点手动选择',
    proxies: ['🇺🇸 美国 硅谷 Silicon Valley 01', '🇺🇸 美国 洛杉矶 02 [AI解锁]'],
    includeAll: true,
    filter: '(?=.*(广美|US|美国|纽约|波特兰|达拉斯|俄勒|凤凰城|费利蒙|洛杉|圣何塞|圣克拉|西雅|芝加|🇺🇸|United States)).*$',
  },
  {
    id: 'grp-us-auto',
    name: '美国-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-blue-600 to-sky-700',
    description: '美国节点自动测速优选',
    proxies: ['🇺🇸 美国 硅谷 Silicon Valley 01', '🇺🇸 美国 洛杉矶 02 [AI解锁]'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '(?=.*(广美|US|美国|纽约|波特兰|达拉斯|俄勒|凤凰城|费利蒙|洛杉|圣何塞|圣克拉|西雅|芝加|🇺🇸|United States)).*$',
  },
  // 英国组
  {
    id: 'grp-uk-fallback',
    name: '英国-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-slate-600 to-blue-800',
    description: '英国节点故障转移',
    proxies: ['英国-手动', '英国-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-uk-manual',
    name: '英国-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-slate-600 to-blue-800',
    description: '英国节点手动选择',
    proxies: ['🇬🇧 英国 London 01'],
    includeAll: true,
    filter: '(?=.*(英国|英|伦敦|UK|United Kingdom|🇬🇧|London)).*$',
  },
  {
    id: 'grp-uk-auto',
    name: '英国-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-slate-600 to-blue-800',
    description: '英国节点自动测速优选',
    proxies: ['🇬🇧 英国 London 01'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
    filter: '(?=.*(英国|英|伦敦|UK|United Kingdom|🇬🇧|London)).*$',
  },
  // 其他组
  {
    id: 'grp-other-fallback',
    name: '其他-故转',
    type: 'fallback',
    icon: 'RefreshCw',
    color: 'from-zinc-600 to-stone-700',
    description: '其他地区故障转移',
    proxies: ['其他-手动', '其他-自动'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
  },
  {
    id: 'grp-other-manual',
    name: '其他-手动',
    type: 'select',
    icon: 'Layers',
    color: 'from-zinc-600 to-stone-700',
    description: '其他地区手动选择',
    proxies: ['直连', '拒绝'],
    includeAll: true,
  },
  {
    id: 'grp-other-auto',
    name: '其他-自动',
    type: 'url-test',
    icon: 'Zap',
    color: 'from-zinc-600 to-stone-700',
    description: '其他地区自动测速优选',
    proxies: ['直连'],
    url: 'https://www.gstatic.com/generate_204',
    interval: 300,
    tolerance: 50,
    includeAll: true,
  },
];

/**
 * 完整真实规则集 (按 clash-fallback-all.yaml 真实优先级顺序排列)
 */
export const FALLBACK_ALL_RULES: TrafficRule[] = [
  { id: 'rule-test', type: 'RULE-SET', payload: 'TEST / Domain', targetGroup: 'Test', enabled: true, comment: '连通性自检' },
  { id: 'rule-block', type: 'RULE-SET', payload: 'Block / Domain', targetGroup: 'Block', enabled: true, comment: '广告过滤' },
  { id: 'rule-chatgpt', type: 'RULE-SET', payload: 'ChatGPT / Domain', targetGroup: 'ChatGPT', enabled: true, comment: 'OpenAI 服务' },
  { id: 'rule-claude', type: 'RULE-SET', payload: 'Claude / Domain', targetGroup: 'Claude', enabled: true, comment: 'Anthropic Claude' },
  { id: 'rule-meta-ai', type: 'RULE-SET', payload: 'Meta AI / Domain', targetGroup: 'Meta AI', enabled: true, comment: 'Meta AI 平台' },
  { id: 'rule-perplexity', type: 'RULE-SET', payload: 'Perplexity / Domain', targetGroup: 'Perplexity', enabled: true, comment: 'Perplexity 智能搜索' },
  { id: 'rule-copilot', type: 'RULE-SET', payload: 'Copilot / Domain', targetGroup: 'Copilot', enabled: true, comment: 'Copilot 代码助手' },
  { id: 'rule-gemini', type: 'RULE-SET', payload: 'Gemini / Domain', targetGroup: 'Gemini', enabled: true, comment: 'Google Gemini' },
  { id: 'rule-groq', type: 'RULE-SET', payload: 'Groq / Domain', targetGroup: 'Groq', enabled: true, comment: 'Groq 极速推理' },
  { id: 'rule-grok', type: 'RULE-SET', payload: 'Grok / Domain', targetGroup: 'Grok', enabled: true, comment: 'xAI Grok' },
  { id: 'rule-reddit', type: 'RULE-SET', payload: 'Reddit / Domain', targetGroup: 'Reddit', enabled: true, comment: 'Reddit 社区' },
  { id: 'rule-github', type: 'RULE-SET', payload: 'GitHub / Domain', targetGroup: 'GitHub', enabled: true, comment: 'GitHub 开发者' },
  { id: 'rule-telegram-dom', type: 'RULE-SET', payload: 'Telegram / Domain', targetGroup: 'Telegram', enabled: true, comment: 'Telegram 域名' },
  { id: 'rule-telegram-ip', type: 'RULE-SET', payload: 'Telegram / IP', targetGroup: 'Telegram', enabled: true, comment: 'Telegram 网段' },
  { id: 'rule-whatsapp', type: 'RULE-SET', payload: 'WhatsApp / Domain', targetGroup: 'WhatsApp', enabled: true, comment: 'WhatsApp 域名' },
  { id: 'rule-facebook', type: 'RULE-SET', payload: 'Facebook / Domain', targetGroup: 'Facebook', enabled: true, comment: 'Meta / Facebook' },
  { id: 'rule-apple-dom', type: 'RULE-SET', payload: 'Apple / Domain', targetGroup: 'Apple', enabled: true, comment: 'Apple 全球服务' },
  { id: 'rule-apple-cn', type: 'RULE-SET', payload: 'Apple-CN / Domain', targetGroup: 'Apple', enabled: true, comment: 'Apple 大陆服务' },
  { id: 'rule-apple-custom', type: 'RULE-SET', payload: 'Apple-Custome / Domain', targetGroup: 'Apple', enabled: true, comment: 'Apple 自定义分流' },
  { id: 'rule-microsoft', type: 'RULE-SET', payload: 'Microsoft / Domain', targetGroup: 'Microsoft', enabled: true, comment: '微软服务与 Office' },
  { id: 'rule-okx', type: 'RULE-SET', payload: 'OKX / Domain', targetGroup: 'Crypto', enabled: true, comment: '欧易 OKX' },
  { id: 'rule-bybit', type: 'RULE-SET', payload: 'Bybit / Domain', targetGroup: 'Crypto', enabled: true, comment: 'Bybit 交易所' },
  { id: 'rule-binance', type: 'RULE-SET', payload: 'Binance / Domain', targetGroup: 'Crypto', enabled: true, comment: '币安 Binance' },
  { id: 'rule-bilibili', type: 'RULE-SET', payload: 'BiliBili / Domain', targetGroup: 'BiliBili', enabled: true, comment: '哔哩哔哩' },
  { id: 'rule-youtube', type: 'RULE-SET', payload: 'Youtube / Domain', targetGroup: 'YouTube', enabled: true, comment: 'YouTube 视频' },
  { id: 'rule-tiktok', type: 'RULE-SET', payload: 'TikTok / Domain', targetGroup: 'TikTok', enabled: true, comment: 'TikTok 海外版' },
  { id: 'rule-netflix-dom', type: 'RULE-SET', payload: 'Netflix / Domain', targetGroup: 'Netflix', enabled: true, comment: 'Netflix 域名' },
  { id: 'rule-netflix-ip', type: 'RULE-SET', payload: 'Netflix / IP', targetGroup: 'Netflix', noResolve: true, enabled: true, comment: 'Netflix IP' },
  { id: 'rule-disney', type: 'RULE-SET', payload: 'Disney / Domain', targetGroup: 'Disney', enabled: true, comment: 'Disney+ 流媒体' },
  { id: 'rule-amazon', type: 'RULE-SET', payload: 'Amazon / Domain', targetGroup: 'Amazon', enabled: true, comment: 'Amazon Prime' },
  { id: 'rule-crunchyroll', type: 'RULE-SET', payload: 'Crunchyroll / Domain', targetGroup: 'Crunchyroll', enabled: true, comment: 'Crunchyroll 动漫' },
  { id: 'rule-popcorn', type: 'RULE-SET', payload: 'Popcorn / Domain', targetGroup: 'Popcorn', enabled: true, comment: 'Popcorn 影视' },
  { id: 'rule-hbo', type: 'RULE-SET', payload: 'HBO / Domain', targetGroup: 'HBO', enabled: true, comment: 'HBO Max' },
  { id: 'rule-spotify', type: 'RULE-SET', payload: 'Spotify / Domain', targetGroup: 'Spotify', enabled: true, comment: 'Spotify 音乐' },
  { id: 'rule-steam', type: 'RULE-SET', payload: 'Steam / Domain', targetGroup: 'Steam', enabled: true, comment: 'Steam 游戏平台' },
  { id: 'rule-epic', type: 'RULE-SET', payload: 'Epic / Domain', targetGroup: 'Games', enabled: true, comment: 'Epic 游戏' },
  { id: 'rule-ea', type: 'RULE-SET', payload: 'EA / Domain', targetGroup: 'Games', enabled: true, comment: 'EA 游戏' },
  { id: 'rule-blizzard', type: 'RULE-SET', payload: 'Blizzard / Domain', targetGroup: 'Games', enabled: true, comment: '暴雪战网' },
  { id: 'rule-ubi', type: 'RULE-SET', payload: 'UBI / Domain', targetGroup: 'Games', enabled: true, comment: '育碧 Uplay' },
  { id: 'rule-playstation', type: 'RULE-SET', payload: 'PlayStation / Domain', targetGroup: 'Games', enabled: true, comment: '索尼 PSN' },
  { id: 'rule-nintendo', type: 'RULE-SET', payload: 'Nintend / Domain', targetGroup: 'Games', enabled: true, comment: '任天堂' },
  { id: 'rule-google-dom', type: 'RULE-SET', payload: 'Google / Domain', targetGroup: 'Google', enabled: true, comment: 'Google 域名' },
  { id: 'rule-google-ip', type: 'RULE-SET', payload: 'Google / IP', targetGroup: 'Google', noResolve: true, enabled: true, comment: 'Google IP' },
  { id: 'rule-nvidia', type: 'RULE-SET', payload: 'Nvidia / Domain', targetGroup: 'Nvidia', enabled: true, comment: 'Nvidia 服务' },
  { id: 'rule-telegram-foreign-ip', type: 'RULE-SET', payload: 'Telegram / IP', targetGroup: '国外', enabled: true, comment: 'Telegram 境外兜底' },
  { id: 'rule-telegram-foreign-dom', type: 'RULE-SET', payload: 'Telegram / Domain', targetGroup: '国外', enabled: true, comment: 'Telegram 境外兜底' },
  { id: 'rule-proxy-foreign', type: 'RULE-SET', payload: 'Proxy / Domain', targetGroup: '国外', enabled: true, comment: '常见代理域名' },
  { id: 'rule-globe-foreign', type: 'RULE-SET', payload: 'Globe / Domain', targetGroup: '国外', enabled: true, comment: '全球通用代理列表' },
  { id: 'rule-direct-dom', type: 'RULE-SET', payload: 'Direct / Domain', targetGroup: '国内', enabled: true, comment: '国内直连域名' },
  { id: 'rule-china-dom', type: 'RULE-SET', payload: 'China / Domain', targetGroup: '国内', enabled: true, comment: 'China 域名' },
  { id: 'rule-china-ip', type: 'RULE-SET', payload: 'China / IP', targetGroup: '国内', noResolve: true, enabled: true, comment: 'China IP 段' },
  { id: 'rule-private-dom', type: 'RULE-SET', payload: 'Private / Domain', targetGroup: '国内', enabled: true, comment: '局域网与私有 IP' },
  { id: 'rule-match-other', type: 'MATCH', payload: '', targetGroup: '其他', enabled: true, comment: '最终漏网之鱼流量兜底' },
];

export const FALLBACK_ALL_SOURCE_URL =
  'https://raw.githubusercontent.com/liandu2024/little/c702d82fd0fdc7315c7edd23518424c0a8d6c6c7/yaml/clash-fallback-all.yaml';

export const RAW_FALLBACK_ALL_YAML_SAMPLE = `
proxies:
  - name: "🇭🇰 香港 IPLC 专线 01"
    type: ss
    server: hk01.iplc-relay.net
    port: 8388
    cipher: aes-256-gcm
    password: sample-password
  - name: "🇯🇵 日本 Tokyo 01"
    type: ss
    server: jp01.tokyo-cloud.org
    port: 8388
    cipher: aes-256-gcm
    password: sample-password
  - name: "🇸🇬 新加坡 SG 01"
    type: ss
    server: sg01.aws-direct.net
    port: 8388
    cipher: aes-256-gcm
    password: sample-password
  - name: "🇺🇸 美国 Silicon Valley 01"
    type: ss
    server: us01.silicon-valley.com
    port: 8388
    cipher: aes-256-gcm
    password: sample-password

proxy-groups:
  - name: ChatGPT
    type: select
    proxies:
      - 🇭🇰 香港 IPLC 专线 01
      - 🇯🇵 日本 Tokyo 01
      - 🇺🇸 美国 Silicon Valley 01
  - name: Gemini
    type: select
    proxies:
      - 🇯🇵 日本 Tokyo 01
      - 🇺🇸 美国 Silicon Valley 01
  - name: Claude
    type: select
    proxies:
      - 🇺🇸 美国 Silicon Valley 01
  - name: YouTube
    type: select
    proxies:
      - 🇭🇰 香港 IPLC 专线 01
      - 🇸🇬 新加坡 SG 01
  - name: 国外
    type: select
    proxies:
      - 🇭🇰 香港 IPLC 专线 01
      - 🇯🇵 日本 Tokyo 01
  - name: 国内
    type: select
    proxies:
      - DIRECT
  - name: 其他
    type: select
    proxies:
      - 🇭🇰 香港 IPLC 专线 01

rules:
  - RULE-SET,ChatGPT / Domain,ChatGPT
  - RULE-SET,Gemini / Domain,Gemini
  - RULE-SET,Claude / Domain,Claude
  - RULE-SET,YouTube / Domain,YouTube
  - RULE-SET,Telegram / IP,国外
  - RULE-SET,Proxy / Domain,国外
  - RULE-SET,Direct / Domain,国内
  - RULE-SET,China / IP,国内,no-resolve
  - MATCH,其他
`;

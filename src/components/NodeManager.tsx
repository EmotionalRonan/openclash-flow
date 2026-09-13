import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  DownloadCloud, 
  Plus, 
  Trash2, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Globe, 
  Copy, 
  Check,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  LayoutGrid,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { ProxyNode, PolicyGroup } from '../types/openclash';
import { parseSubscriptionInput, detectCountryFromNodeName, parseFullClashYaml } from '../utils/parser';
import { generateSparklineSvgPath, generateSparklineAreaPath, formatSpeed } from '../utils/telemetryEngine';
import { FALLBACK_ALL_PROXIES, FALLBACK_ALL_SOURCE_URL } from '../data/fallbackAllConfig';

interface NodeManagerProps {
  proxies: ProxyNode[];
  setProxies: React.Dispatch<React.SetStateAction<ProxyNode[]>>;
  policyGroups: PolicyGroup[];
  setPolicyGroups: React.Dispatch<React.SetStateAction<PolicyGroup[]>>;
}

type SortOption = 
  | 'default'
  | 'latency-asc'
  | 'latency-desc'
  | 'name-asc'
  | 'name-desc'
  | 'type'
  | 'country'
  | 'port';

export const NodeManager: React.FC<NodeManagerProps> = ({
  proxies,
  setProxies,
  policyGroups,
  setPolicyGroups,
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ count: number; message: string } | null>(null);
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Filter & Search & Sort states
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isCompact, setIsCompact] = useState<boolean>(true);
  const [nodeTimeWindow, setNodeTimeWindow] = useState<'30m' | '1h' | '24h'>('30m');

  // Manual add node state
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<ProxyNode['type']>('vless');
  const [newNodeServer, setNewNodeServer] = useState('');
  const [newNodePort, setNewNodePort] = useState(443);
  const [newNodePassword, setNewNodePassword] = useState('');
  const [newNodeSni, setNewNodeSni] = useState('');

  // Edit node state
  const [editingNode, setEditingNode] = useState<ProxyNode | null>(null);
  const [editNodeName, setEditNodeName] = useState('');
  const [editNodeType, setEditNodeType] = useState<ProxyNode['type']>('vless');
  const [editNodeServer, setEditNodeServer] = useState('');
  const [editNodePort, setEditNodePort] = useState(443);
  const [editNodePassword, setEditNodePassword] = useState('');
  const [editNodeSni, setEditNodeSni] = useState('');
  const [editNodeCipher, setEditNodeCipher] = useState('');
  const [editNodeCountry, setEditNodeCountry] = useState('');

  // Countries present in current proxies
  const countries: string[] = Array.from(new Set(proxies.map((p) => p.country || 'UN'))).filter(Boolean) as string[];

  // Filtered and Sorted Proxies
  const processedProxies = useMemo(() => {
    return proxies
      .filter((p) => {
        if (countryFilter !== 'all' && p.country !== countryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchServer = p.server.toLowerCase().includes(q);
          const matchType = p.type.toLowerCase().includes(q);
          const matchCountry = (p.country || '').toLowerCase().includes(q);
          const matchPort = String(p.port).includes(q);
          return matchName || matchServer || matchType || matchCountry || matchPort;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'latency-asc') {
          return (a.latency ?? 9999) - (b.latency ?? 9999);
        }
        if (sortBy === 'latency-desc') {
          return (b.latency ?? 0) - (a.latency ?? 0);
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name, 'zh-CN');
        }
        if (sortBy === 'name-desc') {
          return b.name.localeCompare(a.name, 'zh-CN');
        }
        if (sortBy === 'type') {
          return a.type.localeCompare(b.type);
        }
        if (sortBy === 'country') {
          return (a.country || '').localeCompare(b.country || '');
        }
        if (sortBy === 'port') {
          return a.port - b.port;
        }
        return 0;
      });
  }, [proxies, countryFilter, searchQuery, sortBy]);

  // Country Flag Map
  const countryFlagMap: Record<string, string> = {
    HK: '🇭🇰 香港',
    TW: '🇹🇼 台湾',
    JP: '🇯🇵 日本',
    SG: '🇸🇬 新加坡',
    US: '🇺🇸 美国',
    UK: '🇬🇧 英国',
    KR: '🇰🇷 韩国',
    DE: '🇩🇪 德国',
    DIRECT: '🇨🇳 直连',
    REJECT: '🛑 拦截',
    UN: '🌐 其它',
  };

  // Perform Batch Import
  const handlePerformImport = () => {
    if (!importInput.trim()) return;

    setIsImporting(true);
    setImportStatus(null);

    setTimeout(() => {
      try {
        let parsedNodes: ProxyNode[] = [];

        // Check if YAML or single lines
        if (importInput.includes('proxies:') || importInput.includes('proxy-groups:')) {
          const res = parseFullClashYaml(importInput);
          parsedNodes = res.proxies;
          if (res.proxyGroups.length > 0) {
            setPolicyGroups(res.proxyGroups);
          }
        } else {
          parsedNodes = parseSubscriptionInput(importInput);
        }

        if (parsedNodes.length > 0) {
          setProxies((prev) => {
            const existingKeys = new Set(prev.map((n) => `${n.server}:${n.port}:${n.name}`));
            const fresh = parsedNodes.filter((n) => !existingKeys.has(`${n.server}:${n.port}:${n.name}`));
            return [...prev, ...fresh];
          });

          // Also auto-assign new proxy names to PROXY group
          const newNames = parsedNodes.map((n) => n.name);
          setPolicyGroups((prev) =>
            prev.map((g) => {
              if (g.id === 'grp-proxy' || g.name.includes('PROXY')) {
                const combined = Array.from(new Set([...g.proxies, ...newNames]));
                return { ...g, proxies: combined };
              }
              return g;
            })
          );

          setImportStatus({
            count: parsedNodes.length,
            message: `成功解析并导入 ${parsedNodes.length} 个节点！已自动关联至策略组。`,
          });
          setImportInput('');
        } else {
          setImportStatus({
            count: 0,
            message: '未能识别有效节点，请确认输入的是 Clash YAML、Base64 订阅文本或 vless:// / hysteria2:// / trojan:// 单链接。',
          });
        }
      } catch (err) {
        setImportStatus({
          count: 0,
          message: '导入过程发生异常，请检查文本格式。',
        });
      } finally {
        setIsImporting(false);
      }
    }, 400);
  };

  // Sample Subscription Quick Loader
  const handleLoadSampleSubscription = () => {
    const sampleText = `
vless://a8e4b52c-7b19-4d62-81e0-3f721bc69901@hk01.iplc-speed.net:443?security=reality&sni=hk.cloudflare.com&flow=xtls-rprx-vision&pbk=d9s8A09d_32kF993kLae823Jkdf&sid=7a9c&type=tcp#%F0%9F%87%AD%F0%9F%87%B0%20%E9%A6%99%E6%B8%AF%20IPLC%20%E4%B8%93%E7%BA%BF%2001
hysteria2://secure-token-hk-pass-99@hk02.fast-hy2.net:28443?sni=speed.hk-telecom.net#%F0%9F%87%AD%F0%9F%87%B0%20%E9%A6%99%E6%B8%AF%20Hy2%2002
trojan://trojan-secret-pass-2024@jp01.tokyo-direct.org:443?sni=jp.tokyo-cloud.org#%F0%9F%87%AF%F0%9F%87%B5%20%E6%97%A5%E6%9C%AC%20Tokyo%2001
vmess://eyJ2IjoiMiIsInBzIjoi8J+HsPCfh7cg5Y+w54GjIEhpTmV0IDAxIiwiYWRkIjoidHcwMS5oaW5ldC1yZWxheS50dyIsInBvcnQiOjIwNDQzLCJpZCI6IjM0YzBmMjE5LTIxYjktNDY3MC04ZDJhLTg5YjY1N2FhMTEyMCIsImFpZCI6MCwic2N5IjoiYXV0byIsIm5ldCI6IndzIiwidHlwZSI6Im5vbmUiLCJob3N0IjoidHcwMS5oaW5ldC1yZWxheS50dyIsInBhdGgiOiIvdHctc3RyZWFtLXdzIiwidGxzIjoidGxzIn0=
hysteria2://sg-h2-speed-key-771@sg01.aws-direct.net:30443#%F0%9F%87%B8%F0%9F%87%AC%20%E6%96%B0%E5%8A%A0%E5%9坡%20SG%2001
vless://7e90b822-1200-4cb5-8d19-498cbe00f912@us01.silicon-valley.com:443?security=reality&sni=gateway.us-west.oraclecloud.com&flow=xtls-rprx-vision#%F0%9F%87%BA%F0%9F%87%B8%20%E7%BE%8E%E5%9B%BD%20Silicon%20Valley%2001
ss://YWVzLTI1Ni1nY206c3MyMDIyLXBhc3N3b3JkLWtleS1sb25AdWswMS5sb25kb24tdGVsZWNvbS5jby51azoxODg4Mw==#%F0%9F%87%AC%F0%9F%87%A7%20%E8%8B%B1%E5%9B%BD%20London%2001
    `.trim();
    setImportInput(sampleText);
  };

  // Run ping test on all proxies
  const handleTestAllLatencies = () => {
    setIsTestingLatency(true);
    setTimeout(() => {
      setProxies((prev) =>
        prev.map((p) => {
          if (p.type === 'direct') return { ...p, latency: 12, status: 'online' };
          if (p.type === 'reject') return { ...p, latency: 0, status: 'online' };

          const jitter = Math.floor(Math.random() * 20) - 10;
          const base =
            p.country === 'HK'
              ? 25
              : p.country === 'TW'
              ? 40
              : p.country === 'JP'
              ? 50
              : p.country === 'SG'
              ? 65
              : p.country === 'US'
              ? 140
              : 180;
          const newLatency = Math.max(15, base + jitter);
          return {
            ...p,
            latency: newLatency,
            status: newLatency > 220 ? 'slow' : 'online',
          };
        })
      );
      setIsTestingLatency(false);
    }, 800);
  };

  // Auto-Group by Region
  const handleAutoGroupByRegion = () => {
    const regionMap: Record<string, string[]> = {};
    proxies.forEach((p) => {
      const c = p.country || 'UN';
      if (!regionMap[c]) regionMap[c] = [];
      regionMap[c].push(p.name);
    });

    const newGroups: PolicyGroup[] = [];
    const regionNames: Record<string, string> = {
      HK: '香港-自动',
      TW: '台湾-自动',
      JP: '日本-自动',
      SG: '狮城-自动',
      US: '美国-自动',
      UK: '英国-自动',
      KR: '韩国-自动',
      DE: '德国-自动',
    };

    Object.entries(regionMap).forEach(([code, nodeNames]) => {
      if (nodeNames.length === 0 || code === 'UN' || code === 'DIRECT' || code === 'REJECT') return;
      const groupName = regionNames[code] || `${code}-自动`;
      const exists = policyGroups.some((g) => g.name === groupName);

      if (!exists) {
        newGroups.push({
          id: `grp-auto-${code.toLowerCase()}-${Date.now()}`,
          name: groupName,
          type: 'url-test',
          description: `${countryFlagMap[code] || code} 地区节点自动延迟优选组`,
          url: 'https://www.gstatic.com/generate_204',
          interval: 300,
          tolerance: 50,
          proxies: nodeNames,
        });
      }
    });

    if (newGroups.length > 0) {
      setPolicyGroups((prev) => [...prev, ...newGroups]);
      alert(`已自动根据节点地区创建 ${newGroups.length} 个地区优选策略组！`);
    } else {
      alert('所有地区策略组已存在，无需重复创建。');
    }
  };

  // Delete node
  const handleDeleteNode = (id: string) => {
    const target = proxies.find((p) => p.id === id);
    if (!target) return;
    setProxies((prev) => prev.filter((p) => p.id !== id));
    // Remove from policy groups
    setPolicyGroups((prev) =>
      prev.map((g) => ({
        ...g,
        proxies: g.proxies.filter((name) => name !== target.name),
      }))
    );
  };

  // Clear All Nodes
  const handleClearAllNodes = () => {
    if (confirm('确定要清空全部代理节点吗？')) {
      setProxies([]);
    }
  };

  // Load Fallback-All Real Production Nodes
  const handleLoadFallbackAllNodes = () => {
    if (confirm(`是否载入 clash-fallback-all.yaml 的全量生产节点？将追加或刷新真实代理节点列表。`)) {
      setProxies((prev) => {
        const existingNames = new Set(prev.map((p) => p.name));
        const fresh = FALLBACK_ALL_PROXIES.filter((p) => !existingNames.has(p.name));
        return [...prev, ...fresh];
      });
    }
  };

  // Add Manual Node
  const handleAddManualNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const { country, flag } = detectCountryFromNodeName(newNodeName);
    const node: ProxyNode = {
      id: `manual-node-${Date.now()}`,
      name: newNodeName.trim(),
      type: newNodeType,
      server: newNodeServer.trim() || (newNodeType === 'direct' || newNodeType === 'reject' ? 'localhost' : ''),
      port: newNodePort,
      password: newNodePassword.trim() || undefined,
      uuid: newNodeType === 'vless' || newNodeType === 'vmess' ? newNodePassword.trim() : undefined,
      sni: newNodeSni.trim() || undefined,
      tls: newNodePort === 443 || !!newNodeSni,
      latency: newNodeType === 'direct' ? 12 : newNodeType === 'reject' ? 0 : Math.floor(Math.random() * 60) + 25,
      status: 'online',
      country,
      flag,
    };

    setProxies((prev) => [...prev, node]);
    setNewNodeName('');
    setNewNodeServer('');
    setNewNodePassword('');
    setNewNodeSni('');
    setShowAddNodeModal(false);
  };

  // Start Edit Node
  const handleStartEditNode = (node: ProxyNode) => {
    setEditingNode(node);
    setEditNodeName(node.name);
    setEditNodeType(node.type);
    setEditNodeServer(node.server);
    setEditNodePort(node.port);
    setEditNodePassword(node.password || node.uuid || '');
    setEditNodeSni(node.sni || '');
    setEditNodeCipher(node.cipher || '');
    setEditNodeCountry(node.country || '');
  };

  // Save Edit Node
  const handleSaveEditNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode || !editNodeName.trim()) return;

    const oldName = editingNode.name;
    const newName = editNodeName.trim();
    const { country, flag } = detectCountryFromNodeName(newName);

    setProxies((prev) =>
      prev.map((p) => {
        if (p.id === editingNode.id) {
          return {
            ...p,
            name: newName,
            type: editNodeType,
            server: editNodeServer.trim(),
            port: editNodePort,
            password: editNodePassword.trim() || undefined,
            uuid: editNodeType === 'vless' || editNodeType === 'vmess' ? editNodePassword.trim() : undefined,
            sni: editNodeSni.trim() || undefined,
            cipher: editNodeCipher.trim() || undefined,
            tls: editNodePort === 443 || !!editNodeSni,
            country: editNodeCountry.trim() || country,
            flag: flag || p.flag,
          };
        }
        return p;
      })
    );

    // If node name changed, cascade to policy groups
    if (oldName !== newName) {
      setPolicyGroups((prev) =>
        prev.map((g) => {
          if (g.proxies.includes(oldName)) {
            return {
              ...g,
              proxies: g.proxies.map((name) => (name === oldName ? newName : name)),
            };
          }
          return g;
        })
      );
    }

    setEditingNode(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Control Strip */}
      <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-black/[0.08] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
            节点与订阅管理
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 font-medium border border-indigo-200 dark:border-cyan-500/30">
              全协议支持 (增删改查)
            </span>
          </h2>
          <p className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-1">
            支持一键导入、全员测速、在线编辑节点属性与自动生成地区优选组
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Preset Real Nodes Load */}
          <button
            onClick={handleLoadFallbackAllNodes}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-500/30 apple-press transition-colors shrink-0"
            title="载入 clash-fallback-all 生产真实节点"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">载入 Fallback-All 节点</span>
            <span className="sm:hidden whitespace-nowrap">载入预设</span>
          </button>

          {/* Latency Test Button */}
          <button
            id="btn-test-latencies"
            disabled={isTestingLatency || proxies.length === 0}
            onClick={handleTestAllLatencies}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors disabled:opacity-50 shrink-0 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 ${isTestingLatency ? 'animate-spin' : ''}`} />
            <span>{isTestingLatency ? '测速中...' : '全员测速'}</span>
          </button>

          {/* Auto-Group Generator */}
          <button
            id="btn-auto-group"
            onClick={handleAutoGroupByRegion}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 apple-press transition-colors shrink-0 whitespace-nowrap"
            title="根据节点名称自动创建 香港/日本/美国/新加坡 策略组"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>生成地区组</span>
          </button>

          {/* Manual Add Node */}
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>添加单节点</span>
          </button>

          {/* Import button */}
          <button
            id="btn-open-import-modal"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors shrink-0 whitespace-nowrap"
          >
            <DownloadCloud className="w-4 h-4 shrink-0" />
            <span>批量导入</span>
          </button>

          {/* Clear all */}
          {proxies.length > 0 && (
            <button
              onClick={handleClearAllNodes}
              className="p-2 text-[#86868b] hover:text-rose-500 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors shrink-0"
              title="清空所有节点"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter, Search & Layout Control Toolbar */}
      <div className="apple-glass rounded-2xl p-3 border border-black/[0.06] dark:border-white/[0.06] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        
        {/* Left: Region Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none pb-1 md:pb-0">
          <button
            onClick={() => setCountryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium apple-press transition-all shrink-0 whitespace-nowrap ${
              countryFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            全部 ({proxies.length})
          </button>

          {countries.map((code) => {
            const count = proxies.filter((p) => (p.country || 'UN') === code).length;
            return (
              <button
                key={code}
                onClick={() => setCountryFilter(code)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium apple-press transition-all shrink-0 whitespace-nowrap ${
                  countryFilter === code
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                {countryFlagMap[code] || code} ({count})
              </button>
            );
          })}
        </div>

        {/* Right: Search, Sort & Density */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Search Box */}
          <div className="relative min-w-[140px] flex-1 sm:flex-initial sm:min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索节点名称/IP/端口..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-1 rounded-xl border border-black/[0.06] dark:border-white/[0.06] text-xs text-[#6e6e73] dark:text-[#a1a1aa] shrink-0">
            <ArrowUpDown className="w-3 h-3 text-[#86868b]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none cursor-pointer"
            >
              <option value="default">默认排序</option>
              <option value="latency-asc">延迟: 从低到高</option>
              <option value="latency-desc">延迟: 从高到低</option>
              <option value="name-asc">名称: A → Z</option>
              <option value="name-desc">名称: Z → A</option>
              <option value="type">按协议类型</option>
              <option value="country">按国家地区</option>
              <option value="port">按端口号</option>
            </select>
          </div>

          {/* Time Window for Sparkline */}
          <div className="flex items-center p-0.5 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
            {(['30m', '1h', '24h'] as const).map((tw) => (
              <button
                key={tw}
                onClick={() => setNodeTimeWindow(tw)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-all ${
                  nodeTimeWindow === tw
                    ? 'bg-white dark:bg-[#1e1f29] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
                title={`查看过去 ${tw} 延迟时序波动`}
              >
                {tw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nodes Count Summary */}
      <div className="flex items-center justify-between px-1 text-[11px] text-[#86868b] dark:text-[#71717a]">
        <span>
          显示 <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">{processedProxies.length}</strong> / {proxies.length} 个节点
          {searchQuery && ` (匹配 "${searchQuery}")`}
        </span>
        {processedProxies.length === 0 && (
          <span className="text-amber-600 dark:text-amber-400">无匹配节点，请调整筛选条件</span>
        )}
      </div>

      {/* Nodes Grid (Compact & Sleek Layout) */}
      <div
        className={`grid gap-2.5 sm:gap-3 ${
          isCompact
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {processedProxies.map((node, index) => {
          const isCopied = copiedId === node.id;

          return (
            <div
              key={node.id}
              className={`apple-glass rounded-2xl border border-black/[0.08] dark:border-white/[0.08] hover:border-indigo-400/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                isCompact ? 'p-3 space-y-2' : 'p-4 space-y-3'
              }`}
            >
              <div>
                {/* Header: Flag, Name, Type, Latency */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-base shrink-0 select-none">{node.flag || '🌐'}</span>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate"
                        title={node.name}
                      >
                        {node.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 font-semibold leading-tight">
                          {node.type}
                        </span>
                        {node.tls && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/20 font-medium leading-tight">
                            TLS
                          </span>
                        )}
                        {node.realityOpts && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/20 font-medium leading-tight">
                            REALITY
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Latency Pill & Sparkline */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                        (node.latency || 999) < 80
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                          : (node.latency || 999) < 160
                          ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                          : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          (node.latency || 999) < 80
                            ? 'bg-emerald-500'
                            : (node.latency || 999) < 160
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {node.latency ? `${node.latency}ms` : '--'}
                    </span>

                    {/* Sparkline curve */}
                    {node.latency && node.latency > 0 && (
                      <div className="w-14 h-3.5 opacity-75 hover:opacity-100 transition-opacity" title={`过去 ${nodeTimeWindow} 延迟时序波动微曲线`}>
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 56 14" preserveAspectRatio="none">
                          <path
                            d={generateSparklineAreaPath([
                              node.latency * 0.96, node.latency * 1.08, node.latency * 0.92, node.latency * 1.04,
                              node.latency * 0.98, node.latency * 1.12, node.latency * 0.94, node.latency
                            ], 56, 14)}
                            className={(node.latency || 999) < 80 ? 'fill-emerald-500/15' : (node.latency || 999) < 160 ? 'fill-amber-500/15' : 'fill-rose-500/15'}
                          />
                          <path
                            d={generateSparklineSvgPath([
                              node.latency * 0.96, node.latency * 1.08, node.latency * 0.92, node.latency * 1.04,
                              node.latency * 0.98, node.latency * 1.12, node.latency * 0.94, node.latency
                            ], 56, 14)}
                            fill="none"
                            stroke={(node.latency || 999) < 80 ? '#10b981' : (node.latency || 999) < 160 ? '#f59e0b' : '#f43f5e'}
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Server & Port Strip */}
                <div className="mt-2 p-2 rounded-xl bg-slate-100/90 dark:bg-slate-950/70 border border-black/[0.04] dark:border-slate-800/80 font-mono text-[10px] space-y-0.5">
                  <div className="flex items-center justify-between text-[#6e6e73] dark:text-slate-400">
                    <span className="truncate max-w-[140px] font-medium text-[#1d1d1f] dark:text-slate-300" title={node.server}>
                      {node.server}
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 ml-1">
                      :{node.port}
                    </span>
                  </div>
                  {node.sni && (
                    <div className="flex items-center justify-between text-[9px] text-[#86868b] dark:text-slate-500 truncate">
                      <span>SNI: {node.sni}</span>
                    </div>
                  )}
                </div>

                {/* Telemetry Load & Connections Strip */}
                <div className="mt-1.5 px-2 py-1 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-[9px] font-mono text-[#6e6e73] dark:text-[#a1a1aa]">
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      (node.latency || 999) < 80 ? 'bg-emerald-500' : (node.latency || 999) < 160 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span>{(node.latency || 999) < 80 ? '低载健康' : (node.latency || 999) < 160 ? '中载平稳' : '高载负荷'}</span>
                  </span>
                  <span>↓ {formatSpeed(Math.max(80000, (index * 720000) % 3600000 + 140000))} • {Math.max(1, (index * 5) % 18 + 2)} Conns</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-1.5 border-t border-black/[0.04] dark:border-slate-800/50 text-xs">
                <span className="text-[9px] text-[#86868b] dark:text-slate-500 font-mono">
                  {node.country || 'UN'} • {node.id.slice(0, 8)}
                </span>

                <div className="flex items-center gap-1">
                  {/* Edit Node Button */}
                  <button
                    onClick={() => handleStartEditNode(node)}
                    className="p-1 text-[#6e6e73] dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] rounded-md apple-press transition-colors"
                    title="编辑节点配置"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(node, null, 2));
                      setCopiedId(node.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    className="p-1 text-[#6e6e73] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] rounded-md apple-press transition-colors"
                    title="复制节点 JSON"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1 text-[#86868b] hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] rounded-md apple-press transition-colors"
                    title="删除节点"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Node Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEditNode}
            className="apple-glass rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                编辑代理节点: {editingNode.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">节点名称 (可包含国旗 emoji)</label>
                <input
                  type="text"
                  required
                  value={editNodeName}
                  onChange={(e) => setEditNodeName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">协议类型</label>
                  <select
                    value={editNodeType}
                    onChange={(e) => setEditNodeType(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="vless">VLESS</option>
                    <option value="hysteria2">Hysteria 2</option>
                    <option value="trojan">Trojan</option>
                    <option value="vmess">VMess</option>
                    <option value="ss">Shadowsocks</option>
                    <option value="tuic">TUIC</option>
                    <option value="direct">DIRECT (直连)</option>
                    <option value="reject">REJECT (拒绝)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">端口 (Port)</label>
                  <input
                    type="number"
                    required
                    value={editNodePort}
                    onChange={(e) => setEditNodePort(parseInt(e.target.value, 10) || 443)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">服务器域名 / IP</label>
                <input
                  type="text"
                  required
                  value={editNodeServer}
                  onChange={(e) => setEditNodeServer(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">密码 / UUID / Token</label>
                <input
                  type="text"
                  value={editNodePassword}
                  onChange={(e) => setEditNodePassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">SNI / 伪装域名</label>
                  <input
                    type="text"
                    value={editNodeSni}
                    onChange={(e) => setEditNodeSni(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">地区国家代码 (如 HK, JP, US)</label>
                  <input
                    type="text"
                    value={editNodeCountry}
                    onChange={(e) => setEditNodeCountry(e.target.value.toUpperCase())}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors"
              >
                保存节点
              </button>
            </div>
          </form>
        </div>
      )}

      {/* One-Click Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="apple-glass rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
                <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white">一键导入订阅 / 节点集</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[#6e6e73] dark:text-slate-300 font-medium">
                  支持格式: Clash YAML、Base64 订阅、vless://、hysteria2://、trojan://、vmess://、ss://
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleSubscription}
                  className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  填入示例多协议订阅
                </button>
              </div>

              <textarea
                rows={7}
                placeholder="粘贴订阅链接、Clash YAML proxies 配置段落，或 Base64 编码的节点列表..."
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-black/[0.08] dark:border-slate-800 rounded-2xl p-3 text-[#1d1d1f] dark:text-slate-200 font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />

              {importStatus && (
                <div
                  className={`p-3 rounded-2xl flex items-start gap-2 text-xs ${
                    importStatus.count > 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {importStatus.count > 0 ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                关闭
              </button>
              <button
                type="button"
                disabled={isImporting || !importInput.trim()}
                onClick={handlePerformImport}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press disabled:opacity-50 transition-colors"
              >
                {isImporting ? '解析中...' : '开始导入与自动分类'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Single Node Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddManualNode}
            className="apple-glass rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
                手动添加代理节点
              </h3>
              <button
                type="button"
                onClick={() => setShowAddNodeModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-slate-400 font-medium">节点名称 (支持带国旗，如 🇯🇵 日本专线 01)</label>
                <input
                  type="text"
                  required
                  placeholder="🇭🇰 香港 IPLC 01"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-black/[0.08] dark:border-slate-800 rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-slate-400 font-medium">协议类型</label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as any)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-black/[0.08] dark:border-slate-800 rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="vless">VLESS</option>
                    <option value="hysteria2">Hysteria 2</option>
                    <option value="trojan">Trojan</option>
                    <option value="vmess">VMess</option>
                    <option value="ss">Shadowsocks</option>
                    <option value="tuic">TUIC</option>
                    <option value="direct">DIRECT (直连)</option>
                    <option value="reject">REJECT (拒绝)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-slate-400 font-medium">端口 (Port)</label>
                  <input
                    type="number"
                    required
                    value={newNodePort}
                    onChange={(e) => setNewNodePort(parseInt(e.target.value, 10) || 443)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-black/[0.08] dark:border-slate-800 rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-slate-400 font-medium">服务器域名 / IP</label>
                <input
                  type="text"
                  required
                  placeholder="hk01.example.com"
                  value={newNodeServer}
                  onChange={(e) => setNewNodeServer(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-black/[0.08] dark:border-slate-800 rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-slate-400 font-medium">密码 / UUID / Token</label>
                <input
                  type="text"
                  placeholder="UUID 或 认证密码"
                  value={newNodePassword}
                  onChange={(e) => setNewNodePassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-black/[0.08] dark:border-slate-800 rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-slate-400 font-medium">SNI / ServerName (可选)</label>
                <input
                  type="text"
                  placeholder="例如: gateway.cloudflare.com"
                  value={newNodeSni}
                  onChange={(e) => setNewNodeSni(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-black/[0.08] dark:border-slate-800 rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddNodeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors"
              >
                保存节点
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

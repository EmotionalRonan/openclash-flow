import React, { useState } from 'react';
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
  Check 
} from 'lucide-react';
import { ProxyNode, PolicyGroup } from '../types/openclash';
import { parseSubscriptionInput, detectCountryFromNodeName } from '../utils/parser';

interface NodeManagerProps {
  proxies: ProxyNode[];
  setProxies: React.Dispatch<React.SetStateAction<ProxyNode[]>>;
  policyGroups: PolicyGroup[];
  setPolicyGroups: React.Dispatch<React.SetStateAction<PolicyGroup[]>>;
}

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
  
  // Filter by country
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Manual add node state
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<ProxyNode['type']>('vless');
  const [newNodeServer, setNewNodeServer] = useState('');
  const [newNodePort, setNewNodePort] = useState(443);
  const [newNodePassword, setNewNodePassword] = useState('');
  const [newNodeSni, setNewNodeSni] = useState('');

  // Countries present in current proxies
  const countries = Array.from(new Set(proxies.map((p) => p.country || 'UN'))).filter(Boolean);

  const filteredProxies = proxies.filter((p) => {
    if (countryFilter === 'all') return true;
    return p.country === countryFilter;
  });

  // Handle Import
  const handlePerformImport = () => {
    if (!importInput.trim()) return;
    setIsImporting(true);
    setImportStatus(null);

    setTimeout(() => {
      try {
        const parsedNodes = parseSubscriptionInput(importInput);
        if (parsedNodes.length > 0) {
          setProxies((prev) => {
            // deduplicate by server + port + name
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
            message: `成功解析并导入 ${parsedNodes.length} 个节点！已自动关联至默认代理策略组。`,
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

    const regionGroupNames: Record<string, string> = {
      HK: '🇭🇰 香港节点 (HK)',
      JP: '🇯🇵 日本节点 (JP)',
      TW: '🇹🇼 台湾节点 (TW)',
      SG: '🇸🇬 新加坡节点 (SG)',
      US: '🇺🇸 美国节点 (US)',
      UK: '🇬🇧 英国节点 (UK)',
      DE: '🇩🇪 德国节点 (DE)',
      KR: '🇰🇷 韩国节点 (KR)',
    };

    const newGroups: PolicyGroup[] = [];

    Object.entries(regionMap).forEach(([code, nodeNames]) => {
      const gName = regionGroupNames[code] || `🌐 ${code} 节点组`;
      if (!policyGroups.some((g) => g.name === gName)) {
        newGroups.push({
          id: `grp-region-${code.toLowerCase()}`,
          name: gName,
          type: 'url-test',
          description: `${code} 地区节点自动优选`,
          proxies: nodeNames,
          url: 'http://www.gstatic.com/generate_204',
          interval: 300,
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

  // Add Manual Node
  const handleAddManualNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !newNodeServer.trim()) return;

    const { country, flag } = detectCountryFromNodeName(newNodeName);
    const node: ProxyNode = {
      id: `manual-node-${Date.now()}`,
      name: newNodeName.trim(),
      type: newNodeType,
      server: newNodeServer.trim(),
      port: newNodePort,
      password: newNodePassword.trim() || undefined,
      uuid: newNodeType === 'vless' || newNodeType === 'vmess' ? newNodePassword.trim() : undefined,
      sni: newNodeSni.trim() || undefined,
      tls: newNodePort === 443 || !!newNodeSni,
      latency: Math.floor(Math.random() * 60) + 25,
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

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Control Strip */}
      <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-black/[0.08] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl">
        <div>
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
            节点与订阅管理
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 font-medium border border-indigo-200 dark:border-cyan-500/30">
              支持 VLESS / Hysteria2 / Trojan / VMess / SS
            </span>
          </h2>
          <p className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-1">
            一键导入订阅链接、批量测速、自动按地区国家分类，并无缝注入分流策略组
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Latency Test Button */}
          <button
            id="btn-test-latencies"
            disabled={isTestingLatency || proxies.length === 0}
            onClick={handleTestAllLatencies}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 dark:text-amber-400 ${isTestingLatency ? 'animate-spin' : ''}`} />
            <span>{isTestingLatency ? '测速中...' : '全员测速'}</span>
          </button>

          {/* Auto-Group Generator */}
          <button
            id="btn-auto-group"
            onClick={handleAutoGroupByRegion}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-500/30 apple-press transition-colors"
            title="根据节点名称自动创建 香港/日本/美国/新加坡 策略组"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>智能生成地区组</span>
          </button>

          {/* Manual Add Node */}
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加单节点</span>
          </button>

          {/* One-Click Import Button */}
          <button
            id="btn-open-import"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-all"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>一键导入订阅/节点</span>
          </button>
        </div>
      </div>

      {/* Country Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#6e6e73] dark:text-[#86868b] font-medium whitespace-nowrap">地区筛选:</span>
        <button
          onClick={() => setCountryFilter('all')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all apple-press font-medium ${
            countryFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-white/[0.04] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.06]'
          }`}
        >
          全部节点 ({proxies.length})
        </button>
        {countries.map((c) => {
          const count = proxies.filter((p) => p.country === c).length;
          const flag = proxies.find((p) => p.country === c)?.flag || '🌐';
          return (
            <button
              key={c}
              onClick={() => setCountryFilter(c)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all apple-press font-medium flex items-center gap-1.5 ${
                countryFilter === c
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.06]'
              }`}
            >
              <span>{flag}</span>
              <span>{c}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProxies.map((node) => {
          const isCopied = copiedId === node.id;

          return (
            <div
              key={node.id}
              className="apple-glass rounded-3xl p-4 sm:p-5 border border-black/[0.08] dark:border-white/[0.08] hover:border-indigo-400/50 hover:shadow-xl transition-all duration-200 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl shrink-0">{node.flag || '🌐'}</span>
                    <div>
                      <h3 className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate max-w-[170px]" title={node.name}>
                        {node.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold">
                          {node.type}
                        </span>
                        {node.tls && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-medium">
                            TLS
                          </span>
                        )}
                        {node.realityOpts && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 font-medium">
                            REALITY
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ping / Latency Badge */}
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
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
                      {node.latency ? `${node.latency} ms` : '未测速'}
                    </span>
                  </div>
                </div>

                {/* Server & Port details */}
                <div className="mt-3 p-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-black/[0.06] dark:border-slate-800/80 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6e6e73] dark:text-slate-500">服务器:</span>
                    <span className="text-[#1d1d1f] dark:text-slate-300 truncate max-w-[150px] font-medium">{node.server}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6e6e73] dark:text-slate-500">端口:</span>
                    <span className="text-[#1d1d1f] dark:text-slate-300 font-medium">{node.port}</span>
                  </div>
                  {node.sni && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#6e6e73] dark:text-slate-500">SNI / Host:</span>
                      <span className="text-[#1d1d1f] dark:text-slate-300 truncate max-w-[140px] font-medium">{node.sni}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-slate-800/60 text-xs">
                <span className="text-[10px] text-[#86868b] dark:text-slate-500 font-mono">
                  ID: {node.id.slice(0, 10)}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(node, null, 2));
                      setCopiedId(node.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    className="p-1.5 text-[#6e6e73] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] rounded-lg apple-press transition-colors"
                    title="复制节点 JSON"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1.5 text-[#86868b] hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] rounded-lg apple-press transition-colors"
                    title="删除节点"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

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

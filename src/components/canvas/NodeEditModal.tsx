import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Bot, 
  Film, 
  Gamepad2, 
  Globe, 
  Layers, 
  Radio, 
  Server, 
  Trash2, 
  Sparkles,
  Sliders,
  Power
} from 'lucide-react';
import { CanvasNodeData } from '../../types/canvas';
import { PolicyGroup, ProxyNode, RuleType, PolicyGroupType, ProxyType } from '../../types/openclash';

interface NodeEditModalProps {
  isOpen: boolean;
  node: CanvasNodeData | null;
  policyGroups: PolicyGroup[];
  proxies: ProxyNode[];
  onClose: () => void;
  onSaveNode: (updatedNode: CanvasNodeData) => void;
  onDeleteNode?: (nodeId: string) => void;
}

const RULE_TYPES: RuleType[] = [
  'DOMAIN-SUFFIX',
  'DOMAIN',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'IP-CIDR6',
  'GEOIP',
  'PROCESS-NAME',
  'MATCH',
];

const POLICY_GROUP_TYPES: { type: PolicyGroupType; label: string; desc: string }[] = [
  { type: 'select', label: 'select 手动选择', desc: '用户手动在控制面板中指定出口节点' },
  { type: 'url-test', label: 'url-test 自动测速', desc: '定时 ping 测试，自动选择延迟最低的节点' },
  { type: 'fallback', label: 'fallback 故障转移', desc: '按顺序探测可用性，主节点宕机自动切换到备用' },
  { type: 'load-balance', label: 'load-balance 负载均衡', desc: '多节点轮询或散列分摊带宽流量' },
];

const PROXY_TYPES: ProxyType[] = ['vless', 'vmess', 'ss', 'trojan', 'wireguard', 'hysteria2'];

export const NodeEditModal: React.FC<NodeEditModalProps> = ({
  isOpen,
  node,
  policyGroups,
  proxies,
  onClose,
  onSaveNode,
  onDeleteNode,
}) => {
  if (!isOpen || !node) return null;

  // Form states
  const [title, setTitle] = useState(node.title);
  const [subtitle, setSubtitle] = useState(node.subtitle || '');
  const [enabled, setEnabled] = useState(node.enabled !== false);
  
  // Rule specific
  const [ruleType, setRuleType] = useState<RuleType>(node.ruleType || 'DOMAIN-SUFFIX');
  const [payload, setPayload] = useState(node.payload || '');
  const [targetGroup, setTargetGroup] = useState(node.targetGroup || policyGroups[0]?.name || '🚀 节点选择 (PROXY)');
  
  // Group specific
  const [groupType, setGroupType] = useState<PolicyGroupType>(node.groupType || 'select');
  const [selectedGroupProxies, setSelectedGroupProxies] = useState<string[]>([]);

  // Outbound specific
  const [nodeType, setNodeType] = useState<string>(node.nodeType || 'vless');
  const [latency, setLatency] = useState<number>(node.latency || 50);

  // Sync state on node change
  useEffect(() => {
    if (node) {
      setTitle(node.title);
      setSubtitle(node.subtitle || '');
      setEnabled(node.enabled !== false);
      setRuleType(node.ruleType || 'DOMAIN-SUFFIX');
      setPayload(node.payload || '');
      setTargetGroup(node.targetGroup || policyGroups[0]?.name || '🚀 节点选择 (PROXY)');
      setGroupType(node.groupType || 'select');
      setNodeType(node.nodeType || 'vless');
      setLatency(node.latency || 50);

      if (node.type === 'group' && node.rawId) {
        const found = policyGroups.find((g) => g.id === node.rawId);
        if (found) {
          setSelectedGroupProxies(found.proxies || []);
        }
      }
    }
  }, [node, policyGroups]);

  const handleToggleProxySelection = (proxyName: string) => {
    setSelectedGroupProxies((prev) =>
      prev.includes(proxyName) ? prev.filter((p) => p !== proxyName) : [...prev, proxyName]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedNode: CanvasNodeData = {
      ...node,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      enabled,
      ruleType: node.type === 'rule' || node.type === 'custom-rule' ? ruleType : node.ruleType,
      payload: node.type === 'rule' || node.type === 'custom-rule' ? payload.trim() : node.payload,
      targetGroup: node.type === 'rule' || node.type === 'custom-rule' ? targetGroup : node.targetGroup,
      groupType: node.type === 'group' ? groupType : node.groupType,
      proxyCount: node.type === 'group' ? selectedGroupProxies.length : node.proxyCount,
      nodeType: node.type === 'outbound' ? (nodeType as any) : node.nodeType,
      latency: node.type === 'outbound' ? latency : node.latency,
    };

    onSaveNode(updatedNode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              {node.type === 'inbound' && <Radio className="w-5 h-5" />}
              {(node.type === 'rule' || node.type === 'custom-rule') && <Layers className="w-5 h-5" />}
              {node.type === 'group' && <Sliders className="w-5 h-5" />}
              {node.type === 'outbound' && <Server className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                  编辑画布卡片节点
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium">
                  {node.stepName} (Step {node.step})
                </span>
              </div>
              <p className="text-xs text-[#6e6e73] dark:text-[#86868b] truncate max-w-xs">
                节点 ID: {node.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Card Title */}
          <div>
            <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
              卡片显示名称 / 注释
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl text-sm bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              placeholder="例如：OpenAI / ChatGPT 官方调度"
            />
          </div>

          {/* Subtitle / Note */}
          <div>
            <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
              副标题 / 补充说明
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="例如：域名命中后自动分流"
            />
          </div>

          {/* Enabled Switch */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Power className={`w-4 h-4 ${enabled ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                启用此节点
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* RULE SPECIFIC FIELDS (Step 2) */}
          {(node.type === 'rule' || node.type === 'custom-rule') && (
            <div className="space-y-4 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  OpenClash 流量规则配置 (Traffic Rule)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                    匹配类型 (Type)
                  </label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as RuleType)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {RULE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                    分流策略组 (Target Group)
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {policyGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                    <option value="DIRECT">🇨🇳 DIRECT (直连出口)</option>
                    <option value="REJECT">⛔ REJECT (拦截丢弃)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                  匹配参数 (Payload 域名 / IP / GEOIP)
                </label>
                <input
                  type="text"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  required
                  placeholder="例如: openai.com, 10.0.0.0/8, CN"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* POLICY GROUP SPECIFIC FIELDS (Step 3) */}
          {node.type === 'group' && (
            <div className="space-y-4 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                分流策略组设置 (Policy Group)
              </span>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                  调度机制 (Group Type)
                </label>
                <div className="space-y-1.5">
                  {POLICY_GROUP_TYPES.map((pt) => (
                    <label
                      key={pt.type}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        groupType === pt.type
                          ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/40 text-[#1d1d1f] dark:text-white'
                          : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] text-[#6e6e73] dark:text-[#86868b]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="groupType"
                        value={pt.type}
                        checked={groupType === pt.type}
                        onChange={() => setGroupType(pt.type)}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-xs font-medium">{pt.label}</div>
                        <div className="text-[11px] opacity-80">{pt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                  已分配包含的出口节点 ({selectedGroupProxies.length} 个)
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1 p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
                  {proxies.map((p) => {
                    const isChecked = selectedGroupProxies.includes(p.name);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProxySelection(p.name)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                            {p.flag} {p.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#86868b]">
                          {p.latency ? `${p.latency}ms` : p.type}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* OUTBOUND PROXY SPECIFIC FIELDS (Step 4) */}
          {node.type === 'outbound' && (
            <div className="space-y-4 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                物理出口节点参数 (Proxy Node)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                    协议类型
                  </label>
                  <select
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs uppercase bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PROXY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt.toUpperCase()}
                      </option>
                    ))}
                    <option value="direct">DIRECT</option>
                    <option value="reject">REJECT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                    实测延迟 (ms)
                  </label>
                  <input
                    type="number"
                    value={latency}
                    onChange={(e) => setLatency(Number(e.target.value))}
                    min={1}
                    max={9999}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3">
            {onDeleteNode && node.type !== 'inbound' && (
              <button
                type="button"
                onClick={() => {
                  onDeleteNode(node.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除节点</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all apple-press"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存配置</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

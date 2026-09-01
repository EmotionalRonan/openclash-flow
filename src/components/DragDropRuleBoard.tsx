import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  Trash2, 
  GripVertical, 
  ArrowUp, 
  ArrowDown, 
  ShieldCheck, 
  Bot, 
  Film, 
  Gamepad2, 
  Globe, 
  ShieldBan, 
  Code2, 
  Sparkles, 
  Check, 
  Filter, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  MoveRight,
  RefreshCw,
  FolderPlus,
  Workflow,
  Kanban
} from 'lucide-react';
import { PolicyGroup, TrafficRule, RuleCategoryItem, RuleType, ProxyNode } from '../types/openclash';
import { PRESET_RULE_ITEMS } from '../data/presetRules';
import { InfiniteFlowCanvas } from './canvas/InfiniteFlowCanvas';

interface DragDropRuleBoardProps {
  policyGroups: PolicyGroup[];
  setPolicyGroups: React.Dispatch<React.SetStateAction<PolicyGroup[]>>;
  rules: TrafficRule[];
  setRules: React.Dispatch<React.SetStateAction<TrafficRule[]>>;
  proxies: ProxyNode[];
}

export const DragDropRuleBoard: React.FC<DragDropRuleBoardProps> = ({
  policyGroups,
  setPolicyGroups,
  rules,
  setRules,
  proxies,
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'board' | 'priority'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [draggedItem, setDraggedItem] = useState<{
    sourceType: 'preset' | 'existingRule';
    data: RuleCategoryItem | TrafficRule;
  } | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  
  // Custom rule add form
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customType, setCustomType] = useState<RuleType>('DOMAIN-SUFFIX');
  const [customPayload, setCustomPayload] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [customTargetGroup, setCustomTargetGroup] = useState(policyGroups[0]?.name || '🚀 节点选择 (PROXY)');
  const [customCategory, setCustomCategory] = useState<'ai' | 'media' | 'gaming' | 'adblock' | 'domestic' | 'dev' | 'custom'>('custom');

  // Filter preset items
  const filteredPresets = PRESET_RULE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payload.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle Drag Start
  const handleDragStartPreset = (e: React.DragEvent, item: RuleCategoryItem) => {
    setDraggedItem({ sourceType: 'preset', data: item });
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'preset', id: item.id }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragStartExisting = (e: React.DragEvent, rule: TrafficRule) => {
    setDraggedItem({ sourceType: 'existingRule', data: rule });
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'existingRule', id: rule.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent, groupName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverGroupId !== groupName) {
      setDragOverGroupId(groupName);
    }
  };

  // Handle Drop on Policy Group
  const handleDropOnGroup = (e: React.DragEvent, targetGroupName: string) => {
    e.preventDefault();
    setDragOverGroupId(null);

    if (!draggedItem) return;

    if (draggedItem.sourceType === 'preset') {
      const preset = draggedItem.data as RuleCategoryItem;
      // Check if already in rules with same payload and type
      const existingIdx = rules.findIndex(
        (r) => r.type === preset.type && r.payload.toLowerCase() === preset.payload.toLowerCase()
      );

      if (existingIdx >= 0) {
        // Update its target group
        setRules((prev) =>
          prev.map((r, idx) => (idx === existingIdx ? { ...r, targetGroup: targetGroupName } : r))
        );
      } else {
        // Insert right before MATCH
        const newRule: TrafficRule = {
          id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: preset.type,
          payload: preset.payload,
          targetGroup: targetGroupName,
          comment: preset.title,
          enabled: true,
          category: preset.category,
        };

        setRules((prev) => {
          const matchIdx = prev.findIndex((r) => r.type === 'MATCH');
          if (matchIdx >= 0) {
            const next = [...prev];
            next.splice(matchIdx, 0, newRule);
            return next;
          }
          return [...prev, newRule];
        });
      }
    } else if (draggedItem.sourceType === 'existingRule') {
      const rule = draggedItem.data as TrafficRule;
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, targetGroup: targetGroupName } : r))
      );
    }

    setDraggedItem(null);
  };

  // Quick Assign Preset Item
  const handleQuickAssignPreset = (preset: RuleCategoryItem, groupName: string) => {
    const existingIdx = rules.findIndex(
      (r) => r.type === preset.type && r.payload.toLowerCase() === preset.payload.toLowerCase()
    );

    if (existingIdx >= 0) {
      setRules((prev) =>
        prev.map((r, idx) => (idx === existingIdx ? { ...r, targetGroup: groupName } : r))
      );
    } else {
      const newRule: TrafficRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: preset.type,
        payload: preset.payload,
        targetGroup: groupName,
        comment: preset.title,
        enabled: true,
        category: preset.category,
      };

      setRules((prev) => {
        const matchIdx = prev.findIndex((r) => r.type === 'MATCH');
        if (matchIdx >= 0) {
          const next = [...prev];
          next.splice(matchIdx, 0, newRule);
          return next;
        }
        return [...prev, newRule];
      });
    }
  };

  // Add Custom Rule
  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPayload.trim()) return;

    const newRule: TrafficRule = {
      id: `custom-rule-${Date.now()}`,
      type: customType,
      payload: customPayload.trim(),
      targetGroup: customTargetGroup,
      comment: customComment.trim() || customPayload.trim(),
      enabled: true,
      category: customCategory,
    };

    setRules((prev) => {
      const matchIdx = prev.findIndex((r) => r.type === 'MATCH');
      if (matchIdx >= 0) {
        const next = [...prev];
        next.splice(matchIdx, 0, newRule);
        return next;
      }
      return [...prev, newRule];
    });

    setCustomPayload('');
    setCustomComment('');
    setShowAddCustomModal(false);
  };

  // Delete rule
  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  // Toggle rule enabled
  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  // Move Rule Priority
  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newRules = [...rules];
    const temp = newRules[index];
    newRules[index] = newRules[targetIdx];
    newRules[targetIdx] = temp;
    setRules(newRules);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Controls & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            可视化拖拽分流工作台
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
              实时自动同步至 OpenClash
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            直接将左侧的域名、IP 网段或预设规则卡片拖入右侧对应的策略组中，即刻生效生成配置文件
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Custom rule button */}
          <button
            id="btn-add-custom-rule"
            onClick={() => setShowAddCustomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加自定义规则</span>
          </button>

          {/* View mode switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'canvas'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>无限画布流图</span>
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'board'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>泳道看板</span>
            </button>
            <button
              onClick={() => setActiveTab('priority')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'priority'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>优先级树 ({rules.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 0: INFINITE FLOW CANVAS */}
      {activeTab === 'canvas' && (
        <InfiniteFlowCanvas
          policyGroups={policyGroups}
          setPolicyGroups={setPolicyGroups}
          rules={rules}
          setRules={setRules}
          proxies={proxies}
        />
      )}

      {/* VIEW 1: BOARD DRAG AND DROP */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Preset Target Palettes */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 sticky top-20 shadow-xl">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  规则预设资源库
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {filteredPresets.length} 项可选
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索域名/IP/应用 (如 openai, netflix, bilibili)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'ai', label: '🤖 AI' },
                  { id: 'media', label: '🎬 影视' },
                  { id: 'gaming', label: '🎮 游戏' },
                  { id: 'adblock', label: '🛡️ 广告' },
                  { id: 'domestic', label: '🇨🇳 国内' },
                  { id: 'dev', label: '💻 开发' },
                  { id: 'social', label: '💬 社交' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Draggable Items List */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredPresets.map((item) => {
                  const assignedRule = rules.find(
                    (r) => r.type === item.type && r.payload.toLowerCase() === item.payload.toLowerCase()
                  );
                  const isAssigned = !!assignedRule;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStartPreset(e, item)}
                      className={`p-2.5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing group select-none ${
                        isAssigned
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                          : 'bg-slate-950/90 border-slate-800 hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                              <span>{item.title}</span>
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                                {item.type}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-indigo-300 mt-0.5 truncate max-w-[200px]">
                              {item.payload}
                            </div>
                          </div>
                        </div>

                        {/* Quick Assign Dropdown */}
                        <div className="shrink-0 flex items-center gap-1">
                          {isAssigned ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 truncate max-w-[120px]">
                              {assignedRule?.targetGroup}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickAssignPreset(item, item.defaultGroup)}
                              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                              title={`一键添加至 ${item.defaultGroup}`}
                            >
                              + 添加
                            </button>
                          )}
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-[10px] text-slate-500 mt-1.5 pl-5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Right Column: Policy Group Buckets */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policyGroups.map((group) => {
                const isDragTarget = dragOverGroupId === group.name;
                const groupRules = rules.filter((r) => r.targetGroup === group.name);

                return (
                  <div
                    key={group.id}
                    onDragOver={(e) => handleDragOver(e, group.name)}
                    onDrop={(e) => handleDropOnGroup(e, group.name)}
                    className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      isDragTarget
                        ? 'bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{group.name}</h3>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {group.type}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{group.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {groupRules.length} 条
                        </span>
                      </div>
                    </div>

                    {/* Dropped Rules Container */}
                    <div className="p-3 space-y-2 min-h-[160px] max-h-[280px] overflow-y-auto">
                      {groupRules.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800/80 rounded-xl text-slate-500">
                          <Layers className="w-6 h-6 text-slate-600 mb-1.5 animate-pulse" />
                          <p className="text-xs font-medium">可将左侧规则拖拽至此策略组</p>
                          <span className="text-[10px] text-slate-600 mt-0.5">支持域名、IP-CIDR、GeoIP</span>
                        </div>
                      ) : (
                        groupRules.map((rule) => (
                          <div
                            key={rule.id}
                            draggable
                            onDragStart={(e) => handleDragStartExisting(e, rule)}
                            className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between gap-2 group text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 shrink-0 cursor-grab" />
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 shrink-0">
                                {rule.type}
                              </span>
                              <span className="font-mono text-slate-200 truncate" title={rule.payload}>
                                {rule.type === 'MATCH' ? 'MATCH (默认全量)' : rule.payload}
                              </span>
                              {rule.comment && rule.comment !== rule.payload && (
                                <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
                                  ({rule.comment})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleToggleRule(rule.id)}
                                className={`w-2 h-2 rounded-full ${
                                  rule.enabled ? 'bg-emerald-400' : 'bg-slate-600'
                                }`}
                                title={rule.enabled ? '已启用 (点击禁用)' : '已禁用 (点击启用)'}
                              />
                              {rule.type !== 'MATCH' && (
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                  title="从该策略组移除"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Card Footer Outbound summary */}
                    <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                      <span>代理节点: {group.proxies.slice(0, 2).join(', ')}{group.proxies.length > 2 ? `... (+${group.proxies.length - 2})` : ''}</span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: PRIORITY ORDER TREE */}
      {activeTab === 'priority' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                OpenClash 规则匹配优先级顺序 (自上而下匹配)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clash 核心引擎严格按照从上到下的顺序进行流量规则匹配，一旦命中立即执行对应策略组路由，后续规则不再检查。
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              共 {rules.length} 条已生效规则
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  rule.enabled
                    ? 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50'
                    : 'bg-slate-950/30 border-slate-900 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-mono font-bold text-slate-500 text-[11px]">
                    #{idx + 1}
                  </span>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold shrink-0">
                    {rule.type}
                  </span>

                  <span className="font-mono text-slate-200 font-medium truncate">
                    {rule.type === 'MATCH' ? 'MATCH (全量兜底)' : rule.payload}
                  </span>

                  {rule.comment && (
                    <span className="text-slate-400 text-[11px] truncate hidden md:inline">
                      • {rule.comment}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <MoveRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-emerald-300 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[11px]">
                      {rule.targetGroup}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveRule(idx, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="上移优先级"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === rules.length - 1}
                      onClick={() => handleMoveRule(idx, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="下移优先级"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        rule.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rule.enabled ? '启用' : '禁用'}
                    </button>
                    {rule.type !== 'MATCH' && (
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Rule Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddCustomRule}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                添加自定义分流规则
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">规则类型 (Rule Type)</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as RuleType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX (域名后缀匹配，如 openai.com)</option>
                  <option value="DOMAIN-KEYWORD">DOMAIN-KEYWORD (域名关键字匹配，如 google)</option>
                  <option value="DOMAIN">DOMAIN (域名完全匹配)</option>
                  <option value="IP-CIDR">IP-CIDR (目标 IP 网段，如 1.1.1.1/32, 192.168.0.0/16)</option>
                  <option value="GEOIP">GEOIP (地理位置 IP 库，如 CN, US, JP)</option>
                  <option value="SRC-IP-CIDR">SRC-IP-CIDR (局域网发起端 IP)</option>
                  <option value="DST-PORT">DST-PORT (目标端口，如 22, 443, 8080)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">匹配值 (Payload)</label>
                <input
                  type="text"
                  required
                  placeholder="例如: anthropic.com 或 10.0.0.0/8"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">目标策略组 (Target Group)</label>
                <select
                  value={customTargetGroup}
                  onChange={(e) => setCustomTargetGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {policyGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                  <option value="DIRECT">DIRECT (直连)</option>
                  <option value="REJECT">REJECT (拦截)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">规则备注 (Comment)</label>
                <input
                  type="text"
                  placeholder="例如: Claude 官方 API 专用"
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                确认添加
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

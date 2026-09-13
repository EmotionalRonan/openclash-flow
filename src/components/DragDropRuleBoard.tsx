import React, { useState, useMemo } from 'react';
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
  Kanban,
  Edit3,
  Pencil,
  DownloadCloud,
  ExternalLink,
  Zap,
  Sliders,
  Radio
} from 'lucide-react';
import { PolicyGroup, TrafficRule, RuleCategoryItem, RuleType, ProxyNode, PolicyGroupType } from '../types/openclash';
import { PRESET_RULE_ITEMS } from '../data/presetRules';
import { InfiniteFlowCanvas } from './canvas/InfiniteFlowCanvas';
import { 
  FALLBACK_ALL_POLICY_GROUPS, 
  FALLBACK_ALL_RULES, 
  FALLBACK_ALL_PROXIES, 
  FALLBACK_ALL_SOURCE_URL 
} from '../data/fallbackAllConfig';
import { parseFullClashYaml } from '../utils/parser';

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

  // Group search & filter
  const [groupSearch, setGroupSearch] = useState('');
  const [groupTypeFilter, setGroupTypeFilter] = useState<'all' | PolicyGroupType>('all');

  // Custom rule add modal state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customType, setCustomType] = useState<RuleType>('RULE-SET');
  const [customPayload, setCustomPayload] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [customTargetGroup, setCustomTargetGroup] = useState(policyGroups[0]?.name || 'ChatGPT');
  const [customNoResolve, setCustomNoResolve] = useState(false);
  const [customCategory, setCustomCategory] = useState<'ai' | 'media' | 'gaming' | 'adblock' | 'domestic' | 'dev' | 'custom'>('custom');

  // Edit rule modal state
  const [editingRule, setEditingRule] = useState<TrafficRule | null>(null);
  const [editRuleType, setEditRuleType] = useState<RuleType>('RULE-SET');
  const [editRulePayload, setEditRulePayload] = useState('');
  const [editRuleTargetGroup, setEditRuleTargetGroup] = useState('');
  const [editRuleComment, setEditRuleComment] = useState('');
  const [editRuleNoResolve, setEditRuleNoResolve] = useState(false);
  const [editRuleEnabled, setEditRuleEnabled] = useState(true);

  // Add policy group modal state
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<PolicyGroupType>('select');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupUrl, setNewGroupUrl] = useState('https://www.gstatic.com/generate_204');
  const [newGroupInterval, setNewGroupInterval] = useState(300);
  const [newGroupTolerance, setNewGroupTolerance] = useState(50);
  const [newGroupSelectedProxies, setNewGroupSelectedProxies] = useState<string[]>([]);

  // Edit policy group modal state
  const [editingGroup, setEditingGroup] = useState<PolicyGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupType, setEditGroupType] = useState<PolicyGroupType>('select');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupUrl, setEditGroupUrl] = useState('');
  const [editGroupInterval, setEditGroupInterval] = useState(300);
  const [editGroupTolerance, setEditGroupTolerance] = useState(50);
  const [editGroupSelectedProxies, setEditGroupSelectedProxies] = useState<string[]>([]);

  // Remote YAML sync modal state
  const [showSyncYamlModal, setShowSyncYamlModal] = useState(false);
  const [yamlSyncUrl, setYamlSyncUrl] = useState(FALLBACK_ALL_SOURCE_URL);
  const [isSyncingYaml, setIsSyncingYaml] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Filter preset items
  const filteredPresets = PRESET_RULE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payload.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter policy groups for board view
  const filteredPolicyGroups = useMemo(() => {
    return policyGroups.filter((g) => {
      if (groupTypeFilter !== 'all' && g.type !== groupTypeFilter) return false;
      if (groupSearch.trim()) {
        const q = groupSearch.toLowerCase().trim();
        const matchName = g.name.toLowerCase().includes(q);
        const matchDesc = (g.description || '').toLowerCase().includes(q);
        const matchProxies = g.proxies.some((p) => p.toLowerCase().includes(q));
        return matchName || matchDesc || matchProxies;
      }
      return true;
    });
  }, [policyGroups, groupTypeFilter, groupSearch]);

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
      const existingIdx = rules.findIndex(
        (r) => r.type === preset.type && r.payload.toLowerCase() === preset.payload.toLowerCase()
      );

      if (existingIdx >= 0) {
        setRules((prev) =>
          prev.map((r, idx) => (idx === existingIdx ? { ...r, targetGroup: targetGroupName } : r))
        );
      } else {
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
      noResolve: customNoResolve,
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
    setCustomNoResolve(false);
    setShowAddCustomModal(false);
  };

  // Start Editing Rule
  const handleStartEditRule = (rule: TrafficRule) => {
    setEditingRule(rule);
    setEditRuleType(rule.type);
    setEditRulePayload(rule.payload);
    setEditRuleTargetGroup(rule.targetGroup);
    setEditRuleComment(rule.comment || '');
    setEditRuleNoResolve(!!rule.noResolve);
    setEditRuleEnabled(rule.enabled);
  };

  // Save Edited Rule
  const handleSaveEditRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    setRules((prev) =>
      prev.map((r) =>
        r.id === editingRule.id
          ? {
              ...r,
              type: editRuleType,
              payload: editRulePayload.trim(),
              targetGroup: editRuleTargetGroup,
              comment: editRuleComment.trim(),
              noResolve: editRuleNoResolve,
              enabled: editRuleEnabled,
            }
          : r
      )
    );

    setEditingRule(null);
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

  // Create New Policy Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const group: PolicyGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      type: newGroupType,
      description: newGroupDescription.trim() || `${newGroupName.trim()} 策略组`,
      proxies: newGroupSelectedProxies.length > 0 ? newGroupSelectedProxies : ['直连'],
      url: newGroupType !== 'select' ? newGroupUrl : undefined,
      interval: newGroupType !== 'select' ? newGroupInterval : undefined,
      tolerance: newGroupType === 'url-test' ? newGroupTolerance : undefined,
    };

    setPolicyGroups((prev) => [...prev, group]);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupSelectedProxies([]);
    setShowAddGroupModal(false);
  };

  // Start Editing Policy Group
  const handleStartEditGroup = (group: PolicyGroup) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupType(group.type);
    setEditGroupDescription(group.description || '');
    setEditGroupUrl(group.url || 'https://www.gstatic.com/generate_204');
    setEditGroupInterval(group.interval || 300);
    setEditGroupTolerance(group.tolerance || 50);
    setEditGroupSelectedProxies([...group.proxies]);
  };

  // Save Edited Policy Group
  const handleSaveEditGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editGroupName.trim()) return;

    const oldName = editingGroup.name;
    const newName = editGroupName.trim();

    setPolicyGroups((prev) =>
      prev.map((g) => {
        if (g.id === editingGroup.id) {
          return {
            ...g,
            name: newName,
            type: editGroupType,
            description: editGroupDescription.trim(),
            url: editGroupType !== 'select' ? editGroupUrl : undefined,
            interval: editGroupType !== 'select' ? editGroupInterval : undefined,
            tolerance: editGroupType === 'url-test' ? editGroupTolerance : undefined,
            proxies: editGroupSelectedProxies,
          };
        }
        // If other group referenced oldName, update reference
        if (oldName !== newName && g.proxies.includes(oldName)) {
          return {
            ...g,
            proxies: g.proxies.map((p) => (p === oldName ? newName : p)),
          };
        }
        return g;
      })
    );

    // If name changed, cascade update to rules!
    if (oldName !== newName) {
      setRules((prev) =>
        prev.map((r) => (r.targetGroup === oldName ? { ...r, targetGroup: newName } : r))
      );
    }

    setEditingGroup(null);
  };

  // Delete Policy Group
  const handleDeleteGroup = (group: PolicyGroup) => {
    if (confirm(`确定要删除策略组 [${group.name}] 吗？相关的分流规则将被重定向至 DIRECT。`)) {
      setPolicyGroups((prev) => prev.filter((g) => g.id !== group.id));
      // Reassign rules targeting this deleted group to DIRECT
      setRules((prev) =>
        prev.map((r) => (r.targetGroup === group.name ? { ...r, targetGroup: 'DIRECT' } : r))
      );
    }
  };

  // One-click load Fallback-All Production Configuration
  const handleLoadFallbackAllPreset = () => {
    if (confirm('是否加载来自 clash-fallback-all.yaml 的全量生产配置（包含 35+ 业务分流组与 52 条精准规则）？')) {
      setPolicyGroups(FALLBACK_ALL_POLICY_GROUPS);
      setRules(FALLBACK_ALL_RULES);
    }
  };

  // Sync from Remote YAML URL
  const handleSyncFromRemoteYaml = async () => {
    if (!yamlSyncUrl.trim()) return;
    setIsSyncingYaml(true);
    setSyncStatus(null);

    try {
      const resp = await fetch(yamlSyncUrl.trim());
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: 无法获取远程配置文件`);
      }
      const yamlText = await resp.text();
      const parsed = parseFullClashYaml(yamlText);

      if (parsed.proxyGroups.length === 0 && parsed.rules.length === 0) {
        throw new Error('未能从 YAML 中解析到有效的策略组或规则');
      }

      if (parsed.proxyGroups.length > 0) {
        setPolicyGroups(parsed.proxyGroups);
      }
      if (parsed.rules.length > 0) {
        setRules(parsed.rules);
      }

      setSyncStatus({
        success: true,
        message: `成功同步并载入 ${parsed.proxyGroups.length} 个策略组、${parsed.rules.length} 条分流规则！`,
      });
      setTimeout(() => {
        setShowSyncYamlModal(false);
        setSyncStatus(null);
      }, 1500);
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: err.message || '远程配置拉取解析失败',
      });
    } finally {
      setIsSyncingYaml(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Top Controls & View Toggle */}
      <div className="apple-glass rounded-3xl p-4 sm:p-5 border border-black/[0.08] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            可视化分流策略工作台
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/[0.15] text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-500/25">
              支持策略组与规则增删改查
            </span>
          </h2>
          <p className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-1">
            当前支持 35+ 业务分流组、全量国家故障转移与 50+ 条精细规则（支持从 clash-fallback-all.yaml 一键同步与在线修改）
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-stretch sm:self-end md:self-auto">
          {/* Preset 1-Click Load Button */}
          <button
            id="btn-load-fallback-all"
            onClick={handleLoadFallbackAllPreset}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-500/30 apple-press transition-colors shrink-0"
            title="载入 clash-fallback-all 生产级 35+ 策略组"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">载入 Fallback-All 生产策略</span>
            <span className="sm:hidden whitespace-nowrap">Fallback-All 策略</span>
          </button>

          {/* Sync from URL Button */}
          <button
            onClick={() => setShowSyncYamlModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors shrink-0"
            title="从远程 GitHub / URL 配置文件拉取并覆盖"
          >
            <DownloadCloud className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">从远程 YAML 同步</span>
            <span className="sm:hidden whitespace-nowrap">远程同步</span>
          </button>

          {/* Add Group Button */}
          <button
            onClick={() => setShowAddGroupModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors shrink-0 whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 shrink-0" />
            <span>新建策略组</span>
          </button>

          {/* Custom rule button */}
          <button
            id="btn-add-custom-rule"
            onClick={() => setShowAddCustomModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">添加分流规则</span>
            <span className="sm:hidden whitespace-nowrap">添加规则</span>
          </button>

          {/* View mode switcher */}
          <div className="flex overflow-x-auto max-w-full scrollbar-none bg-slate-100 dark:bg-[#12131b] p-1 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] text-xs shrink-0">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-medium apple-press transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'canvas'
                  ? 'bg-white dark:bg-white/[0.12] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.06] dark:border-white/[0.1]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 shrink-0" />
              <span>拓扑流图</span>
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-medium apple-press transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'board'
                  ? 'bg-white dark:bg-white/[0.12] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.06] dark:border-white/[0.1]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 shrink-0" />
              <span>策略看板 ({policyGroups.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('priority')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-medium apple-press transition-all shrink-0 whitespace-nowrap ${
                activeTab === 'priority'
                  ? 'bg-white dark:bg-white/[0.12] text-[#1d1d1f] dark:text-white shadow-sm border border-black/[0.06] dark:border-white/[0.1]'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>规则次序 ({rules.length})</span>
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
            
            <div className="apple-glass rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl border border-black/[0.08] dark:border-white/[0.08]">
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center justify-between">
                  <span>常用业务规则池</span>
                  <span className="text-[11px] text-[#86868b] font-normal">拖动至右侧策略组</span>
                </h3>
                <p className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-0.5">
                  已收录 OpenAI、Claude、YouTube、Netflix 等精细分流包
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索预设 (如 ChatGPT, 哔哩哔哩)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-indigo-500/80"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'ai', label: '🤖 AI 大模型' },
                  { id: 'media', label: '🎬 海外流媒体' },
                  { id: 'gaming', label: '🎮 游戏加速' },
                  { id: 'domestic', label: '🇨🇳 国内直连' },
                  { id: 'adblock', label: '🛡️ 拦截规则' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium apple-press transition-all ${
                      selectedCategory === c.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#86868b] dark:hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Preset List */}
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
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
                      className="p-3 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all cursor-grab active:cursor-grabbing apple-press group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-[#86868b] group-hover:text-indigo-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                              <span className="truncate">{item.title}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1aa] shrink-0">
                                {item.type}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-300 mt-0.5 truncate max-w-[200px]">
                              {item.payload}
                            </div>
                          </div>
                        </div>

                        {/* Quick Assign Dropdown */}
                        <div className="shrink-0 flex items-center gap-1">
                          {isAssigned ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25 truncate max-w-[120px]">
                              {assignedRule?.targetGroup}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickAssignPreset(item, item.defaultGroup)}
                              className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-indigo-600 text-[#1d1d1f] dark:text-[#d4d4d8] hover:text-white border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors font-medium"
                              title={`一键添加至 ${item.defaultGroup}`}
                            >
                              + 添加
                            </button>
                          )}
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-[10px] text-[#6e6e73] dark:text-[#86868b] mt-1.5 pl-5">
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
            
            {/* Filter bar for policy groups */}
            <div className="apple-glass rounded-2xl p-3 border border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
              <div className="relative min-w-[220px] flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-[#86868b] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="检索策略组 (名称/节点/描述)..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'select', 'url-test', 'fallback', 'load-balance'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGroupTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      groupTypeFilter === t
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {t === 'all' ? '全部' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Policy Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPolicyGroups.map((group) => {
                const isDragTarget = dragOverGroupId === group.name;
                const groupRules = rules.filter((r) => r.targetGroup === group.name);

                return (
                  <div
                    key={group.id}
                    onDragOver={(e) => handleDragOver(e, group.name)}
                    onDrop={(e) => handleDropOnGroup(e, group.name)}
                    className={`rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                      isDragTarget
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-400/80 ring-2 ring-indigo-500/30 shadow-2xl'
                        : 'apple-glass border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.14] dark:hover:border-white/[0.14]'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight truncate">{group.name}</h3>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1aa] border border-black/[0.06] dark:border-white/[0.06] shrink-0">
                            {group.type}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-[11px] text-[#6e6e73] dark:text-[#86868b] mt-0.5 truncate">{group.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/[0.15] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/25">
                          {groupRules.length} 条
                        </span>
                        
                        {/* Edit Group Button */}
                        <button
                          onClick={() => handleStartEditGroup(group)}
                          className="p-1 rounded-md text-[#86868b] hover:text-indigo-600 dark:text-[#a1a1aa] dark:hover:text-indigo-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] apple-press transition-colors"
                          title="编辑策略组属性与代理列表"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Group Button */}
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className="p-1 rounded-md text-[#86868b] hover:text-rose-500 dark:text-[#a1a1aa] dark:hover:text-rose-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] apple-press transition-colors"
                          title="删除策略组"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dropped Rules Container */}
                    <div className="p-3.5 space-y-2 min-h-[160px] max-h-[280px] overflow-y-auto">
                      {groupRules.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-2xl text-[#86868b] dark:text-[#71717a]">
                          <Layers className="w-6 h-6 text-[#86868b] dark:text-[#71717a] mb-1.5 animate-pulse" />
                          <p className="text-xs font-medium">可将左侧规则拖拽至此策略组</p>
                          <span className="text-[10px] text-[#86868b] dark:text-[#71717a] mt-0.5">支持 RULE-SET、域名、IP-CIDR、GeoIP</span>
                        </div>
                      ) : (
                        groupRules.map((rule) => (
                          <div
                            key={rule.id}
                            draggable
                            onDragStart={(e) => handleDragStartExisting(e, rule)}
                            className="p-2.5 rounded-xl bg-white/90 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-indigo-400/40 hover:bg-slate-50 dark:hover:bg-white/[0.06] flex items-center justify-between gap-2 group text-xs apple-press transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-[#86868b] group-hover:text-indigo-500 dark:text-[#71717a] dark:group-hover:text-indigo-400 shrink-0 cursor-grab" />
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-white/[0.06] text-indigo-700 dark:text-indigo-300 shrink-0 border border-indigo-200 dark:border-white/[0.06]">
                                {rule.type}
                              </span>
                              <span className="font-mono text-[#1d1d1f] dark:text-[#d4d4d8] truncate" title={rule.payload}>
                                {rule.type === 'MATCH' ? 'MATCH (默认兜底)' : rule.payload}
                              </span>
                              {rule.noResolve && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-600/30 shrink-0">
                                  no-resolve
                                </span>
                              )}
                              {rule.comment && rule.comment !== rule.payload && (
                                <span className="text-[10px] text-[#6e6e73] dark:text-[#86868b] truncate hidden sm:inline">
                                  ({rule.comment})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleToggleRule(rule.id)}
                                className={`w-2 h-2 rounded-full ${
                                  rule.enabled ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-slate-300 dark:bg-[#52525b]'
                                }`}
                                title={rule.enabled ? '已启用 (点击禁用)' : '已禁用 (点击启用)'}
                              />
                              <button
                                onClick={() => handleStartEditRule(rule)}
                                className="p-1 rounded-md text-[#86868b] hover:text-indigo-600 dark:text-[#71717a] dark:hover:text-indigo-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                                title="编辑此条规则"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {rule.type !== 'MATCH' && (
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="p-1 rounded-md text-[#86868b] hover:text-rose-500 dark:text-[#71717a] dark:hover:text-rose-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
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
                    <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.06] text-[10px] text-[#6e6e73] dark:text-[#86868b] flex items-center justify-between font-mono">
                      <span>代理出口: {group.proxies.slice(0, 3).join(', ')}{group.proxies.length > 3 ? `... (+${group.proxies.length - 3})` : ''}</span>
                      {group.interval && <span>{group.interval}s 测速</span>}
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
        <div className="apple-glass rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl border border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
                <span>分流规则执行优先级次序表 (Top-Down Sequence)</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono">
                  共 {rules.length} 条规则
                </span>
              </h3>
              <p className="text-xs text-[#6e6e73] dark:text-[#86868b] mt-0.5">
                内核按从上到下顺序依次判定。首次命中即刻终止匹配并向指定策略组转发流量。
              </p>
            </div>

            <button
              onClick={() => setShowAddCustomModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>插入规则</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  rule.enabled
                    ? 'bg-white/90 dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06]'
                    : 'bg-slate-100/60 dark:bg-white/[0.01] border-dashed border-black/[0.08] dark:border-white/[0.08] opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-center font-mono text-xs font-bold text-[#86868b] dark:text-[#71717a] shrink-0">
                    #{idx + 1}
                  </span>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-white/[0.06] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-white/[0.06] shrink-0">
                    {rule.type}
                  </span>

                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {rule.type === 'MATCH' ? 'MATCH (漏网之鱼全局兜底)' : rule.payload}
                    </div>
                    {rule.comment && rule.comment !== rule.payload && (
                      <div className="text-[11px] text-[#6e6e73] dark:text-[#86868b] truncate mt-0.5">
                        {rule.comment}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.04] dark:border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#86868b] dark:text-[#71717a]">路由至</span>
                    <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/[0.15] text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/25">
                      {rule.targetGroup}
                    </span>
                    {rule.noResolve && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-600/30 shrink-0">
                        no-resolve
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveRule(idx, 'up')}
                      className="p-1.5 rounded-lg text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] disabled:opacity-20 apple-press transition-colors"
                      title="上移优先级"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === rules.length - 1}
                      onClick={() => handleMoveRule(idx, 'down')}
                      className="p-1.5 rounded-lg text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] disabled:opacity-20 apple-press transition-colors"
                      title="下移优先级"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEditRule(rule)}
                      className="p-1.5 rounded-lg text-[#6e6e73] dark:text-[#a1a1aa] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] apple-press transition-colors"
                      title="编辑规则"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium apple-press transition-all ${
                        rule.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25'
                          : 'bg-slate-100 dark:bg-white/[0.06] text-[#86868b] dark:text-[#71717a]'
                      }`}
                    >
                      {rule.enabled ? '启用' : '禁用'}
                    </button>
                    {rule.type !== 'MATCH' && (
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-[#86868b] hover:text-rose-500 dark:text-[#71717a] dark:hover:text-rose-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] apple-press transition-colors"
                        title="删除规则"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddCustomRule}
            className="apple-glass rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                添加自定义分流规则
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">规则类型 (Rule Type)</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as RuleType)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
                >
                  <option value="RULE-SET">RULE-SET (规则集/Rule Provider, 如 ChatGPT / Domain)</option>
                  <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX (域名后缀匹配，如 openai.com)</option>
                  <option value="DOMAIN-KEYWORD">DOMAIN-KEYWORD (域名关键字匹配，如 google)</option>
                  <option value="DOMAIN">DOMAIN (域名完全匹配)</option>
                  <option value="IP-CIDR">IP-CIDR (目标 IP 网段，如 1.1.1.1/32, 192.168.0.0/16)</option>
                  <option value="GEOIP">GEOIP (地理位置 IP 库，如 CN, US, JP)</option>
                  <option value="GEOSITE">GEOSITE (预置域名集合)</option>
                  <option value="SRC-IP-CIDR">SRC-IP-CIDR (局域网发起端 IP)</option>
                  <option value="DST-PORT">DST-PORT (目标服务端口)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">匹配载荷 (Payload)</label>
                <input
                  type="text"
                  required
                  placeholder={customType === 'RULE-SET' ? '例如: ChatGPT / Domain' : '例如: openai.com 或 10.0.0.0/8'}
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">路由目标策略组 (Target Outbound)</label>
                <select
                  value={customTargetGroup}
                  onChange={(e) => setCustomTargetGroup(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
                >
                  <option value="DIRECT">DIRECT (直接连接)</option>
                  <option value="REJECT">REJECT (拒绝/拦截)</option>
                  {policyGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} ({g.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="custom-no-resolve"
                  checked={customNoResolve}
                  onChange={(e) => setCustomNoResolve(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="custom-no-resolve" className="text-[#6e6e73] dark:text-[#a1a1aa] cursor-pointer">
                  no-resolve (跳过 DNS 解析，仅在目标已为 IP 时匹配)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">规则备注 (Comment)</label>
                <input
                  type="text"
                  placeholder="如: OpenAI 官方 API 与网页服务"
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors"
              >
                确认添加
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEditRule}
            className="apple-glass rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                编辑分流规则
              </h3>
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">规则类型 (Rule Type)</label>
                <select
                  value={editRuleType}
                  onChange={(e) => setEditRuleType(e.target.value as RuleType)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                >
                  <option value="RULE-SET">RULE-SET (规则集)</option>
                  <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX (域名后缀)</option>
                  <option value="DOMAIN-KEYWORD">DOMAIN-KEYWORD (域名关键字)</option>
                  <option value="DOMAIN">DOMAIN (完整域名)</option>
                  <option value="IP-CIDR">IP-CIDR (网段)</option>
                  <option value="GEOIP">GEOIP (地理位置)</option>
                  <option value="GEOSITE">GEOSITE (域名集合)</option>
                  <option value="MATCH">MATCH (最终兜底)</option>
                </select>
              </div>

              {editRuleType !== 'MATCH' && (
                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">匹配载荷 (Payload)</label>
                  <input
                    type="text"
                    required
                    value={editRulePayload}
                    onChange={(e) => setEditRulePayload(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:outline-none focus:border-indigo-500/80"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">目标出口策略组</label>
                <select
                  value={editRuleTargetGroup}
                  onChange={(e) => setEditRuleTargetGroup(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold focus:outline-none focus:border-indigo-500/80"
                >
                  <option value="DIRECT">DIRECT (直连)</option>
                  <option value="REJECT">REJECT (拒绝)</option>
                  {policyGroups.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} ({g.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-no-resolve"
                  checked={editRuleNoResolve}
                  onChange={(e) => setEditRuleNoResolve(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="edit-no-resolve" className="text-[#6e6e73] dark:text-[#a1a1aa] cursor-pointer">
                  no-resolve (跳过 DNS 解析直接匹配目标 IP)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">备注说明</label>
                <input
                  type="text"
                  value={editRuleComment}
                  onChange={(e) => setEditRuleComment(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-rule-enabled"
                  checked={editRuleEnabled}
                  onChange={(e) => setEditRuleEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="edit-rule-enabled" className="text-[#6e6e73] dark:text-[#a1a1aa] cursor-pointer font-medium">
                  启用此规则 (已勾选生效)
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors"
              >
                保存修改
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Policy Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateGroup}
            className="apple-glass rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                新建分流策略组 (Policy Group)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">策略组名称</label>
                  <input
                    type="text"
                    required
                    placeholder="如: Claude 或 日本-故转"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">策略类型 (Type)</label>
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value as PolicyGroupType)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                  >
                    <option value="select">select (手动选择)</option>
                    <option value="url-test">url-test (自动延迟优选)</option>
                    <option value="fallback">fallback (故障转移)</option>
                    <option value="load-balance">load-balance (负载均衡)</option>
                    <option value="relay">relay (链式代理)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">描述说明</label>
                <input
                  type="text"
                  placeholder="策略组业务定位..."
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                />
              </div>

              {newGroupType !== 'select' && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[#86868b] dark:text-[#71717a] text-[10px]">测试 URL</label>
                    <input
                      type="text"
                      value={newGroupUrl}
                      onChange={(e) => setNewGroupUrl(e.target.value)}
                      className="w-full bg-white dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-2 py-1 text-[11px] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#86868b] dark:text-[#71717a] text-[10px]">测试周期 (秒)</label>
                    <input
                      type="number"
                      value={newGroupInterval}
                      onChange={(e) => setNewGroupInterval(parseInt(e.target.value, 10) || 300)}
                      className="w-full bg-white dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-2 py-1 text-[11px] font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium flex items-center justify-between">
                  <span>包含节点 / 子策略组 ({newGroupSelectedProxies.length} 已选)</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (newGroupSelectedProxies.length === proxies.length) {
                        setNewGroupSelectedProxies([]);
                      } else {
                        setNewGroupSelectedProxies(proxies.map((p) => p.name));
                      }
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {newGroupSelectedProxies.length === proxies.length ? '全不选' : '全选节点'}
                  </button>
                </label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-100 dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-1">
                  {proxies.map((p) => {
                    const isChecked = newGroupSelectedProxies.includes(p.name);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewGroupSelectedProxies((prev) => [...prev, p.name]);
                            } else {
                              setNewGroupSelectedProxies((prev) => prev.filter((x) => x !== p.name));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-mono text-xs text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{p.name}</span>
                        <span className="text-[10px] uppercase text-[#86868b] font-mono ml-auto">{p.type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowAddGroupModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors"
              >
                创建策略组
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Policy Group Modal */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEditGroup}
            className="apple-glass rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                编辑策略组: {editingGroup.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">策略组名称</label>
                  <input
                    type="text"
                    required
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">策略类型</label>
                  <select
                    value={editGroupType}
                    onChange={(e) => setEditGroupType(e.target.value as PolicyGroupType)}
                    className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                  >
                    <option value="select">select (手动选择)</option>
                    <option value="url-test">url-test (自动延迟优选)</option>
                    <option value="fallback">fallback (故障转移)</option>
                    <option value="load-balance">load-balance (负载均衡)</option>
                    <option value="relay">relay (链式代理)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium">描述说明</label>
                <input
                  type="text"
                  value={editGroupDescription}
                  onChange={(e) => setEditGroupDescription(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:border-indigo-500/80"
                />
              </div>

              {editGroupType !== 'select' && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[#86868b] dark:text-[#71717a] text-[10px]">测试 URL</label>
                    <input
                      type="text"
                      value={editGroupUrl}
                      onChange={(e) => setEditGroupUrl(e.target.value)}
                      className="w-full bg-white dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-2 py-1 text-[11px] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#86868b] dark:text-[#71717a] text-[10px]">测试周期 (秒)</label>
                    <input
                      type="number"
                      value={editGroupInterval}
                      onChange={(e) => setEditGroupInterval(parseInt(e.target.value, 10) || 300)}
                      className="w-full bg-white dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-2 py-1 text-[11px] font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#a1a1aa] font-medium flex items-center justify-between">
                  <span>包含节点与子组 ({editGroupSelectedProxies.length} 已选)</span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditGroupSelectedProxies(['直连', '所有-手动', '所有-自动'])}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      设为默认
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGroupSelectedProxies([])}
                      className="text-[10px] text-[#86868b] hover:underline"
                    >
                      清空
                    </button>
                  </div>
                </label>
                <div className="max-h-44 overflow-y-auto p-2 bg-slate-100 dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-1">
                  {/* Common Outbounds */}
                  <div className="text-[10px] text-[#86868b] font-semibold uppercase px-1 pt-1">系统出口与策略组</div>
                  {['直连', '拒绝', ...policyGroups.filter((g) => g.id !== editingGroup.id).map((g) => g.name)].map((name) => {
                    const isChecked = editGroupSelectedProxies.includes(name);
                    return (
                      <label
                        key={`grp-opt-${name}`}
                        className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditGroupSelectedProxies((prev) => [...prev, name]);
                            } else {
                              setEditGroupSelectedProxies((prev) => prev.filter((x) => x !== name));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-mono text-xs text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 ml-auto">
                          组/出口
                        </span>
                      </label>
                    );
                  })}

                  <div className="text-[10px] text-[#86868b] font-semibold uppercase px-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                    实体代理节点
                  </div>
                  {proxies.map((p) => {
                    const isChecked = editGroupSelectedProxies.includes(p.name);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditGroupSelectedProxies((prev) => [...prev, p.name]);
                            } else {
                              setEditGroupSelectedProxies((prev) => prev.filter((x) => x !== p.name));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-mono text-xs text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{p.name}</span>
                        <span className="text-[10px] uppercase text-[#86868b] font-mono ml-auto">{p.type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-colors"
              >
                保存策略组
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Remote YAML Sync Modal */}
      {showSyncYamlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="apple-glass rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-black/[0.1] dark:border-white/[0.12] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                从远程 YAML 配置文件同步
              </h3>
              <button
                type="button"
                onClick={() => setShowSyncYamlModal(false)}
                className="w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/[0.06] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white flex items-center justify-center text-xs apple-press transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6e6e73] dark:text-[#86868b]">
              输入完整的 Clash / OpenClash 远程 YAML 地址。系统将完整解析锚点、Proxy-Groups、Rules 并同步至当前工作台。
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">远程 YAML URL</label>
              <input
                type="text"
                value={yamlSyncUrl}
                onChange={(e) => setYamlSyncUrl(e.target.value)}
                placeholder="https://raw.githubusercontent.com/.../clash-fallback-all.yaml"
                className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {syncStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  syncStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                }`}
              >
                {syncStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                )}
                <span>{syncStatus.message}</span>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2.5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowSyncYamlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] text-xs font-medium border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSyncingYaml || !yamlSyncUrl.trim()}
                onClick={handleSyncFromRemoteYaml}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press disabled:opacity-50 transition-colors"
              >
                {isSyncingYaml ? '正在拉取解析...' : '立即同步配置'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

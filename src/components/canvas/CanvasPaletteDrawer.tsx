import React, { useState } from 'react';
import { RuleCategoryItem, RuleType } from '../../types/openclash';
import { PRESET_RULE_ITEMS } from '../../data/presetRules';
import { 
  Search, 
  GripVertical, 
  Plus, 
  Filter, 
  Sparkles, 
  Bot, 
  Film, 
  Gamepad2, 
  ShieldBan, 
  Globe, 
  Code2, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CanvasPaletteDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  onDragStartPreset: (e: React.DragEvent, item: RuleCategoryItem) => void;
  onAddCustomNode: (type: RuleType, payload: string, title: string, category: any) => void;
  onQuickAddPreset?: (item: RuleCategoryItem) => void;
}

export const CanvasPaletteDrawer: React.FC<CanvasPaletteDrawerProps> = ({
  isOpen,
  onToggle,
  onDragStartPreset,
  onAddCustomNode,
  onQuickAddPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Custom rule quick creator state
  const [customType, setCustomType] = useState<RuleType>('DOMAIN-SUFFIX');
  const [customPayload, setCustomPayload] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const filteredPresets = PRESET_RULE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payload.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPayload.trim()) return;
    onAddCustomNode(
      customType,
      customPayload.trim(),
      customTitle.trim() || customPayload.trim(),
      'custom'
    );
    setCustomPayload('');
    setCustomTitle('');
  };

  return (
    <div
      className={`absolute top-3 sm:top-4 left-2 sm:left-4 z-30 transition-all duration-300 pointer-events-auto ${
        isOpen ? 'w-72 sm:w-80 max-w-[calc(100vw-36px)]' : 'w-8'
      }`}
    >
      {/* Toggle Tab */}
      <button
        onClick={onToggle}
        className="absolute -right-3.5 top-5 w-7 h-10 rounded-r-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg z-40 apple-press transition-colors"
        title={isOpen ? '收起组件库' : '展开规则与组件库'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Drawer Body */}
      {isOpen && (
        <div className="apple-glass rounded-3xl p-3.5 sm:p-4 shadow-2xl max-h-[calc(100vh-250px)] min-h-[320px] overflow-y-auto space-y-3.5 border border-black/[0.08] dark:border-white/[0.1]">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
            <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5 tracking-tight">
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              画布节点资源库
            </span>
            <span className="text-[10px] text-[#6e6e73] dark:text-[#86868b] font-mono">
              拖拽放置
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#86868b] dark:text-[#71717a] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索预设 (如 openai, netflix)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#71717a] focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            {[
              { id: 'all', label: '全部' },
              { id: 'ai', label: '🤖 AI' },
              { id: 'media', label: '🎬 影视' },
              { id: 'gaming', label: '🎮 游戏' },
              { id: 'adblock', label: '🛡️ 广告' },
              { id: 'domestic', label: '🇨🇳 国内' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded-lg transition-all apple-press font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-white border border-black/[0.06] dark:border-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Draggable Presets */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[10px] text-[#6e6e73] dark:text-[#86868b] font-medium px-1">
              <span>拖动卡片或点击「+」添加：</span>
              <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-mono font-semibold">{filteredPresets.length} 个</span>
            </div>
            {filteredPresets.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStartPreset(e, item)}
                className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] hover:border-indigo-400/50 hover:bg-slate-50 dark:hover:bg-white/[0.06] cursor-grab active:cursor-grabbing apple-press transition-all select-none group flex items-center justify-between gap-1.5 shadow-sm"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <GripVertical className="w-3 h-3 text-[#86868b] group-hover:text-indigo-500 dark:text-[#71717a] dark:group-hover:text-indigo-400 shrink-0 hidden sm:block" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-300 truncate">
                      {item.payload}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1aa] border border-black/[0.06] dark:border-white/[0.06]">
                    {item.type}
                  </span>
                  {onQuickAddPreset && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAddPreset(item);
                      }}
                      className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-500/20 dark:hover:bg-indigo-600 dark:text-indigo-200 dark:hover:text-white apple-press transition-colors"
                      title="快速加入画布"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Rule Quick Add Box */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2">
            <p className="text-[10px] text-[#1d1d1f] dark:text-[#d4d4d8] font-semibold flex items-center gap-1 tracking-tight">
              <Plus className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              自定义节点一键生成
            </p>
            <form onSubmit={handleCreateCustom} className="space-y-1.5 text-xs">
              <div className="flex gap-1.5">
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as RuleType)}
                  className="w-1/2 bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-2 py-1.5 text-[11px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none"
                >
                  <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX</option>
                  <option value="DOMAIN-KEYWORD">KEYWORD</option>
                  <option value="IP-CIDR">IP-CIDR</option>
                  <option value="GEOIP">GEOIP</option>
                </select>
                <input
                  type="text"
                  placeholder="域名/IP..."
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-1/2 bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-[11px] text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:outline-none"
                />
              </div>

              <input
                type="text"
                placeholder="节点名称备注 (可选)..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-[11px] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none"
              />

              <button
                type="submit"
                disabled={!customPayload.trim()}
                className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[11px] font-semibold apple-press transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>生成并加入画布</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

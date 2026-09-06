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
        className="absolute -right-3.5 top-5 w-7 h-10 rounded-r-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg z-40 transition-colors"
        title={isOpen ? '收起组件库' : '展开规则与组件库'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Drawer Body */}
      {isOpen && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md max-h-[calc(100vh-250px)] min-h-[320px] overflow-y-auto space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              画布节点资源库
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              拖拽到画布放置
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="搜索预设规则 (如 openai, netflix)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
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
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Draggable Presets */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>拖动卡片或点击「+」添加：</span>
              <span className="text-[9px] text-indigo-400 font-mono">{filteredPresets.length} 个</span>
            </div>
            {filteredPresets.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStartPreset(e, item)}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/60 hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none group flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 shrink-0 hidden sm:block" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-300 truncate">
                      {item.payload}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                    {item.type}
                  </span>
                  {onQuickAddPreset && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAddPreset(item);
                      }}
                      className="p-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white transition-colors"
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
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <p className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
              <Plus className="w-3 h-3 text-indigo-400" />
              自定义节点一键生成
            </p>
            <form onSubmit={handleCreateCustom} className="space-y-1.5 text-xs">
              <div className="flex gap-1.5">
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as RuleType)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                >
                  <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX</option>
                  <option value="DOMAIN-KEYWORD">KEYWORD</option>
                  <option value="IP-CIDR">IP-CIDR</option>
                  <option value="GEOIP">GEOIP</option>
                </select>
                <input
                  type="text"
                  placeholder="匹配域名/IP..."
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 font-mono"
                />
              </div>

              <input
                type="text"
                placeholder="节点名称备注 (可选)..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200"
              />

              <button
                type="submit"
                disabled={!customPayload.trim()}
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
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

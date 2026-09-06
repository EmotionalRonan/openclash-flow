import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Trash2, 
  Activity, 
  Sparkles, 
  ArrowRight,
  Palette,
  GitCommit,
  Radio
} from 'lucide-react';
import { CanvasEdge, CanvasNodeData } from '../../types/canvas';

interface EdgeEditModalProps {
  isOpen: boolean;
  edge: CanvasEdge | null;
  nodes: CanvasNodeData[];
  onClose: () => void;
  onSaveEdge: (updatedEdge: CanvasEdge, newTargetNodeId?: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

const PRESET_COLORS = [
  { name: '翡翠绿 (高速链路)', hex: '#10b981', ring: 'ring-emerald-500' },
  { name: '宝石蓝 (直连/局域网)', hex: '#0ea5e9', ring: 'ring-sky-500' },
  { name: '霓虹紫 (策略分流)', hex: '#8b5cf6', ring: 'ring-purple-500' },
  { name: '琥珀橙 (测速备选)', hex: '#f59e0b', ring: 'ring-amber-500' },
  { name: '玫瑰红 (拦截丢弃)', hex: '#f43f5e', ring: 'ring-rose-500' },
  { name: '隐秘灰 (默认链路)', hex: '#64748b', ring: 'ring-slate-500' },
];

export const EdgeEditModal: React.FC<EdgeEditModalProps> = ({
  isOpen,
  edge,
  nodes,
  onClose,
  onSaveEdge,
  onDeleteEdge,
}) => {
  if (!isOpen || !edge) return null;

  const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
  const toNode = nodes.find((n) => n.id === edge.toNodeId);

  const [label, setLabel] = useState(edge.label || '');
  const [color, setColor] = useState(edge.color || '#10b981');
  const [style, setStyle] = useState<'solid' | 'dashed' | 'dotted'>(edge.style || 'solid');
  const [animated, setAnimated] = useState(edge.animated ?? true);
  const [targetNodeId, setTargetNodeId] = useState(edge.toNodeId);

  useEffect(() => {
    if (edge) {
      setLabel(edge.label || '');
      setColor(edge.color || '#10b981');
      setStyle(edge.style || 'solid');
      setAnimated(edge.animated ?? true);
      setTargetNodeId(edge.toNodeId);
    }
  }, [edge]);

  // Valid alternative targets (same step or valid next step as current toNode)
  const candidateTargetNodes = nodes.filter(
    (n) => fromNode && n.id !== fromNode.id && n.step > fromNode.step
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedEdge: CanvasEdge = {
      ...edge,
      label: label.trim() || undefined,
      color,
      style,
      animated,
      toNodeId: targetNodeId,
    };

    onSaveEdge(updatedEdge, targetNodeId !== edge.toNodeId ? targetNodeId : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-[#f5f5f7]">
                编辑分流链接线 (Edge)
              </h3>
              <p className="text-xs text-[#6e6e73] dark:text-[#86868b] truncate">
                调整拓扑连线视觉样式、流向与标签
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Node Connection Flow Preview Card */}
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-[#86868b] uppercase font-mono">起始节点</div>
              <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                {fromNode?.title || '未知来源'}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#86868b] shrink-0" />
            <div className="min-w-0 flex-1 text-right">
              <div className="text-[10px] text-[#86868b] uppercase font-mono">流向目标</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                {toNode?.title || '未知目标'}
              </div>
            </div>
          </div>

          {/* Connection Custom Label */}
          <div>
            <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
              链路备注标签 (Canvas 显示)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例如: 主线路, 故障转移, 4K 专线"
              className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Line Color Picker */}
          <div>
            <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>链路颜色高亮</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs text-left transition-all ${
                    color === c.hex
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                      : 'border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-[#1d1d1f] dark:text-[#f5f5f7]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate text-[11px]">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line Style Options */}
          <div>
            <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5 flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5" />
              <span>线条形态</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'solid', label: '实线 (主链路)' },
                  { id: 'dashed', label: '虚线 (动态)' },
                  { id: 'dotted', label: '点线 (备用)' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStyle(st.id)}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition-all ${
                    style === st.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-black/[0.08] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#86868b]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Particle Animation Switch */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${animated ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] block">
                  动态粒子游动光效
                </span>
                <span className="text-[10px] text-[#86868b] block">
                  在连线上沿贝塞尔曲线流动光斑微粒
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAnimated(!animated)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                animated ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                  animated ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Re-target to another candidate node */}
          {candidateTargetNodes.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-[#6e6e73] dark:text-[#86868b] mb-1.5">
                重定向目标节点 (Re-target)
              </label>
              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {candidateTargetNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    Step {n.step}: {n.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onDeleteEdge(edge.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>断开连线</span>
            </button>

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
                <span>保存连线</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { CanvasNodeData } from '../../types/canvas';
import { 
  Bot, 
  Film, 
  Gamepad2, 
  Globe, 
  ShieldBan, 
  Layers, 
  Radio, 
  Server, 
  Sparkles, 
  GripVertical,
  Trash2,
  Pencil
} from 'lucide-react';

interface CanvasNodeCardProps {
  node: CanvasNodeData;
  isSelected: boolean;
  isDragging?: boolean;
  isActiveInSimulation: boolean;
  simulationStep: number;
  onMouseDown: (e: React.MouseEvent, node: CanvasNodeData) => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string, portType: 'in' | 'out') => void;
  onPortMouseUp: (e: React.MouseEvent, nodeId: string, portType: 'in' | 'out') => void;
  onEditNode?: (node: CanvasNodeData) => void;
  onDeleteNode?: (nodeId: string) => void;
  onToggleEnabled?: (nodeId: string) => void;
}

export const CanvasNodeCard: React.FC<CanvasNodeCardProps> = ({
  node,
  isSelected,
  isDragging = false,
  isActiveInSimulation,
  simulationStep,
  onMouseDown,
  onPortMouseDown,
  onPortMouseUp,
  onEditNode,
  onDeleteNode,
  onToggleEnabled,
}) => {
  // Get Icon
  const getNodeIcon = () => {
    if (node.type === 'inbound') {
      return <Radio className="w-4 h-4 text-sky-400" />;
    }
    if (node.type === 'rule' || node.type === 'custom-rule') {
      if (node.title.includes('AI') || node.title.includes('OpenAI') || node.title.includes('Claude')) {
        return <Bot className="w-4 h-4 text-emerald-400" />;
      }
      if (node.title.includes('流媒体') || node.title.includes('Netflix') || node.title.includes('YouTube')) {
        return <Film className="w-4 h-4 text-rose-400" />;
      }
      if (node.title.includes('游戏') || node.title.includes('Steam')) {
        return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      }
      if (node.title.includes('广告') || node.title.includes('Ad')) {
        return <ShieldBan className="w-4 h-4 text-red-400" />;
      }
      if (node.title.includes('国内') || node.title.includes('DIRECT') || node.title.includes('CN')) {
        return <Globe className="w-4 h-4 text-cyan-400" />;
      }
      return <Layers className="w-4 h-4 text-indigo-400" />;
    }
    if (node.type === 'group') {
      return <Layers className="w-4 h-4 text-purple-400" />;
    }
    if (node.type === 'outbound') {
      if (node.nodeType === 'direct') return <Globe className="w-4 h-4 text-sky-400" />;
      if (node.nodeType === 'reject') return <ShieldBan className="w-4 h-4 text-red-400" />;
      return <Server className="w-4 h-4 text-emerald-400" />;
    }
    return <Layers className="w-4 h-4 text-indigo-400" />;
  };

  const getBorderAndBg = () => {
    if (isActiveInSimulation) {
      return 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-lg shadow-emerald-500/20';
    }
    if (isSelected) {
      return 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/25';
    }
    switch (node.step) {
      case 1:
        return 'border-sky-500/30 bg-white/95 dark:bg-[#0c131a]/90 hover:border-sky-400/60 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]';
      case 2:
        return 'border-indigo-500/30 bg-white/95 dark:bg-[#12131e]/90 hover:border-indigo-400/60 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]';
      case 3:
        return 'border-purple-500/30 bg-white/95 dark:bg-[#14121f]/90 hover:border-purple-400/60 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]';
      case 4:
        return 'border-emerald-500/30 bg-white/95 dark:bg-[#0e1713]/90 hover:border-emerald-400/60 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]';
      default:
        return 'border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#14151c]/90 hover:border-black/[0.16] dark:hover:border-white/[0.16] shadow-sm';
    }
  };

  const getStepBadgeColor = () => {
    switch (node.step) {
      case 1:
        return 'bg-sky-50 dark:bg-sky-500/[0.12] text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/25';
      case 2:
        return 'bg-indigo-50 dark:bg-indigo-500/[0.12] text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/25';
      case 3:
        return 'bg-purple-50 dark:bg-purple-500/[0.12] text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/25';
      case 4:
        return 'bg-emerald-50 dark:bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25';
    }
  };

  return (
    <div
      id={`canvas-node-${node.id}`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: `${node.width}px`,
        height: `${node.height || 125}px`,
      }}
      onMouseDown={(e) => onMouseDown(e, node)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onEditNode) onEditNode(node);
      }}
      className={`absolute top-0 left-0 rounded-2xl border select-none backdrop-blur-2xl group flex flex-col justify-between overflow-visible transition-[border-color,background-color,box-shadow,opacity] duration-150 ${
        isDragging 
          ? 'z-40 shadow-2xl cursor-grabbing ring-2 ring-indigo-500/60' 
          : 'z-10 cursor-grab active:cursor-grabbing hover:shadow-md'
      } ${getBorderAndBg()} ${
        node.enabled === false ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Simulation step pulse highlight */}
      {isActiveInSimulation && (
        <div className="absolute -top-3 -right-2 z-30 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold shadow-lg animate-bounce">
          <Sparkles className="w-3 h-3" />
          <span>Step {node.step} 命中</span>
        </div>
      )}

      {/* Input Port (Left Handle) - For Steps 2, 3, 4 */}
      {node.step > 1 && (
        <div
          id={`port-in-${node.id}`}
          onMouseDown={(e) => {
            e.stopPropagation();
            onPortMouseDown(e, node.id, 'in');
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onPortMouseUp(e, node.id, 'in');
          }}
          className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#161720] border-2 border-indigo-500/80 dark:border-indigo-400/80 flex items-center justify-center cursor-crosshair hover:scale-125 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all z-20 shadow-md group/port"
          title="输入端口：拖动上一步连线至此接入"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-300 group-hover/port:bg-emerald-500 pointer-events-none" />
        </div>
      )}

      {/* Output Port (Right Handle) - For Steps 1, 2, 3 */}
      {node.step < 4 && (
        <div
          id={`port-out-${node.id}`}
          onMouseDown={(e) => {
            e.stopPropagation();
            onPortMouseDown(e, node.id, 'out');
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onPortMouseUp(e, node.id, 'out');
          }}
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#161720] border-2 border-emerald-500/80 dark:border-emerald-400/80 flex items-center justify-center cursor-crosshair hover:scale-125 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-all z-20 shadow-md group/port"
          title="输出端口：按住拖拽连线至下一步节点"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 group-hover/port:bg-emerald-300 pointer-events-none" />
        </div>
      )}

      {/* Card Header */}
      <div className="px-3.5 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.03] rounded-t-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] shrink-0">
            {getNodeIcon()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] truncate flex items-center gap-1.5 tracking-tight">
              <span>{node.title}</span>
              {node.flag && <span className="text-sm">{node.flag}</span>}
            </div>
            <div className="text-[10px] text-[#6e6e73] dark:text-[#86868b] truncate">
              {node.subtitle || `Step ${node.step} • ${node.stepName}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border font-semibold ${getStepBadgeColor()}`}>
            Step {node.step}
          </span>
          
          {/* Edit Button */}
          {onEditNode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditNode(node);
              }}
              className="p-1 rounded-md text-[#86868b] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
              title="编辑卡片配置"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}

          {/* Delete Button (for rules and removable nodes) */}
          {onDeleteNode && (node.type === 'rule' || node.type === 'custom-rule') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
              className="p-1 rounded-md text-[#86868b] hover:text-rose-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
              title="删除此分流规则"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Card Body with specific metadata */}
      <div className="p-3 space-y-2 text-xs">
        {/* Step 1: Inbound Source Details */}
        {node.type === 'inbound' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6e6e73] dark:text-[#86868b] font-medium">监听模式:</span>
              <span className="text-sky-600 dark:text-sky-300 font-mono font-medium">Fake-IP + TUN</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6e6e73] dark:text-[#86868b]">DNS 端口:</span>
              <span className="text-[#1d1d1f] dark:text-[#d4d4d8] font-mono">:7874</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6e6e73] dark:text-[#86868b]">虚拟网卡:</span>
              <span className="text-[#1d1d1f] dark:text-[#d4d4d8] font-mono">utun (System)</span>
            </div>
          </div>
        )}

        {/* Step 2: Rule Node Details */}
        {(node.type === 'rule' || node.type === 'custom-rule') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-white/[0.06] border border-indigo-100 dark:border-white/[0.08] text-indigo-600 dark:text-indigo-300 font-semibold">
                {node.ruleType || 'DOMAIN-SUFFIX'}
              </span>
              <span className="text-[10px] text-[#6e6e73] dark:text-[#a1a1aa] font-mono truncate max-w-[120px]">
                {node.payload}
              </span>
            </div>
            <div className="pt-1.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-[#86868b] dark:text-[#71717a] text-[10px]">调度目标:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] truncate max-w-[130px]">
                {node.targetGroup || '未指定'}
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Policy Group Details */}
        {node.type === 'group' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6e6e73] dark:text-[#86868b]">调度策略:</span>
              <span className="text-purple-600 dark:text-purple-300 font-mono uppercase text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/[0.12] border border-purple-200 dark:border-purple-500/25">
                {node.groupType || 'select'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6e6e73] dark:text-[#86868b]">包含节点:</span>
              <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-mono font-semibold">
                {node.proxyCount || 0} 个
              </span>
            </div>
          </div>
        )}

        {/* Step 4: Outbound Node Details */}
        {node.type === 'outbound' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6e6e73] dark:text-[#86868b]">协议类型:</span>
              <span className="text-emerald-600 dark:text-emerald-300 font-mono uppercase text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/[0.12] border border-emerald-200 dark:border-emerald-500/25">
                {node.nodeType || 'VLESS'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6e6e73] dark:text-[#86868b]">实测延迟:</span>
              <span className={`font-mono font-semibold text-[11px] ${
                !node.latency ? 'text-[#86868b]' :
                node.latency < 50 ? 'text-emerald-600 dark:text-emerald-400' :
                node.latency < 120 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {node.latency ? `${node.latency} ms` : '直连/拦截'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-black/[0.03] dark:bg-black/20 rounded-b-2xl border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[9px] text-[#86868b] dark:text-[#71717a]">
        <span className="flex items-center gap-1">
          <GripVertical className="w-2.5 h-2.5" />
          双击编辑 • 拖拽移动
        </span>
        {node.step < 4 && <span className="text-emerald-600 dark:text-emerald-400 font-medium">端口连线 👉</span>}
      </div>
    </div>
  );
};

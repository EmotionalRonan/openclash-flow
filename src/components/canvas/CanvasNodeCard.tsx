import React from 'react';
import { CanvasNodeData } from '../../types/canvas';
import { 
  Bot, 
  Film, 
  Gamepad2, 
  Globe, 
  ShieldBan, 
  ShieldCheck, 
  Layers, 
  Zap, 
  RefreshCw, 
  Radio, 
  Server, 
  Sparkles, 
  ArrowRight,
  GripVertical,
  CheckCircle2,
  Trash2,
  Lock,
  Wifi
} from 'lucide-react';

interface CanvasNodeCardProps {
  node: CanvasNodeData;
  isSelected: boolean;
  isActiveInSimulation: boolean;
  simulationStep: number;
  onMouseDown: (e: React.MouseEvent, node: CanvasNodeData) => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string, portType: 'in' | 'out') => void;
  onPortMouseUp: (e: React.MouseEvent, nodeId: string, portType: 'in' | 'out') => void;
  onDeleteNode?: (nodeId: string) => void;
  onToggleEnabled?: (nodeId: string) => void;
}

export const CanvasNodeCard: React.FC<CanvasNodeCardProps> = ({
  node,
  isSelected,
  isActiveInSimulation,
  simulationStep,
  onMouseDown,
  onPortMouseDown,
  onPortMouseUp,
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
      if (node.groupType === 'url-test') return <Zap className="w-4 h-4 text-amber-400" />;
      if (node.groupType === 'fallback') return <RefreshCw className="w-4 h-4 text-slate-300" />;
      return <Server className="w-4 h-4 text-indigo-400" />;
    }
    // Outbound
    return <Wifi className="w-4 h-4 text-emerald-400" />;
  };

  // Node styles based on step & simulation
  const getBorderAndBg = () => {
    if (isActiveInSimulation) {
      return 'border-emerald-400 ring-4 ring-emerald-500/30 bg-slate-900 shadow-2xl shadow-emerald-500/20';
    }
    if (isSelected) {
      return 'border-indigo-400 ring-2 ring-indigo-500/40 bg-slate-900 shadow-xl shadow-indigo-500/20';
    }
    switch (node.step) {
      case 1:
        return 'border-sky-500/40 bg-slate-950/90 hover:border-sky-400';
      case 2:
        return 'border-indigo-500/40 bg-slate-950/90 hover:border-indigo-400';
      case 3:
        return 'border-purple-500/40 bg-slate-950/90 hover:border-purple-400';
      case 4:
        return 'border-emerald-500/40 bg-slate-950/90 hover:border-emerald-400';
      default:
        return 'border-slate-800 bg-slate-950/90 hover:border-slate-700';
    }
  };

  const getStepBadgeColor = () => {
    switch (node.step) {
      case 1:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 2:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 3:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 4:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div
      id={`canvas-node-${node.id}`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: `${node.width}px`,
      }}
      onMouseDown={(e) => onMouseDown(e, node)}
      className={`absolute top-0 left-0 rounded-2xl border transition-shadow cursor-grab active:cursor-grabbing select-none backdrop-blur-md z-10 group ${getBorderAndBg()} ${
        node.enabled === false ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Simulation step pulse highlight */}
      {isActiveInSimulation && (
        <div className="absolute -top-3 -right-3 z-30 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold shadow-lg animate-bounce">
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
          className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-400 flex items-center justify-center cursor-crosshair hover:scale-125 hover:border-emerald-400 hover:bg-emerald-950 transition-all z-20 shadow-md group/port"
          title="输入端口：拖动上一步连线至此接入"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 group-hover/port:bg-emerald-300 pointer-events-none" />
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
          className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center cursor-crosshair hover:scale-125 hover:border-emerald-300 hover:bg-emerald-900 transition-all z-20 shadow-md group/port"
          title="输出端口：按住拖拽连线至下一步节点"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/port:bg-white pointer-events-none" />
        </div>
      )}

      {/* Card Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-900/60 rounded-t-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">
            {getNodeIcon()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
              <span>{node.title}</span>
              {node.flag && <span className="text-sm">{node.flag}</span>}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {node.subtitle || `Step ${node.step} • ${node.stepName}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${getStepBadgeColor()}`}>
            Step {node.step}
          </span>
          {onDeleteNode && node.type === 'custom-rule' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="删除此规则节点"
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
              <span className="text-slate-400 font-medium">监听模式:</span>
              <span className="text-sky-300 font-mono font-semibold">Fake-IP + TUN</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">DNS 端口:</span>
              <span className="text-slate-300 font-mono">:7874</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">虚拟网卡:</span>
              <span className="text-slate-300 font-mono">utun (System)</span>
            </div>
          </div>
        )}

        {/* Step 2: Rule Node Details */}
        {(node.type === 'rule' || node.type === 'custom-rule') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                {node.ruleType || 'DOMAIN-SUFFIX'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                {node.payload}
              </span>
            </div>
            <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 text-[10px]">目标策略组:</span>
              <span className="text-emerald-400 font-medium text-[11px] truncate max-w-[130px]">
                {node.targetGroup || '未指定'}
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Policy Group Details */}
        {node.type === 'group' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">调度类型:</span>
              <span className="text-purple-300 font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/50">
                {node.groupType || 'select'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">包含节点数:</span>
              <span className="text-slate-200 font-mono font-bold">
                {node.proxyCount || 0} 个
              </span>
            </div>
          </div>
        )}

        {/* Step 4: Outbound Node Details */}
        {node.type === 'outbound' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">协议类型:</span>
              <span className="text-emerald-300 font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50">
                {node.nodeType || 'VLESS'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">实测延迟:</span>
              <span className={`font-mono font-bold text-[11px] ${
                !node.latency ? 'text-slate-500' :
                node.latency < 50 ? 'text-emerald-400' :
                node.latency < 120 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {node.latency ? `${node.latency} ms` : '直连/拦截'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-slate-950/60 rounded-b-2xl border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500">
        <span className="flex items-center gap-1">
          <GripVertical className="w-2.5 h-2.5" />
          按住可自由拖拽位置
        </span>
        {node.step < 4 && <span className="text-emerald-400">连线 👉</span>}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CanvasEdge, CanvasNodeData } from '../../types/canvas';
import { Trash2 } from 'lucide-react';

interface CanvasWireProps {
  edge: CanvasEdge;
  fromNode?: CanvasNodeData;
  toNode?: CanvasNodeData;
  isActive: boolean;
  onDeleteEdge?: (edgeId: string) => void;
}

export const CanvasWire: React.FC<CanvasWireProps> = ({
  edge,
  fromNode,
  toNode,
  isActive,
  onDeleteEdge,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!fromNode || !toNode) return null;

  // Calculate coordinates:
  // fromNode right-middle handle: (fromNode.x + fromNode.width, fromNode.y + fromNode.height / 2)
  // toNode left-middle handle: (toNode.x, toNode.y + toNode.height / 2)
  const x1 = fromNode.x + fromNode.width;
  const y1 = fromNode.y + (fromNode.height || 140) / 2;

  const x2 = toNode.x;
  const y2 = toNode.y + (toNode.height || 140) / 2;

  // Control points for smooth horizontal cubic bezier
  const dx = Math.max(Math.abs(x2 - x1) * 0.5, 40);
  const cx1 = x1 + dx;
  const cy1 = y1;
  const cx2 = x2 - dx;
  const cy2 = y2;

  const pathString = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  
  // Midpoint for badge / delete button
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g 
      className="cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible wider hit area for easy hover */}
      <path
        d={pathString}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
      />

      {/* Main Bezier Wire */}
      <path
        d={pathString}
        fill="none"
        stroke={
          isActive
            ? '#10b981' // Neon Emerald
            : isHovered
            ? '#818cf8' // Indigo 400
            : edge.color || '#334155' // Slate 700
        }
        strokeWidth={isActive ? 3.5 : isHovered ? 2.5 : 1.75}
        strokeDasharray={isActive ? '6,6' : undefined}
        className={isActive ? 'animate-[dash_1s_linear_infinite]' : 'transition-colors duration-200'}
      />

      {/* Animated Flow Particle along path when active */}
      {isActive && (
        <circle r="4" fill="#34d399" className="filter drop-shadow-[0_0_8px_#10b981]">
          <animateMotion
            path={pathString}
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Hover delete button / label on midpoint */}
      {isHovered && onDeleteEdge && (
        <foreignObject
          x={midX - 14}
          y={midY - 14}
          width={28}
          height={28}
          className="overflow-visible"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteEdge(edge.id);
            }}
            className="w-7 h-7 rounded-full bg-slate-900 border border-rose-500/80 text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
            title="断开此分流连线"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </foreignObject>
      )}
    </g>
  );
};

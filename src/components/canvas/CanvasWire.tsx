import React, { useState } from 'react';
import { CanvasEdge, CanvasNodeData } from '../../types/canvas';
import { Trash2, Pencil } from 'lucide-react';

interface CanvasWireProps {
  edge: CanvasEdge;
  fromNode?: CanvasNodeData;
  toNode?: CanvasNodeData;
  isActive: boolean;
  isSelected?: boolean;
  onSelectEdge?: (edgeId: string) => void;
  onEditEdge?: (edge: CanvasEdge) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

export const CanvasWire: React.FC<CanvasWireProps> = ({
  edge,
  fromNode,
  toNode,
  isActive,
  isSelected = false,
  onSelectEdge,
  onEditEdge,
  onDeleteEdge,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!fromNode || !toNode) return null;

  // Calculate coordinates:
  // fromNode right-middle handle: (fromNode.x + fromNode.width, fromNode.y + fromNode.height / 2)
  // toNode left-middle handle: (toNode.x, toNode.y + toNode.height / 2)
  const x1 = fromNode.x + fromNode.width;
  const y1 = fromNode.y + (fromNode.height || 125) / 2;

  const x2 = toNode.x;
  const y2 = toNode.y + (toNode.height || 125) / 2;

  // Control points for smooth horizontal cubic bezier
  const dx = Math.max(Math.abs(x2 - x1) * 0.5, 40);
  const cx1 = x1 + dx;
  const cy1 = y1;
  const cx2 = x2 - dx;
  const cy2 = y2;

  const pathString = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  
  // Midpoint for badge / buttons
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Stroke Dasharray calculation
  const getDashArray = () => {
    if (isActive) return '6,6';
    if (edge.style === 'dashed') return '8,6';
    if (edge.style === 'dotted') return '3,4';
    return undefined;
  };

  const wireColor = isActive
    ? '#10b981' // Neon Emerald
    : isSelected
    ? '#a855f7' // Purple 500
    : isHovered
    ? '#818cf8' // Indigo 400
    : edge.color || '#475569'; // Custom or Slate 600

  const shouldAnimateParticle = isActive || (edge.animated && !isActive);

  return (
    <g 
      className="cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectEdge) onSelectEdge(edge.id);
      }}
    >
      {/* Invisible wider hit area for easy hover & click */}
      <path
        d={pathString}
        fill="none"
        stroke="transparent"
        strokeWidth={22}
      />

      {/* Selected glowing aura */}
      {isSelected && (
        <path
          d={pathString}
          fill="none"
          stroke="#a855f7"
          strokeWidth={7}
          strokeOpacity={0.35}
          className="animate-pulse"
        />
      )}

      {/* Main Bezier Wire */}
      <path
        d={pathString}
        fill="none"
        stroke={wireColor}
        strokeWidth={isActive ? 3.5 : isSelected ? 3 : isHovered ? 2.5 : 1.75}
        strokeDasharray={getDashArray()}
        className={isActive ? 'animate-[dash_1s_linear_infinite]' : 'transition-colors duration-150'}
      />

      {/* Animated Flow Particle along path */}
      {shouldAnimateParticle && (
        <circle 
          r={isActive ? 4.5 : 3} 
          fill={isActive ? '#34d399' : wireColor} 
          className="filter drop-shadow-[0_0_6px_currentColor]"
        >
          <animateMotion
            path={pathString}
            dur={isActive ? '1.2s' : '2.5s'}
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Custom Label Pill (if defined) */}
      {edge.label && !isHovered && !isSelected && (
        <foreignObject
          x={midX - 50}
          y={midY - 11}
          width={100}
          height={22}
          className="overflow-visible pointer-events-none"
        >
          <div className="flex justify-center">
            <span 
              className="px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md shadow-sm border truncate max-w-[96px]"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#f8fafc',
                borderColor: wireColor,
              }}
            >
              {edge.label}
            </span>
          </div>
        </foreignObject>
      )}

      {/* Hover or Selected Control Toolbar (Edit & Delete) */}
      {(isHovered || isSelected) && (
        <foreignObject
          x={midX - 38}
          y={midY - 16}
          width={76}
          height={32}
          className="overflow-visible z-30"
        >
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/20 shadow-xl">
            {/* Edit Button */}
            {onEditEdge && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditEdge(edge);
                }}
                className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow transition-all hover:scale-110"
                title="编辑连线属性与标签"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}

            {/* Delete Button */}
            {onDeleteEdge && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEdge(edge.id);
                }}
                className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow transition-all hover:scale-110"
                title="断开此分流连线"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

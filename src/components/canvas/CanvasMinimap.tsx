import React from 'react';
import { CanvasNodeData } from '../../types/canvas';

interface CanvasMinimapProps {
  nodes: CanvasNodeData[];
  pan: { x: number; y: number };
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  onNavigate?: (x: number, y: number) => void;
}

export const CanvasMinimap: React.FC<CanvasMinimapProps> = ({
  nodes,
  pan,
  zoom,
  canvasWidth,
  canvasHeight,
}) => {
  // Minimap bounds
  const minimapWidth = 180;
  const minimapHeight = 120;

  // World bounds approximation
  const minX = -100;
  const maxX = 1600;
  const minY = -100;
  const maxY = 1000;

  const worldWidth = maxX - minX;
  const worldHeight = maxY - minY;

  const scaleX = minimapWidth / worldWidth;
  const scaleY = minimapHeight / worldHeight;

  // Viewport box on minimap
  // In world coordinates, top-left is (-pan.x / zoom), bottom-right is (-pan.x + canvasWidth) / zoom
  const vpWorldX = -pan.x / zoom;
  const vpWorldY = -pan.y / zoom;
  const vpWorldW = canvasWidth / zoom;
  const vpWorldH = canvasHeight / zoom;

  const vpMiniX = Math.max(0, (vpWorldX - minX) * scaleX);
  const vpMiniY = Math.max(0, (vpWorldY - minY) * scaleY);
  const vpMiniW = Math.min(minimapWidth, vpWorldW * scaleX);
  const vpMiniH = Math.min(minimapHeight, vpWorldH * scaleY);

  return (
    <div className="absolute bottom-4 right-4 z-30 bg-slate-950/90 border border-slate-800 rounded-xl p-2 shadow-2xl backdrop-blur-md hidden sm:block pointer-events-auto select-none">
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5 px-0.5">
        <span className="font-semibold">拓扑小地图 (Minimap)</span>
        <span className="text-indigo-400 font-bold">{Math.round(zoom * 100)}%</span>
      </div>

      <div
        style={{ width: `${minimapWidth}px`, height: `${minimapHeight}px` }}
        className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800/80"
      >
        {/* Step divider zones */}
        <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-20">
          <div className="border-r border-slate-700 bg-sky-500/10" />
          <div className="border-r border-slate-700 bg-indigo-500/10" />
          <div className="border-r border-slate-700 bg-purple-500/10" />
          <div className="bg-emerald-500/10" />
        </div>

        {/* Nodes representations */}
        {nodes.map((node) => {
          const nx = (node.x - minX) * scaleX;
          const ny = (node.y - minY) * scaleY;
          const nw = Math.max(4, node.width * scaleX);
          const nh = Math.max(3, (node.height || 140) * scaleY);

          let color = '#818cf8';
          if (node.step === 1) color = '#38bdf8';
          if (node.step === 2) color = '#818cf8';
          if (node.step === 3) color = '#c084fc';
          if (node.step === 4) color = '#34d399';

          return (
            <div
              key={node.id}
              style={{
                left: `${nx}px`,
                top: `${ny}px`,
                width: `${nw}px`,
                height: `${nh}px`,
                backgroundColor: color,
              }}
              className="absolute rounded-sm opacity-80"
            />
          );
        })}

        {/* Viewport Frame */}
        <div
          style={{
            left: `${vpMiniX}px`,
            top: `${vpMiniY}px`,
            width: `${vpMiniW}px`,
            height: `${vpMiniH}px`,
          }}
          className="absolute border border-indigo-400 bg-indigo-500/15 rounded pointer-events-none transition-all"
        />
      </div>
    </div>
  );
};

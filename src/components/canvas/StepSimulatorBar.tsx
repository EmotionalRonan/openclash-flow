import React from 'react';
import { StepSimulationState } from '../../types/canvas';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Sparkles, 
  Radio, 
  Layers, 
  Server, 
  Wifi,
  ChevronRight,
  Info
} from 'lucide-react';

interface StepSimulatorBarProps {
  simState: StepSimulationState;
  onTargetChange: (query: string) => void;
  onStartSimulation: () => void;
  onNextStep: () => void;
  onResetSimulation: () => void;
  onToggleAutoPlay: () => void;
  isAutoPlaying: boolean;
}

export const StepSimulatorBar: React.FC<StepSimulatorBarProps> = ({
  simState,
  onTargetChange,
  onStartSimulation,
  onNextStep,
  onResetSimulation,
  onToggleAutoPlay,
  isAutoPlaying,
}) => {
  const quickTestTargets = [
    { label: '🤖 ChatGPT', domain: 'api.openai.com' },
    { label: '🎬 Netflix', domain: 'netflix.com' },
    { label: '🎮 Steam', domain: 'steampowered.com' },
    { label: '🛡️ 广告拦截', domain: 'adservice.google.com' },
    { label: '🇨🇳 B站直连', domain: 'bilibili.com' },
  ];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3">
      {/* Top row: Target Input & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>单步仿真回放</span>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={simState.targetQuery}
              onChange={(e) => onTargetChange(e.target.value)}
              placeholder="输入待测试域名或 IP (如 api.openai.com, netflix.com, 114.114.114.114)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Quick preset chips */}
          <div className="hidden xl:flex items-center gap-1.5">
            {quickTestTargets.map((item) => (
              <button
                key={item.domain}
                onClick={() => onTargetChange(item.domain)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  simState.targetQuery === item.domain
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {!simState.isActive ? (
            <button
              onClick={onStartSimulation}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>开始回放仿真</span>
            </button>
          ) : (
            <>
              <button
                onClick={onToggleAutoPlay}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isAutoPlaying
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoPlaying ? '暂停' : '连续播放'}</span>
              </button>

              <button
                onClick={onNextStep}
                disabled={simState.currentStep >= 4}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-all"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>下一步 (Step {Math.min(4, simState.currentStep + 1)})</span>
              </button>

              <button
                onClick={onResetSimulation}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="重置仿真"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Step Indicator with live status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
        {/* Step 1 */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            simState.currentStep >= 1
              ? 'bg-sky-950/40 border-sky-500/60 ring-1 ring-sky-500/30'
              : 'bg-slate-950/40 border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
              <Radio className="w-3 h-3" />
              Step 1: 流量捕获
            </span>
            {simState.currentStep >= 1 && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">
                OK
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 font-mono truncate">
            {simState.details.inbound || '等待流量发起...'}
          </p>
        </div>

        {/* Step 2 */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            simState.currentStep >= 2
              ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
              : 'bg-slate-950/40 border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Step 2: 规则匹配
            </span>
            {simState.currentStep >= 2 && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                HIT
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 font-mono truncate">
            {simState.details.matchedRule || '扫描规则树...'}
          </p>
        </div>

        {/* Step 3 */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            simState.currentStep >= 3
              ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/30'
              : 'bg-slate-950/40 border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
              <Server className="w-3 h-3" />
              Step 3: 策略组调度
            </span>
            {simState.currentStep >= 3 && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                ROUTED
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 font-mono truncate">
            {simState.details.selectedGroup || '解析调度策略...'}
          </p>
        </div>

        {/* Step 4 */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            simState.currentStep >= 4
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
              : 'bg-slate-950/40 border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Step 4: 物理出口
            </span>
            {simState.currentStep >= 4 && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                FINAL
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 font-mono truncate">
            {simState.details.outboundNode || '建立代理会话...'}
          </p>
        </div>
      </div>

      {/* Explanation banner if active */}
      {simState.explanation && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">决策步骤解析：</span>
            <span> {simState.explanation}</span>
          </div>
        </div>
      )}
    </div>
  );
};

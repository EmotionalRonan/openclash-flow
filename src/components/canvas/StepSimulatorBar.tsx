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
    <div className="apple-glass rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 border border-black/[0.08] dark:border-white/[0.08]">
      {/* Top row: Target Input & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/[0.12] border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>单步仿真回放</span>
          </div>

          <div className="relative flex-1">
            <input
              type="text"
              value={simState.targetQuery}
              onChange={(e) => onTargetChange(e.target.value)}
              placeholder="输入测试域名/IP (如 api.openai.com, netflix.com)..."
              className="w-full bg-slate-100 dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#1d1d1f] dark:text-[#f5f5f7] font-mono placeholder:text-[#86868b] dark:placeholder:text-[#71717a] focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Quick preset chips - Desktop */}
          <div className="hidden xl:flex items-center gap-1.5">
            {quickTestTargets.map((item) => (
              <button
                key={item.domain}
                onClick={() => onTargetChange(item.domain)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-all apple-press border ${
                  simState.targetQuery === item.domain
                    ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border-black/[0.06] dark:border-white/[0.08]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick preset chips - Mobile & Tablet Horizontal Scroll */}
        <div className="flex xl:hidden overflow-x-auto scrollbar-none py-0.5 gap-1.5 w-full">
          {quickTestTargets.map((item) => (
            <button
              key={item.domain}
              onClick={() => onTargetChange(item.domain)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] whitespace-nowrap font-medium transition-all apple-press border shrink-0 ${
                simState.targetQuery === item.domain
                  ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-sm'
                  : 'bg-slate-100 dark:bg-white/[0.04] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border-black/[0.06] dark:border-white/[0.08]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-end lg:self-auto justify-end">
          {!simState.isActive ? (
            <button
              onClick={onStartSimulation}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#30d158] hover:bg-[#34c759] text-black text-xs font-semibold shadow-lg shadow-emerald-500/20 apple-press transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>开始回放仿真</span>
            </button>
          ) : (
            <>
              <button
                onClick={onToggleAutoPlay}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border apple-press transition-all ${
                  isAutoPlaying
                    ? 'bg-amber-500/[0.15] text-amber-600 dark:text-amber-300 border-amber-500/40'
                    : 'bg-slate-100 dark:bg-white/[0.06] text-[#1d1d1f] dark:text-[#e4e4e7] hover:bg-slate-200 dark:hover:bg-white/[0.1] border-black/[0.08] dark:border-white/[0.08]'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoPlaying ? '暂停' : '连续播放'}</span>
              </button>

              <button
                onClick={onNextStep}
                disabled={simState.currentStep >= 4}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold shadow-md apple-press transition-all"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>下一步 (Step {Math.min(4, simState.currentStep + 1)})</span>
              </button>

              <button
                onClick={onResetSimulation}
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#a1a1aa] hover:text-[#1d1d1f] dark:hover:text-white border border-black/[0.08] dark:border-white/[0.08] apple-press transition-colors"
                title="重置仿真"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pipeline Step Indicator with live status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
        {/* Step 1 */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            simState.currentStep >= 1
              ? 'bg-sky-50 dark:bg-sky-500/[0.1] border-sky-300 dark:border-sky-500/40 ring-1 ring-sky-500/20'
              : 'bg-slate-50/80 dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 tracking-tight">
              <Radio className="w-3 h-3" />
              Step 1: 流量捕获
            </span>
            {simState.currentStep >= 1 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold">
                OK
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#1d1d1f] dark:text-[#d4d4d8] mt-1 font-mono truncate">
            {simState.details.inbound || '等待流量发起...'}
          </p>
        </div>

        {/* Step 2 */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            simState.currentStep >= 2
              ? 'bg-indigo-50 dark:bg-indigo-500/[0.1] border-indigo-300 dark:border-indigo-500/40 ring-1 ring-indigo-500/20'
              : 'bg-slate-50/80 dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 tracking-tight">
              <Layers className="w-3 h-3" />
              Step 2: 规则匹配
            </span>
            {simState.currentStep >= 2 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold">
                HIT
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#1d1d1f] dark:text-[#d4d4d8] mt-1 font-mono truncate">
            {simState.details.matchedRule || '扫描规则树...'}
          </p>
        </div>

        {/* Step 3 */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            simState.currentStep >= 3
              ? 'bg-purple-50 dark:bg-purple-500/[0.1] border-purple-300 dark:border-purple-500/40 ring-1 ring-purple-500/20'
              : 'bg-slate-50/80 dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 tracking-tight">
              <Server className="w-3 h-3" />
              Step 3: 策略组调度
            </span>
            {simState.currentStep >= 3 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold">
                ROUTED
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#1d1d1f] dark:text-[#d4d4d8] mt-1 font-mono truncate">
            {simState.details.selectedGroup || '解析调度策略...'}
          </p>
        </div>

        {/* Step 4 */}
        <div
          className={`p-3 rounded-2xl border transition-all ${
            simState.currentStep >= 4
              ? 'bg-emerald-50 dark:bg-emerald-500/[0.1] border-emerald-300 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-slate-50/80 dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 tracking-tight">
              <Wifi className="w-3 h-3" />
              Step 4: 物理出口
            </span>
            {simState.currentStep >= 4 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                FINAL
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#1d1d1f] dark:text-[#d4d4d8] mt-1 font-mono truncate">
            {simState.details.outboundNode || '建立代理会话...'}
          </p>
        </div>
      </div>

      {/* Explanation banner if active */}
      {simState.explanation && (
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] flex items-start gap-2.5 text-xs text-[#1d1d1f] dark:text-[#d4d4d8]">
          <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">决策步骤解析：</span>
            <span> {simState.explanation}</span>
          </div>
        </div>
      )}
    </div>
  );
};

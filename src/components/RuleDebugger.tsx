import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Cpu, 
  Server, 
  Layers, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
import { TrafficRule, PolicyGroup, ProxyNode, SimulationResult } from '../types/openclash';
import { simulateTrafficRoute } from '../utils/ruleMatcher';

interface RuleDebuggerProps {
  rules: TrafficRule[];
  policyGroups: PolicyGroup[];
  proxies: ProxyNode[];
}

export const RuleDebugger: React.FC<RuleDebuggerProps> = ({
  rules,
  policyGroups,
  proxies,
}) => {
  const [testInput, setTestInput] = useState('api.openai.com');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(() =>
    simulateTrafficRoute('api.openai.com', rules, policyGroups, proxies)
  );
  const [isEvaluating, setIsEvaluating] = useState(false);

  const quickSamples = [
    { label: '🤖 OpenAI API', val: 'api.openai.com', note: '测试大模型分流' },
    { label: '🎬 Netflix 视频', val: 'www.netflix.com', note: '测试海外流媒体' },
    { label: '📺 哔哩哔哩', val: 'api.bilibili.com', note: '测试国内直连' },
    { label: '🎮 Steam 商店', val: 'store.steampowered.com', note: '测试游戏加速' },
    { label: '🛡️ Google 广告', val: 'pagead2.googlesyndication.com', note: '测试广告拦截' },
    { label: '🏠 局域网私网', val: '192.168.1.150', note: '测试内网 IP-CIDR' },
    { label: '💬 Telegram', val: 'api.telegram.org', note: '测试社交平台' },
    { label: '💻 GitHub Raw', val: 'raw.githubusercontent.com', note: '测试开发者加速' },
  ];

  const handleRunSimulation = (targetVal?: string) => {
    const query = (targetVal || testInput).trim();
    if (!query) return;

    setIsEvaluating(true);
    setTimeout(() => {
      const res = simulateTrafficRoute(query, rules, policyGroups, proxies);
      setSimulationResult(res);
      setIsEvaluating(false);
    }, 250);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          网络流量策略即时调试器 (Traffic Simulator)
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
            毫秒级精准仿真
          </span>
        </h2>
        <p className="text-xs text-slate-400">
          输入任意域名或 IP 地址，即刻查看 OpenClash 内核从 DNS 劫持、规则逐级扫描、策略组优选到物理节点的完整决策链路
        </p>
      </div>

      {/* Input & Quick Presets Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
              placeholder="输入待测试的域名或 IP 地址 (如 api.anthropic.com, 1.1.1.1, 10.0.0.1)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            id="btn-run-simulation"
            disabled={isEvaluating}
            onClick={() => handleRunSimulation()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 text-amber-300 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? '仿真运算中...' : '即时模拟路由'}</span>
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="space-y-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            快速测试预设场景:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickSamples.map((sample) => (
              <button
                key={sample.val}
                onClick={() => {
                  setTestInput(sample.val);
                  handleRunSimulation(sample.val);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>{sample.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">({sample.val})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Result Timeline */}
      {simulationResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in duration-200">
          
          {/* Result Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                <span>测试目标:</span>
                <span className="text-white font-bold text-sm bg-slate-800 px-2 py-0.5 rounded">
                  {simulationResult.target}
                </span>
                <span className="text-[10px] text-slate-500">
                  ({simulationResult.isDomain ? '域名' : '物理 IP'})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                命中规则: <code className="text-indigo-300 font-mono">{simulationResult.matchedRule?.type} {simulationResult.matchedRule?.payload}</code>
              </p>
            </div>

            {/* Target Outcome Pill */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">最终路由出口</span>
                <span className="text-sm font-bold text-emerald-300 font-mono">
                  {simulationResult.targetGroup}
                </span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">物理出站链路</span>
                <span className="text-xs font-semibold text-white font-mono flex items-center gap-1">
                  {simulationResult.selectedNode?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Stepped Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              OpenClash 核心执行步骤回放 (Execution Trace)
            </h3>

            <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {simulationResult.evaluationSteps.map((step) => {
                const isHit = step.status === 'hit';
                const isFinal = step.status === 'final';

                return (
                  <div key={step.step} className="relative pl-10 group">
                    {/* Step Icon */}
                    <div
                      className={`absolute left-2 top-1.5 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-slate-900 ${
                        isFinal
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : isHit
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {step.step}
                    </div>

                    {/* Step Content Card */}
                    <div
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        isFinal
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : isHit
                          ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className={isFinal ? 'text-emerald-300' : isHit ? 'text-indigo-300' : 'text-white'}>
                          {step.title}
                        </span>
                        <span className="text-[10px] font-mono opacity-60">
                          {isFinal ? 'DONE' : isHit ? 'MATCHED' : 'PASS'}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-400 leading-relaxed font-mono text-[11px]">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

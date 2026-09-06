import React from 'react';
import { 
  X, 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Layers, 
  Zap, 
  Server, 
  Wifi, 
  CheckCircle2, 
  Play, 
  Router,
  ExternalLink,
  MousePointer,
  HelpCircle
} from 'lucide-react';
import { PolicyGroup, ProxyNode, TrafficRule } from '../types/openclash';

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCaseTopology: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  isOpen,
  onClose,
  onApplyCaseTopology,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5 my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <span>实战案例与操作说明</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 font-medium">
                  Step by Step
                </span>
              </h2>
              <p className="text-xs text-[#6e6e73] dark:text-slate-400">
                案例目标：将 ChatGPT / AI 流量精准分流至香港 IPLC 专线，国内流量走直连
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#6e6e73] dark:text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topology Overview Diagram */}
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-slate-950/80 border border-black/[0.06] dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#1d1d1f] dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              流水分流拓扑简图 (Flow Pipeline)
            </span>
            <span className="text-[10px] text-[#86868b] dark:text-slate-500 font-mono">4 级处理管道</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-200 shadow-sm">
              <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono font-medium">Step 1 入口层</div>
              <div className="font-bold mt-0.5">TUN + Fake-IP</div>
              <div className="text-[10px] text-sky-700/70 dark:text-slate-400 mt-1">捕获局域网请求</div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200 shadow-sm">
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">Step 2 规则匹配</div>
              <div className="font-bold mt-0.5">api.openai.com</div>
              <div className="text-[10px] text-indigo-700/70 dark:text-slate-400 mt-1">命中 DOMAIN-SUFFIX</div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-200 shadow-sm">
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-medium">Step 3 策略组</div>
              <div className="font-bold mt-0.5">🚀 节点选择</div>
              <div className="text-[10px] text-purple-700/70 dark:text-slate-400 mt-1">调度指向香港专线</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 shadow-sm">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">Step 4 物理出口</div>
              <div className="font-bold mt-0.5">🇭🇰 香港 IPLC 01</div>
              <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400 mt-1">28ms 延迟出境</div>
            </div>
          </div>
        </div>

        {/* Step by Step Operations Guide */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#1d1d1f] dark:text-slate-300 uppercase tracking-wider">
            具体操作步骤（鼠标或触屏均可轻松完成）：
          </h3>

          <div className="space-y-2.5 text-xs">
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-slate-950/80 border border-black/[0.06] dark:border-slate-800/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center shrink-0 font-bold font-mono text-[11px]">
                1
              </div>
              <div className="space-y-1">
                <div className="font-bold text-[#1d1d1f] dark:text-slate-200 flex items-center gap-1.5">
                  <span>从左侧资源库添加或创建规则</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/[0.04] dark:bg-slate-800 text-[#6e6e73] dark:text-slate-400">操作</span>
                </div>
                <p className="text-[#6e6e73] dark:text-slate-400 leading-relaxed">
                  点击画布左侧的「<strong className="text-[#1d1d1f] dark:text-slate-200">画布节点资源库</strong>」展开抽屉，在搜索框输入 <code className="text-indigo-600 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-slate-900 px-1 py-0.5 rounded border border-indigo-200/50 dark:border-transparent">openai</code>。
                  找到 <strong className="text-[#1d1d1f] dark:text-slate-200">OpenAI / ChatGPT</strong> 预设卡片，点击右侧的「<strong className="text-indigo-600 dark:text-indigo-400">+ 添加</strong>」按钮，或者直接按住卡片拖放到画布中间。
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-slate-950/80 border border-black/[0.06] dark:border-slate-800/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center shrink-0 font-bold font-mono text-[11px]">
                2
              </div>
              <div className="space-y-1">
                <div className="font-bold text-[#1d1d1f] dark:text-slate-200 flex items-center gap-1.5">
                  <span>鼠标连线绑定策略组（端点连接）</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">连线</span>
                </div>
                <p className="text-[#6e6e73] dark:text-slate-400 leading-relaxed">
                  在刚添加的规则卡片右边缘，找到<strong className="text-emerald-600 dark:text-emerald-400">绿色圆形输出端口</strong>，按住并拖出一条绿色发光贝塞尔曲线，移动至【Step 3: 策略调度层】的【<strong className="text-[#1d1d1f] dark:text-slate-200">🚀 节点选择 (PROXY)</strong>】左边缘<strong className="text-indigo-600 dark:text-indigo-400">紫色输入端点</strong>松开，连线即建立成功！
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-slate-950/80 border border-black/[0.06] dark:border-slate-800/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center shrink-0 font-bold font-mono text-[11px]">
                3
              </div>
              <div className="space-y-1">
                <div className="font-bold text-[#1d1d1f] dark:text-slate-200 flex items-center gap-1.5">
                  <span>实时单步仿真测试（即时验证）</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">仿真</span>
                </div>
                <p className="text-[#6e6e73] dark:text-slate-400 leading-relaxed">
                  在画布顶部的【单步仿真回放】栏中，点击预设标签【<strong className="text-[#1d1d1f] dark:text-slate-200">🤖 ChatGPT</strong>】（或直接在输入框输入想要测试的任意域名），点击右侧绿色的【<strong className="text-emerald-600 dark:text-emerald-400">开始回放仿真</strong>】按钮。
                  画布上的节点与连线将逐级点亮发光，清晰展示流量从 Fake-IP 到出口节点的毫秒流转！
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-slate-950/80 border border-black/[0.06] dark:border-slate-800/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center shrink-0 font-bold font-mono text-[11px]">
                4
              </div>
              <div className="space-y-1">
                <div className="font-bold text-[#1d1d1f] dark:text-slate-200 flex items-center gap-1.5">
                  <span>一键生成配置并同步到 OpenClash</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300">生效</span>
                </div>
                <p className="text-[#6e6e73] dark:text-slate-400 leading-relaxed">
                  切换到顶部导航栏的「<strong className="text-[#1d1d1f] dark:text-slate-200">配置与 IPK</strong>」面板，点击「<strong className="text-indigo-600 dark:text-indigo-400">一键保存并同步到路由器 OpenClash</strong>」按钮。系统会自动生成标准的 Clash YAML 语法配置，路由器即刻生效无缝分流。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="text-[11px] text-[#6e6e73] dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>支持触屏双指缩放、自适应居中与泳道视图任意切换</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-black/[0.05] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-slate-200 text-xs font-semibold apple-press transition-colors"
            >
              我知道了
            </button>
            <button
              onClick={() => {
                onApplyCaseTopology();
                onClose();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 apple-press transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>一键载入该案例拓扑</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

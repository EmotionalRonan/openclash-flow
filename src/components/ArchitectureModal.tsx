import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Database, 
  Globe, 
  FileCode2, 
  Radio, 
  Workflow, 
  Box, 
  X
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeView, setActiveView] = useState<'modules' | 'flowchart' | 'networkPlane'>('flowchart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                OpenClash Flow 系统架构设计方案与交互流程图
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-normal border border-cyan-500/30">
                  ImmortalWRT 适配
                </span>
              </h2>
              <p className="text-xs text-slate-400">模块化解耦设计，实现从“复杂UCI脚本配置”到“一键可视化分流编排”的现代化升级</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveView('flowchart')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeView === 'flowchart'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                交互流程图
              </button>
              <button
                onClick={() => setActiveView('modules')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeView === 'modules'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                功能模块设计
              </button>
              <button
                onClick={() => setActiveView('networkPlane')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeView === 'networkPlane'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                路由器内核数据面
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
          
          {/* VIEW 1: INTERACTION FLOWCHART */}
          {activeView === 'flowchart' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    端到端全链路交互工作流 (Flowchart)
                  </h3>
                  <span className="text-[11px] text-slate-400">Web UI ↔ 策略编译器 ↔ 路由器 OpenClash 内核</span>
                </div>

                {/* Interactive Flow Diagram Graph */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                  
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">1</span>
                        <span>数据录入与编排</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                        • 粘贴订阅链接 / Base64<br/>
                        • 拖拽域名/IP到策略组<br/>
                        • 调整分流优先级
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-indigo-300 font-medium">
                      🎯 前端轻量画布响应
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">2</span>
                        <span>AST 编译与校验</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                        • 规范化规则语法树<br/>
                        • 节点延迟与协议映射<br/>
                        • 生成标准 YAML / UCI
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-cyan-300 font-medium">
                      ⚙️ 自动容错与格式对齐
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                        <span>ImmortalWRT 同步</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                        • External API (:9090)<br/>
                        • 覆盖 /etc/openclash<br/>
                        • 热重载 / 重启内核
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-emerald-300 font-medium">
                      🚀 0 停机秒级热应用
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 relative flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">4</span>
                        <span>即时观测与仿真调试</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                        • 实时 DNS & 流量日志<br/>
                        • 域名/IP 命中回放测试<br/>
                        • 节点测速与链路追踪
                      </div>
                    </div>
                    <div className="mt-3 text-[10px] text-purple-300 font-medium">
                      📡 毫秒级反馈与排障
                    </div>
                  </div>

                </div>
              </div>

              {/* Detailed Sequence Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    1. 策略配置与编译管道
                  </h4>
                  <p className="text-slate-400">
                    用户在拖拽界面操作时，系统维护内部统一的 <code className="text-indigo-300 bg-indigo-950/50 px-1 rounded">TrafficRule[]</code> 与 <code className="text-indigo-300 bg-indigo-950/50 px-1 rounded">PolicyGroup[]</code> 数据模型。
                    通过自适应编译器，将其转换为符合 OpenClash Meta / Premium 规范的 YAML 配置和 UCI 脚本，避免传统 LuCI 界面下多层跳转配置导致的逻辑断层。
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    2. ImmortalWRT 通信与双模同步
                  </h4>
                  <p className="text-slate-400">
                    支持两种同步模式：
                    <br/><b>① API 直连热加载</b>：通过 RESTful API（基于 Secret 认证）与路由器 9090 控制器直连，调用 <code className="text-emerald-300 bg-emerald-950/50 px-1 rounded">PUT /configs</code> 无缝切换。
                    <br/><b>② UCI 脚本一键应用</b>：自动生成 <code className="text-emerald-300 bg-emerald-950/50 px-1 rounded">uci set openclash...</code> 命令行，适配无公网暴露的内网路由器。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: FUNCTIONAL MODULES BREAKDOWN */}
          {activeView === 'modules' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Module 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>模块 1: 可视化拖拽编排层</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>分类规则卡片库 (AI、流媒体、游戏、广告拦截、国内直连)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>策略组目标容器 (支持拖拽归类、跨组移动与一键分配)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>自定义 Domain / IP-CIDR / GeoIP / Port 快速录入</span>
                    </li>
                  </ul>
                </div>

                {/* Module 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Radio className="w-4 h-4" />
                    <span>模块 2: 一键订阅与节点解析引擎</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>多协议支持: VLESS, Trojan, Hysteria2, VMess, SS, TUIC</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>Base64 订阅文本 / Clash YAML / 单链接自动解析</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>自动按国家/地区归类分组 (HK, JP, US, SG, TW) 与测速</span>
                    </li>
                  </ul>
                </div>

                {/* Module 3 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <FileCode2 className="w-4 h-4" />
                    <span>模块 3: OpenClash YAML/UCI 编译器</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>遵循 OpenClash 规范，生成完整 Fake-IP & TUN 规则树</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>DNS 防污染 Nameserver / Fallback-filter 策略自动注入</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>提供一键下载 .yaml 与一键复制 UCI 脚本</span>
                    </li>
                  </ul>
                </div>

                {/* Module 4 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>模块 4: 实时流量与 DNS 日志引擎</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>毫秒级捕获 DNS 解析、规则匹配与出站链路日志</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>按级别过滤 (INFO, DNS, MATCH, WARN, ERROR) 与全局关键词检索</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>支持日志流暂停、速率调节、清空与一键导出</span>
                    </li>
                  </ul>
                </div>

                {/* Module 5 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>模块 5: 流量命中即时仿真调试器</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>输入任意测试域名或 IP，模拟完整 OpenClash 路由决策</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>逐步展示: DNS Fake-IP -&gt; 规则级联匹配 -&gt; 策略组 -&gt; 物理节点</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>即时检验分流漏网、规则冲突与兜底行为</span>
                    </li>
                  </ul>
                </div>

                {/* Module 6 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>模块 6: ImmortalWRT 路由器同步控制器</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>与路由器 9090 External Controller 建立 RESTful / WebSocket 连接</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>实时读取节点延迟、切换当前出站节点、重启核心进程</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>保障家庭/办公室网络策略与配置面板的强一致性</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 3: ROUTER DATA PLANE */}
          {activeView === 'networkPlane' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">ImmortalWRT 网络底层数据流转路径 (Data Plane)</h3>
                
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-3 text-slate-300 overflow-x-auto">
                  <div className="text-indigo-400 font-bold">【局域网客户端】(PC / Phone / Console / Smart TV)</div>
                  <div className="pl-4 flex items-center gap-2 text-slate-500">
                    <ArrowRight className="w-3.5 h-3.5" /> 访问请求 (TCP / UDP 流量 + DNS 53 查询)
                  </div>
                  
                  <div className="text-cyan-400 font-bold">【ImmortalWRT 网关防火墙】(iptables / nftables / TProxy / TUN)</div>
                  <div className="pl-4 space-y-1 text-slate-400">
                    <div>├─ 1. DNS 流量重定向至 OpenClash 监听端口 (:7874)</div>
                    <div>└─ 2. TCP/UDP 流量通过 TUN 虚拟网卡 (utun) 接管注入 Clash Meta 核心</div>
                  </div>

                  <div className="text-emerald-400 font-bold">【OpenClash 内核分流引擎】</div>
                  <div className="pl-4 space-y-1 text-slate-400">
                    <div>├─ A. DNS 模块解析: 命中 Fake-IP (198.18.x.x) 或 Redir-Host</div>
                    <div>├─ B. 规则级联匹配: 从顶部规则逐条扫描 (DOMAIN-SUFFIX &gt; IP-CIDR &gt; GEOIP &gt; MATCH)</div>
                    <div>└─ C. 策略组决策: 评估 URL-Test / Fallback / Select 指定目标出口</div>
                  </div>

                  <div className="text-amber-400 font-bold">【出站转发通道】</div>
                  <div className="pl-4 space-y-1 text-slate-400">
                    <div>├─ 🇨🇳 DIRECT: 路由器 WAN 口直接发起握手，国内直连</div>
                    <div>├─ 🛡️ REJECT: 直接丢弃报文或响应 0.0.0.0 (广告拦截)</div>
                    <div>└─ 🚀 PROXY: 流量经过 TLS/VLESS/Hysteria2 加密隧道转发至对应海外节点</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            OpenClash 官方仓库参考: <a href="https://github.com/vernesong/openclash" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">vernesong/openclash</a>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            我已知晓，进入管理面板
          </button>
        </div>

      </div>
    </div>
  );
};

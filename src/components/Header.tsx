import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Settings, 
  Router, 
  Network, 
  Layers, 
  Radio, 
  BookOpen, 
  Terminal
} from 'lucide-react';
import { OpenClashSettings } from '../types/openclash';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: OpenClashSettings;
  setSettings: React.Dispatch<React.SetStateAction<OpenClashSettings>>;
  nodeCount: number;
  ruleCount: number;
  onOpenArchitecture: () => void;
  onOpenCaseStudy?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  settings,
  setSettings,
  nodeCount,
  ruleCount,
  onOpenArchitecture,
  onOpenCaseStudy,
}) => {
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);

  const tabs = [
    { id: 'routing', label: '拓扑流图', icon: Layers, badge: `${ruleCount} 规则` },
    { id: 'nodes', label: '节点与订阅', icon: Radio, badge: `${nodeCount} 节点` },
    { id: 'debugger', label: '策略调试', icon: Activity, badge: '即时' },
    { id: 'logs', label: '实时日志', icon: Terminal, badge: 'Live' },
    { id: 'config', label: '配置与 IPK', icon: Router, badge: 'IPK/YAML' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">OpenClash Flow</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ImmortalWRT
                </span>
              </div>
              <p className="text-xs text-slate-400">可视化分流与智能配置引擎</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Controls & Status */}
          <div className="flex items-center gap-3">
            {/* Case Study Guide button */}
            {onOpenCaseStudy && (
              <button
                id="btn-case-study-modal"
                onClick={onOpenCaseStudy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 border border-amber-500/40 transition-colors shadow-sm"
                title="查看 ChatGPT 分流实战案例与操作步骤指南"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>案例演示</span>
              </button>
            )}

            {/* Architecture diagram button */}
            <button
              id="btn-architecture-modal"
              onClick={onOpenArchitecture}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 transition-colors"
              title="查看功能模块设计与前后端交互流程图"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">架构流程图</span>
            </button>

            {/* Run mode selector */}
            <div className="hidden lg:flex items-center bg-slate-950 rounded-lg border border-slate-800 p-1 text-xs">
              <span className="text-slate-500 px-2 font-mono">模式:</span>
              {(['rule', 'global', 'direct'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSettings((s) => ({ ...s, proxyMode: m }))}
                  className={`px-2 py-1 rounded capitalize transition-colors ${
                    settings.proxyMode === m
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'rule' ? '规则分流' : m === 'global' ? '全局代理' : '全直连'}
                </button>
              ))}
            </div>

            {/* Settings button */}
            <button
              id="btn-open-settings"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              title="OpenClash 核心参数设置"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Router status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono hidden sm:inline">{settings.routerHost}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{settings.runMode.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden overflow-x-auto gap-2 py-2 border-t border-slate-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">ImmortalWRT / OpenClash 核心参数</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">路由器 IP (Host)</label>
                <input
                  type="text"
                  value={settings.routerHost}
                  onChange={(e) => setSettings({ ...settings, routerHost: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="192.168.1.1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">External Controller 端口</label>
                <input
                  type="number"
                  value={settings.controllerPort}
                  onChange={(e) => setSettings({ ...settings, controllerPort: parseInt(e.target.value, 10) || 9090 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-slate-400 font-medium">Dashboard API 密钥 (Secret)</label>
                <input
                  type="text"
                  value={settings.secret}
                  onChange={(e) => setSettings({ ...settings, secret: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="留空或输入 OpenClash 面板密码"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">运行模式 (DNS Mode)</label>
                <select
                  value={settings.runMode}
                  onChange={(e) => setSettings({ ...settings, runMode: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="fake-ip">Fake-IP 模式 (推荐/防DNS污染)</option>
                  <option value="redir-host">Redir-Host 模式 (兼容老旧设备)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">核心类型 (Core)</label>
                <select
                  value={settings.coreType}
                  onChange={(e) => setSettings({ ...settings, coreType: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Meta">Clash Meta / Mihomo (推荐)</option>
                  <option value="Premium">Clash Premium</option>
                  <option value="Dev">Clash Dev</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Mixed 混合代理端口</label>
                <input
                  type="number"
                  value={settings.mixedPort}
                  onChange={(e) => setSettings({ ...settings, mixedPort: parseInt(e.target.value, 10) || 7890 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-medium">Redir 端口</label>
                <input
                  type="number"
                  value={settings.redirPort}
                  onChange={(e) => setSettings({ ...settings, redirPort: parseInt(e.target.value, 10) || 7892 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                保存并生效
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

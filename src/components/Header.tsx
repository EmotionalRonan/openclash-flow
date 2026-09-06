import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Activity, 
  Settings, 
  Router, 
  Network, 
  Layers, 
  Radio, 
  BookOpen, 
  Terminal,
  Sparkles,
  X,
  Check,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { OpenClashSettings } from '../types/openclash';
import { useTheme } from '../context/ThemeContext';

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
  const { themeMode, resolvedTheme, setThemeMode, toggleTheme } = useTheme();

  const tabs = [
    { id: 'routing', label: '拓扑流程图', icon: Layers, badge: `${ruleCount}` },
    { id: 'nodes', label: '节点订阅', icon: Radio, badge: `${nodeCount}` },
    { id: 'debugger', label: '策略调试', icon: Activity, badge: '即时' },
    { id: 'logs', label: '实时日志', icon: Terminal, badge: 'Live' },
    { id: 'config', label: '配置发布', icon: Router, badge: 'IPK' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#0c0d13]/80 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-3">
          
          {/* Logo & Brand (Apple SF Squircle) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[11px] bg-black/[0.04] dark:bg-[#181922] border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center shadow-sm shrink-0 transition-colors">
              <Network className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-sm sm:text-base text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight whitespace-nowrap">
                  OpenClash Flow
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1aa] border border-black/[0.06] dark:border-white/[0.08] tracking-wider uppercase shrink-0">
                  ImmortalWRT
                </span>
              </div>
              <p className="text-[11px] text-[#86868b] hidden xl:block tracking-tight truncate">
                可视化分流与智能配置引擎
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Apple Segmented Control) */}
          <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-black/[0.04] dark:bg-[#16171f] border border-black/[0.06] dark:border-white/[0.08] shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)] shrink-0 transition-colors">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors apple-press shrink-0 whitespace-nowrap ${
                    isActive ? 'text-[#1d1d1f] dark:text-[#f5f5f7]' : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#8e8e93] dark:hover:text-[#e4e4e7]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="apple-nav-pill"
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                      className="absolute inset-0 rounded-xl bg-white dark:bg-[#272832] border border-black/[0.08] dark:border-white/[0.14] shadow-sm"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap font-medium">{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono shrink-0 whitespace-nowrap ${
                          isActive
                            ? 'bg-black/[0.06] dark:bg-white/[0.12] text-[#1d1d1f] dark:text-white font-semibold'
                            : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#86868b] dark:text-[#71717a]'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick Controls & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Theme Toggle Button (Apple Light/Dark/System) */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shadow-sm flex items-center justify-center shrink-0"
              title={`当前模式: ${resolvedTheme === 'dark' ? '深色模式' : '浅色模式'} (点击切换)`}
              aria-label="切换亮暗色模式"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Case Study Guide button */}
            {onOpenCaseStudy && (
              <button
                id="btn-case-study-modal"
                onClick={onOpenCaseStudy}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/[0.12] hover:bg-amber-500/[0.18] text-amber-700 dark:text-amber-300 border border-amber-500/25 transition-all apple-press shadow-sm shrink-0 whitespace-nowrap"
                title="查看分流实战案例与操作步骤指南"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">案例演示</span>
              </button>
            )}

            {/* Architecture diagram button */}
            <button
              id="btn-architecture-modal"
              onClick={onOpenArchitecture}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shrink-0 whitespace-nowrap"
              title="查看系统架构与前后端交互设计"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">架构</span>
            </button>

            {/* Run mode selector (Apple segmented pill on 2xl screens) */}
            <div className="hidden 2xl:flex items-center bg-black/[0.04] dark:bg-[#16171f] rounded-xl border border-black/[0.06] dark:border-white/[0.08] p-0.5 text-xs transition-colors shrink-0">
              {(['rule', 'global', 'direct'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSettings((s) => ({ ...s, proxyMode: m }))}
                  className={`px-2.5 py-1 rounded-lg transition-all apple-press whitespace-nowrap ${
                    settings.proxyMode === m
                      ? 'bg-white dark:bg-[#272832] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium border border-black/[0.08] dark:border-white/[0.12] shadow-sm'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#8e8e93] dark:hover:text-[#d4d4d8]'
                  }`}
                >
                  {m === 'rule' ? '规则分流' : m === 'global' ? '全局' : '直连'}
                </button>
              ))}
            </div>

            {/* Settings button */}
            <button
              id="btn-open-settings"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shrink-0"
              title="OpenClash 核心参数设置"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Router status indicator (Apple status capsule) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.1] border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono text-[11px] hidden md:inline">{settings.routerHost}</span>
              <span className="text-[10px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">{settings.runMode.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar for Tablets and Mobile (< lg screens) */}
        <div className="flex lg:hidden overflow-x-auto gap-1.5 py-2.5 border-t border-black/[0.06] dark:border-white/[0.06] scrollbar-none items-center">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/[0.03] dark:bg-[#14151e] border border-black/[0.06] dark:border-white/[0.08] w-full min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all apple-press shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-[#272832] text-[#1d1d1f] dark:text-white border border-black/[0.08] dark:border-white/[0.16] shadow-sm font-semibold'
                      : 'text-[#6e6e73] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap font-medium">{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#a1a1aa] font-mono shrink-0 whitespace-nowrap">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Modal (Apple Sheet Style) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-md p-3 sm:p-4">
          <div className="bg-white dark:bg-[#14151c] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">OpenClash 核心参数</h3>
                  <p className="text-[11px] text-[#86868b]">配置外观模式与 ImmortalWRT 路由器环境</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-[#6e6e73] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors apple-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Apple Appearance Segmented Selector */}
            <div className="space-y-1.5">
              <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium text-xs">界面外观风格 (Appearance)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'light' as const, label: '浅色模式', icon: Sun },
                  { mode: 'dark' as const, label: '深色模式', icon: Moon },
                  { mode: 'system' as const, label: '跟随系统', icon: Monitor },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = themeMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => setThemeMode(item.mode)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all apple-press ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-300 font-semibold ring-2 ring-indigo-500/20 shadow-sm'
                          : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#a1a1aa] hover:border-black/[0.15] dark:hover:border-white/[0.15]'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium">路由器 IP (Host)</label>
                <input
                  type="text"
                  value={settings.routerHost}
                  onChange={(e) => setSettings({ ...settings, routerHost: e.target.value })}
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  placeholder="192.168.1.1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium">Controller 端口</label>
                <input
                  type="number"
                  value={settings.controllerPort}
                  onChange={(e) => setSettings({ ...settings, controllerPort: parseInt(e.target.value, 10) || 9090 })}
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium">API 密钥 (Secret)</label>
                <input
                  type="text"
                  value={settings.secret}
                  onChange={(e) => setSettings({ ...settings, secret: e.target.value })}
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  placeholder="留空或输入 OpenClash 面板密码"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium">运行模式 (DNS Mode)</label>
                <select
                  value={settings.runMode}
                  onChange={(e) => setSettings({ ...settings, runMode: e.target.value as any })}
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:border-indigo-500/80 focus:outline-none"
                >
                  <option value="fake-ip">Fake-IP 模式 (推荐/防污染)</option>
                  <option value="redir-host">Redir-Host 模式 (老旧设备)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium">核心类型 (Core)</label>
                <select
                  value={settings.coreType}
                  onChange={(e) => setSettings({ ...settings, coreType: e.target.value as any })}
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] focus:border-indigo-500/80 focus:outline-none"
                >
                  <option value="Meta">Clash Meta / Mihomo (推荐)</option>
                  <option value="Premium">Clash Premium</option>
                  <option value="Dev">Clash Dev</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium">Mixed 混合端口</label>
                <input
                  type="number"
                  value={settings.mixedPort}
                  onChange={(e) => setSettings({ ...settings, mixedPort: parseInt(e.target.value, 10) || 7890 })}
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93] font-medium">Redir 端口</label>
                <input
                  type="number"
                  value={settings.redirPort}
                  onChange={(e) => setSettings({ ...settings, redirPort: parseInt(e.target.value, 10) || 7892 })}
                  className="w-full bg-black/[0.03] dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-[#1d1d1f] dark:text-[#f5f5f7] font-mono focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5 border-t border-black/[0.08] dark:border-white/[0.08]">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold apple-press shadow-md"
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


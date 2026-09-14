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
  Monitor,
  RefreshCw,
  ArrowDownCircle,
  Package,
  MoreVertical
} from 'lucide-react';
import { OpenClashSettings } from '../types/openclash';
import { useTheme } from '../context/ThemeContext';
import { APP_VERSION, FULL_VERSION, getRuntimeVersion } from '../version';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: OpenClashSettings;
  setSettings: React.Dispatch<React.SetStateAction<OpenClashSettings>>;
  nodeCount: number;
  ruleCount: number;
  onOpenArchitecture: () => void;
  onOpenCaseStudy?: () => void;
  onOpenUpdateModal?: () => void;
  hasUpdate?: boolean;
  latestVersion?: string;
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
  onOpenUpdateModal,
  hasUpdate = false,
  latestVersion,
}) => {
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = React.useState(false);
  const { themeMode, resolvedTheme, setThemeMode, toggleTheme } = useTheme();
  const runtimeVer = getRuntimeVersion();
  const moreMenuRef = React.useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  React.useEffect(() => {
    if (!showMobileMoreMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMobileMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMoreMenu]);

  const tabs = [
    { id: 'routing', label: '拓扑流程图', icon: Layers, badge: `${ruleCount}` },
    { id: 'telemetry', label: '流量画像与审计', icon: Activity, badge: 'Neko' },
    { id: 'nodes', label: '节点订阅', icon: Radio, badge: `${nodeCount}` },
    { id: 'debugger', label: '策略调试', icon: ShieldCheck, badge: '即时' },
    { id: 'logs', label: '实时日志', icon: Terminal, badge: 'Live' },
    { id: 'config', label: '配置发布', icon: Router, badge: 'IPK' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.08] dark:border-white/[0.08] bg-white/85 dark:bg-[#0c0d13]/85 backdrop-blur-2xl transition-colors w-full overflow-x-clip">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3 w-full min-w-0">
          
          {/* Logo & Brand (Apple SF Squircle) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-[10px] sm:rounded-[11px] bg-black/[0.04] dark:bg-[#181922] border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center shadow-sm shrink-0 transition-colors">
              <Network className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
                <span className="font-semibold text-xs sm:text-sm md:text-base text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight truncate max-w-[100px] xs:max-w-[130px] sm:max-w-none">
                  OpenClash Flow
                </span>
                <span className="hidden lg:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1aa] border border-black/[0.06] dark:border-white/[0.08] tracking-wider uppercase shrink-0">
                  ImmortalWRT
                </span>
                <button
                  onClick={onOpenUpdateModal}
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-400/20 shrink-0 font-mono hover:bg-indigo-500/20 transition-colors apple-press"
                  title="点击查看版本与检测 GitHub 更新"
                >
                  v{runtimeVer}
                </button>
                {hasUpdate && (
                  <button
                    onClick={onOpenUpdateModal}
                    className="flex items-center gap-1 text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0 font-mono apple-press transition-all animate-pulse shadow-xs"
                    title={`检测到 GitHub 新版本 v${latestVersion}，点击在界面直接更新`}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    <span className="hidden md:inline">发现新版 v{latestVersion}</span>
                    <span className="md:hidden">新版</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#86868b] hidden 2xl:block tracking-tight truncate">
                可视化分流与智能配置引擎
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Apple Segmented Control on 2xl+ screens) */}
          <nav className="hidden 2xl:flex items-center p-1 rounded-2xl bg-black/[0.04] dark:bg-[#16171f] border border-black/[0.06] dark:border-white/[0.08] shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)] shrink-0 transition-colors">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors apple-press shrink-0 whitespace-nowrap ${
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
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* PWA Install Button (Desktop & Tablet) */}
            <PWAInstallButton compact className="hidden xl:inline-flex" />

            {/* Run mode selector (Apple segmented pill on 2xl screens) */}
            <div className="hidden 2xl:flex items-center bg-black/[0.04] dark:bg-[#16171f] rounded-xl border border-black/[0.06] dark:border-white/[0.08] p-0.5 text-xs transition-colors shrink-0">
              {(['rule', 'global', 'direct'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSettings((s) => ({ ...s, proxyMode: m }))}
                  className={`px-2 py-1 rounded-lg transition-all apple-press whitespace-nowrap ${
                    settings.proxyMode === m
                      ? 'bg-white dark:bg-[#272832] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium border border-black/[0.08] dark:border-white/[0.12] shadow-sm'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#8e8e93] dark:hover:text-[#d4d4d8]'
                  }`}
                >
                  {m === 'rule' ? '规则' : m === 'global' ? '全局' : '直连'}
                </button>
              ))}
            </div>

            {/* Case Study Guide button (>= lg screens) */}
            {onOpenCaseStudy && (
              <button
                id="btn-case-study-modal"
                onClick={onOpenCaseStudy}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-amber-500/[0.12] hover:bg-amber-500/[0.18] text-amber-700 dark:text-amber-300 border border-amber-500/25 transition-all apple-press shadow-sm shrink-0 whitespace-nowrap"
                title="查看分流实战案例与操作步骤指南"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">案例演示</span>
              </button>
            )}

            {/* Architecture diagram button (>= lg screens) */}
            <button
              id="btn-architecture-modal"
              onClick={onOpenArchitecture}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#d4d4d8] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shrink-0 whitespace-nowrap"
              title="查看系统架构与前后端交互设计"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">架构</span>
            </button>

            {/* GitHub Update Detection button (>= md screens or when update available) */}
            {onOpenUpdateModal && (
              <button
                id="btn-github-update"
                onClick={onOpenUpdateModal}
                className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all apple-press shadow-sm shrink-0 whitespace-nowrap ${
                  hasUpdate
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-indigo-600/25 ring-2 ring-indigo-500/20'
                    : 'hidden md:flex bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/[0.08] dark:border-white/[0.08]'
                }`}
                title={hasUpdate ? `GitHub 发现新版本 v${latestVersion}，点击在界面直接更新` : 'GitHub 更新检测与一键热升级'}
              >
                <ArrowDownCircle className={`w-3.5 h-3.5 ${hasUpdate ? 'animate-bounce text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                <span className="hidden xl:inline whitespace-nowrap">
                  {hasUpdate ? `更新 v${latestVersion}` : '更新检测'}
                </span>
                {hasUpdate && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-[#14151c]" />
                )}
              </button>
            )}

            {/* Force Reload / Cache Busting button (>= md screens) */}
            <button
              id="btn-force-reload"
              onClick={() => {
                try {
                  sessionStorage.clear();
                  if ('caches' in window) {
                    caches.keys().then((names) => {
                      names.forEach((name) => caches.delete(name));
                    });
                  }
                } catch (e) {
                  console.warn(e);
                }
                const url = new URL(window.location.href);
                url.searchParams.set('_t', Date.now().toString());
                window.location.href = url.toString();
              }}
              className="hidden md:flex p-1.5 sm:p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shrink-0"
              title="清除本地缓存并强制刷新最新界面 (Ctrl+F5)"
              aria-label="强制刷新最新界面"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Theme Toggle Button (Apple Light/Dark/System) */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shadow-sm flex items-center justify-center shrink-0"
              title={`当前模式: ${resolvedTheme === 'dark' ? '深色模式' : '浅色模式'} (点击切换)`}
              aria-label="切换亮暗色模式"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
              )}
            </button>

            {/* Settings button */}
            <button
              id="btn-open-settings"
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shrink-0"
              title="OpenClash 核心参数设置"
              aria-label="OpenClash 设置"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Router status indicator (Apple status capsule) */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 rounded-full bg-emerald-500/[0.1] border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-mono text-[10px] sm:text-[11px] hidden xl:inline">{settings.routerHost}</span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
                {settings.runMode.toUpperCase()}
              </span>
            </div>

            {/* Responsive Dropdown Menu for secondary tools on screens without full menu (< lg screens) */}
            <div className="relative lg:hidden shrink-0" ref={moreMenuRef}>
              <button
                id="btn-header-mobile-menu"
                onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
                className="p-1.5 sm:p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1aa] dark:hover:text-[#f5f5f7] border border-black/[0.08] dark:border-white/[0.08] transition-all apple-press shrink-0"
                title="更多工具与选项"
                aria-label="更多工具"
              >
                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {showMobileMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white/95 dark:bg-[#14151e]/95 backdrop-blur-2xl border border-black/[0.1] dark:border-white/[0.12] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1 text-xs">
                  {onOpenCaseStudy && (
                    <button
                      onClick={() => {
                        setShowMobileMoreMenu(false);
                        onOpenCaseStudy();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>实战案例演示</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowMobileMoreMenu(false);
                      onOpenArchitecture();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors"
                  >
                    <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                    <span>系统架构流程</span>
                  </button>

                  {onOpenUpdateModal && (
                    <button
                      onClick={() => {
                        setShowMobileMoreMenu(false);
                        onOpenUpdateModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors"
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{hasUpdate ? `发现新版 v${latestVersion}` : 'GitHub 更新检测'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowMobileMoreMenu(false);
                      try {
                        sessionStorage.clear();
                        if ('caches' in window) {
                          caches.keys().then((names) => {
                            names.forEach((name) => caches.delete(name));
                          });
                        }
                      } catch (e) {}
                      const url = new URL(window.location.href);
                      url.searchParams.set('_t', Date.now().toString());
                      window.location.href = url.toString();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>清空缓存并刷新</span>
                  </button>

                  <div className="pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <div className="px-3 py-1 text-[10px] text-[#86868b] font-medium">路由分流模式</div>
                    {(['rule', 'global', 'direct'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setSettings((s) => ({ ...s, proxyMode: m }));
                          setShowMobileMoreMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors ${
                          settings.proxyMode === m
                            ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b]'
                        }`}
                      >
                        <span>{m === 'rule' ? '规则分流 (Rule)' : m === 'global' ? '全局代理 (Global)' : '直连模式 (Direct)'}</span>
                        {settings.proxyMode === m && <Check className="w-3 h-3 text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar for Tablets and Mobile (< 2xl screens) */}
        <div className="flex 2xl:hidden overflow-x-auto gap-1.5 py-2 border-t border-black/[0.06] dark:border-white/[0.06] scrollbar-none items-center w-full">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-black/[0.03] dark:bg-[#14151e] border border-black/[0.06] dark:border-white/[0.08] min-w-max mx-auto sm:mx-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all apple-press shrink-0 whitespace-nowrap ${
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

              {/* GitHub Update section inside Settings modal */}
              <div className="col-span-1 md:col-span-2 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1d1d1f] dark:text-white">GitHub 固件与插件更新</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                      v{runtimeVer}
                    </span>
                    {hasUpdate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        发现新版 v{latestVersion}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#86868b] mt-0.5">
                    实时检索 GitHub Release 仓库，支持在网页界面内一键在线热升级或离线安装
                  </p>
                </div>
                {onOpenUpdateModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingsModal(false);
                      onOpenUpdateModal();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold apple-press shadow-sm shrink-0"
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                    <span>{hasUpdate ? '在界面直接更新' : '检测最新版本'}</span>
                  </button>
                )}
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


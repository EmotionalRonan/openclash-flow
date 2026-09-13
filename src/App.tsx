import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Radio, 
  Activity, 
  Terminal, 
  Router, 
  BookOpen, 
  Workflow, 
  ShieldCheck, 
  Network, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { Header } from './components/Header';
import { ArchitectureModal } from './components/ArchitectureModal';
import { CaseStudyModal } from './components/CaseStudyModal';
import { GitHubUpdateModal } from './components/GitHubUpdateModal';
import { UpdateNotificationBanner } from './components/UpdateNotificationBanner';
import { DragDropRuleBoard } from './components/DragDropRuleBoard';
import { NodeManager } from './components/NodeManager';
import { RuleDebugger } from './components/RuleDebugger';
import { LiveLogViewer } from './components/LiveLogViewer';
import { ConfigGenerator } from './components/ConfigGenerator';
import { NetworkTelemetryDashboard } from './components/NetworkTelemetryDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { 
  DEFAULT_OPENCLASH_SETTINGS 
} from './data/presetRules';
import { 
  FALLBACK_ALL_POLICY_GROUPS, 
  FALLBACK_ALL_PROXIES, 
  FALLBACK_ALL_RULES 
} from './data/fallbackAllConfig';
import { 
  PolicyGroup, 
  ProxyNode, 
  TrafficRule, 
  OpenClashSettings 
} from './types/openclash';
import { UpdateCheckResult } from './types/update';
import { checkForAppUpdate, DEFAULT_GITHUB_REPO } from './utils/githubUpdate';
import { FULL_VERSION, getRuntimeVersion } from './version';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('routing');
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [showCaseStudyModal, setShowCaseStudyModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState<boolean>(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [runtimeVer, setRuntimeVer] = useState<string>(getRuntimeVersion());

  // Core State (initialized with production fallback-all config or cached CRUD state)
  const [settings, setSettings] = useState<OpenClashSettings>(DEFAULT_OPENCLASH_SETTINGS);

  const [policyGroups, setPolicyGroups] = useState<PolicyGroup[]>(() => {
    try {
      const saved = localStorage.getItem('openclash_policy_groups');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_ALL_POLICY_GROUPS;
  });

  const [proxies, setProxies] = useState<ProxyNode[]>(() => {
    try {
      const saved = localStorage.getItem('openclash_proxies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_ALL_PROXIES;
  });

  const [rules, setRules] = useState<TrafficRule[]>(() => {
    try {
      const saved = localStorage.getItem('openclash_traffic_rules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return FALLBACK_ALL_RULES;
  });

  // Sync state mutations to localStorage for persistent CRUD
  useEffect(() => {
    try {
      localStorage.setItem('openclash_policy_groups', JSON.stringify(policyGroups));
    } catch (e) {}
  }, [policyGroups]);

  useEffect(() => {
    try {
      localStorage.setItem('openclash_proxies', JSON.stringify(proxies));
    } catch (e) {}
  }, [proxies]);

  useEffect(() => {
    try {
      localStorage.setItem('openclash_traffic_rules', JSON.stringify(rules));
    } catch (e) {}
  }, [rules]);

  // Auto-check GitHub updates on app start
  useEffect(() => {
    let repo = localStorage.getItem('openclash_github_repo');
    if (!repo || repo === 'openclash-flow/luci-app-openclash-flow') {
      repo = DEFAULT_GITHUB_REPO;
      localStorage.setItem('openclash_github_repo', DEFAULT_GITHUB_REPO);
    }
    const mirror = (localStorage.getItem('openclash_github_mirror') as any) || 'direct';
    const token = localStorage.getItem('openclash_github_token') || undefined;

    checkForAppUpdate(runtimeVer, repo, mirror, undefined, 'all', token)
      .then((res) => {
        setUpdateResult(res);
        if (res.hasUpdate) {
          setShowUpdateBanner(true);
        }
      })
      .catch((err) => {
        console.warn('Initial update check error:', err);
      });
  }, [runtimeVer]);

  // One-click apply case topology (ChatGPT分流到香港专线，国内直连)
  const handleApplyCaseTopology = () => {
    setActiveTab('routing');

    // Ensure OpenAI rule exists at the top
    const openAiRule: TrafficRule = {
      id: 'rule-openai-preset',
      type: 'DOMAIN-SUFFIX',
      payload: 'openai.com',
      targetGroup: '🚀 节点选择 (PROXY)',
      comment: 'OpenAI / ChatGPT 官方 API 与网页',
      enabled: true,
      category: 'ai',
    };

    const directRule: TrafficRule = {
      id: 'rule-cn-preset',
      type: 'GEOIP',
      payload: 'CN',
      targetGroup: 'DIRECT',
      comment: '中国大陆地区 IP 直连',
      enabled: true,
      category: 'domestic',
    };

    // Make sure '🚀 节点选择 (PROXY)' has '🇭🇰 香港 IPLC 01' as primary proxy
    setPolicyGroups((prev) =>
      prev.map((g) => {
        if (g.name.includes('节点选择') || g.name.includes('PROXY')) {
          const hkProxy = proxies.find((p) => p.name.includes('香港') || p.name.includes('HK'));
          return {
            ...g,
            now: hkProxy ? hkProxy.name : g.now,
          };
        }
        return g;
      })
    );

    setRules((prev) => {
      const filtered = prev.filter(
        (r) => !r.payload.includes('openai') && r.payload !== 'CN'
      );
      return [openAiRule, directRule, ...filtered];
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#090a0f] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        nodeCount={proxies.length}
        ruleCount={rules.length}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
        onOpenCaseStudy={() => setShowCaseStudyModal(true)}
        onOpenUpdateModal={() => setShowUpdateModal(true)}
        hasUpdate={updateResult?.hasUpdate}
        latestVersion={updateResult?.latestVersion}
      />

      {/* Main Content Area (Responsive padding full width 100%) */}
      <main className="flex-1 w-full px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
        
        {/* TAB 1: Drag & Drop Rule Board */}
        {activeTab === 'routing' && (
          <DragDropRuleBoard
            policyGroups={policyGroups}
            setPolicyGroups={setPolicyGroups}
            rules={rules}
            setRules={setRules}
            proxies={proxies}
          />
        )}

        {/* TAB 2: Telemetry, Rule Audit & Client Traffic (Neko Master Style) */}
        {activeTab === 'telemetry' && (
          <NetworkTelemetryDashboard
            rules={rules}
            policyGroups={policyGroups}
            proxies={proxies}
            onNavigateToRouting={() => setActiveTab('routing')}
          />
        )}

        {/* TAB 3: Nodes & Subscriptions */}
        {activeTab === 'nodes' && (
          <NodeManager
            proxies={proxies}
            setProxies={setProxies}
            policyGroups={policyGroups}
            setPolicyGroups={setPolicyGroups}
          />
        )}

        {/* TAB 3: Rule Match Debugger */}
        {activeTab === 'debugger' && (
          <RuleDebugger
            rules={rules}
            policyGroups={policyGroups}
            proxies={proxies}
          />
        )}

        {/* TAB 4: Live Logs */}
        {activeTab === 'logs' && (
          <LiveLogViewer
            rules={rules}
            policyGroups={policyGroups}
            proxies={proxies}
          />
        )}

        {/* TAB 5: Config & Sync */}
        {activeTab === 'config' && (
          <ConfigGenerator
            settings={settings}
            setSettings={setSettings}
            proxies={proxies}
            policyGroups={policyGroups}
            rules={rules}
            setRules={setRules}
            setPolicyGroups={setPolicyGroups}
            onOpenUpdateModal={() => setShowUpdateModal(true)}
            updateResult={updateResult}
          />
        )}

      </main>

      {/* Footer Info */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-[#090a0f]/80 py-4 text-center text-xs text-[#86868b] dark:text-[#71717a] transition-colors">
        <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-[#1d1d1f] dark:text-[#d4d4d8]">OpenClash Flow v{runtimeVer} • 专为 ImmortalWRT 路由器优化</span>
            {updateResult?.hasUpdate && (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse"
              >
                云端新版 v{updateResult.latestVersion} 可用
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-[#6e6e73] dark:text-[#8e8e93]">
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              系统架构与交互流程
            </button>
            <span>•</span>
            <button
              onClick={() => setShowUpdateModal(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              GitHub 更新检测
            </button>
            <span>•</span>
            <a
              href="https://github.com/vernesong/openclash"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <span>GitHub vernesong/openclash</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Architecture & Flowchart Modal */}
      <ArchitectureModal
        isOpen={showArchitectureModal}
        onClose={() => setShowArchitectureModal(false)}
      />

      {/* Case Study & Step-by-Step Operations Modal */}
      <CaseStudyModal
        isOpen={showCaseStudyModal}
        onClose={() => setShowCaseStudyModal(false)}
        onApplyCaseTopology={handleApplyCaseTopology}
      />

      {/* GitHub Update & In-App Upgrade Modal */}
      <GitHubUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        initialCheckResult={updateResult}
        onUpdateSuccess={(newVer) => {
          setRuntimeVer(newVer);
          setShowUpdateBanner(false);
          if (updateResult) {
            setUpdateResult({
              ...updateResult,
              hasUpdate: false,
              currentVersion: newVer,
            });
          }
        }}
      />

      {/* Floating Update Notification Toast */}
      {showUpdateBanner && (
        <UpdateNotificationBanner
          updateResult={updateResult}
          onOpenUpdateModal={() => {
            setShowUpdateBanner(false);
            setShowUpdateModal(true);
          }}
          onDismiss={() => setShowUpdateBanner(false)}
        />
      )}

      {/* PWA Offline Connection Indicator */}
      <OfflineIndicator />

    </div>
  );
}

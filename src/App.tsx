import React, { useState } from 'react';
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
import { DragDropRuleBoard } from './components/DragDropRuleBoard';
import { NodeManager } from './components/NodeManager';
import { RuleDebugger } from './components/RuleDebugger';
import { LiveLogViewer } from './components/LiveLogViewer';
import { ConfigGenerator } from './components/ConfigGenerator';
import { 
  INITIAL_POLICY_GROUPS, 
  INITIAL_PROXIES, 
  INITIAL_TRAFFIC_RULES, 
  DEFAULT_OPENCLASH_SETTINGS 
} from './data/presetRules';
import { 
  PolicyGroup, 
  ProxyNode, 
  TrafficRule, 
  OpenClashSettings 
} from './types/openclash';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('routing');
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);

  // Core State
  const [settings, setSettings] = useState<OpenClashSettings>(DEFAULT_OPENCLASH_SETTINGS);
  const [policyGroups, setPolicyGroups] = useState<PolicyGroup[]>(INITIAL_POLICY_GROUPS);
  const [proxies, setProxies] = useState<ProxyNode[]>(INITIAL_PROXIES);
  const [rules, setRules] = useState<TrafficRule[]>(INITIAL_TRAFFIC_RULES);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        nodeCount={proxies.length}
        ruleCount={rules.length}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
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

        {/* TAB 2: Nodes & Subscriptions */}
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
          />
        )}

      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>OpenClash Flow v1.0 • 专为 ImmortalWRT 路由器优化</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setShowArchitectureModal(true)}
              className="hover:text-indigo-400 transition-colors"
            >
              系统架构与交互流程
            </button>
            <span>•</span>
            <a
              href="https://github.com/vernesong/openclash"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition-colors flex items-center gap-1"
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

    </div>
  );
}

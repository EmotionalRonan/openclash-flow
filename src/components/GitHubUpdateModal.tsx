import React, { useState, useEffect } from 'react';
import { 
  ArrowDownCircle, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Download, 
  Package, 
  X, 
  Layers, 
  Terminal, 
  ChevronRight,
  Settings2,
  HardDrive
} from 'lucide-react';
import { 
  GitHubRelease, 
  GitHubAsset, 
  UpdateCheckResult, 
  UpdateProgress, 
  GitHubMirror 
} from '../types/update';
import { 
  checkForAppUpdate, 
  executeInAppUpdate, 
  getAcceleratedUrl, 
  DEFAULT_GITHUB_REPO 
} from '../utils/githubUpdate';
import { getRuntimeVersion, setRuntimeVersion } from '../version';

interface GitHubUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess?: (newVersion: string) => void;
  targetArch?: string;
  initialCheckResult?: UpdateCheckResult | null;
}

const ARCH_LIST = [
  { id: 'all', name: '全架构通用 (Universal)', desc: '适用于所有 OpenWrt 路由器' },
  { id: 'x86_64', name: 'x86_64 软路由 / PC', desc: 'Intel / AMD 64位, J4125/N100' },
  { id: 'aarch64_generic', name: 'ARM64 / AArch64', desc: 'N1, 树莓派, R2S/R4S/R5S/R6S, MT798x' },
  { id: 'arm_cortex-a7_neon-vfpv4', name: 'ARMv7 32位', desc: 'IPQ40xx, GL.iNet, 华硕等' },
  { id: 'mipsel_24kc', name: 'MIPS小端 (mipsel)', desc: 'MT7621, K2P, Newifi D2' },
  { id: 'mips_24kc', name: 'MIPS大端 (mips)', desc: 'AR9344, QCA953x, AR71xx' },
];

export const GitHubUpdateModal: React.FC<GitHubUpdateModalProps> = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  targetArch = 'all',
  initialCheckResult = null,
}) => {
  const [currentVersion, setCurrentVersion] = useState<string>(() => getRuntimeVersion());
  const [selectedArch, setSelectedArch] = useState<string>(targetArch);
  const [checking, setChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<UpdateCheckResult | null>(initialCheckResult);
  const [copied, setCopied] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Custom Settings State
  const [repo, setRepo] = useState<string>(() => {
    const saved = localStorage.getItem('openclash_github_repo');
    if (!saved || saved === 'openclash-flow/luci-app-openclash-flow') {
      localStorage.setItem('openclash_github_repo', DEFAULT_GITHUB_REPO);
      return DEFAULT_GITHUB_REPO;
    }
    return saved;
  });
  const [mirror, setMirror] = useState<GitHubMirror>(() => {
    return (localStorage.getItem('openclash_github_mirror') as GitHubMirror) || 'direct';
  });
  const [customLocalVer, setCustomLocalVer] = useState<string>(currentVersion);
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('openclash_github_token') || '';
  });

  // In-app Update Progress State
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [progress, setProgress] = useState<UpdateProgress>({
    phase: 'idle',
    percentage: 0,
    message: '',
  });

  // Check update on open if not checked yet
  useEffect(() => {
    if (isOpen) {
      if (!checkResult) {
        handleCheckUpdate(false, currentVersion);
      }
    }
  }, [isOpen]);

  const handleCheckUpdate = async (isManual: boolean = false, verToUse?: string) => {
    const ver = verToUse || currentVersion;
    setChecking(true);
    try {
      const res = await checkForAppUpdate(
        ver,
        repo,
        mirror,
        undefined,
        selectedArch,
        token
      );
      setCheckResult(res);
      // Save last checked timestamp
      localStorage.setItem('openclash_last_check_update_time', Date.now().toString());
    } catch (e: any) {
      console.warn('Update check failed:', e);
    } finally {
      setChecking(false);
    }
  };

  // Switch repo or mirror or custom version
  const handleSaveSettings = () => {
    const trimmedRepo = repo.trim();
    localStorage.setItem('openclash_github_repo', trimmedRepo);
    localStorage.setItem('openclash_github_mirror', mirror);
    localStorage.setItem('openclash_github_token', token.trim());
    if (customLocalVer.trim() && customLocalVer.trim() !== currentVersion) {
      setRuntimeVersion(customLocalVer.trim());
      setCurrentVersion(customLocalVer.trim());
    }
    setShowConfig(false);
    handleCheckUpdate(true, customLocalVer.trim() || currentVersion);
  };

  // Execute direct update inside interface
  const handleDirectUpdate = async () => {
    if (!checkResult || isUpdating) return;
    setIsUpdating(true);
    setProgress({
      phase: 'downloading',
      percentage: 5,
      message: '开始在线升级准备...',
    });

    const asset = checkResult.release?.assets?.find(a => a.arch === selectedArch) 
      || checkResult.matchingAsset;

    const success = await executeInAppUpdate(
      asset,
      checkResult.latestVersion,
      selectedArch,
      (prog) => {
        setProgress(prog);
      }
    );

    if (success) {
      setRuntimeVersion(checkResult.latestVersion);
      if (onUpdateSuccess) {
        onUpdateSuccess(checkResult.latestVersion);
      }
    }
  };

  // Download IPK directly to browser
  const handleDownloadIpk = () => {
    if (!checkResult) return;
    const asset = checkResult.release?.assets?.find(a => a.arch === selectedArch) 
      || checkResult.matchingAsset;

    let downloadUrl = asset?.browser_download_url;
    if (!downloadUrl) {
      downloadUrl = `https://github.com/${repo}/releases/download/v${checkResult.latestVersion}/luci-app-openclash-flow_${checkResult.latestVersion}_${selectedArch}.ipk`;
    }

    const acceleratedUrl = getAcceleratedUrl(downloadUrl, mirror);
    
    // Trigger download in browser
    const link = document.createElement('a');
    link.href = acceleratedUrl;
    link.target = '_blank';
    link.download = asset?.name || `luci-app-openclash-flow_${checkResult.latestVersion}_${selectedArch}.ipk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy OPKG terminal command
  const handleCopyCommand = () => {
    if (!checkResult) return;
    const asset = checkResult.release?.assets?.find(a => a.arch === selectedArch) 
      || checkResult.matchingAsset;
    const downloadUrl = getAcceleratedUrl(
      asset?.browser_download_url || `https://github.com/${repo}/releases/download/v${checkResult.latestVersion}/luci-app-openclash-flow_${checkResult.latestVersion}_${selectedArch}.ipk`,
      mirror
    );

    const cmd = `# 下载并热升级 OpenClash Flow (v${checkResult.latestVersion}):\nwget -O /tmp/openclash-flow-update.ipk "${downloadUrl}" && \\\nopkg install --force-reinstall --force-overwrite /tmp/openclash-flow-update.ipk && \\\nrm -rf /tmp/luci-*cache* && /etc/init.d/rpcd restart && /etc/init.d/uhttpd restart`;
    
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Refresh page after update
  const handleReloadPage = () => {
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
  };

  if (!isOpen) return null;

  const hasUpdate = checkResult?.hasUpdate;
  const latestVer = checkResult?.latestVersion || currentVersion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#14151c] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-[#1d1d1f] dark:text-[#f5f5f7] max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 shrink-0">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  GitHub 更新检测
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#a1a1aa] border border-black/[0.06] dark:border-white/[0.08]">
                  v{currentVersion}
                </span>
              </div>
              <p className="text-[11px] text-[#86868b]">
                检测云端 Release 最新版本并支持界面内直接一键升级
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-xl transition-colors apple-press ${
                showConfig
                  ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                  : 'bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#8e8e93]'
              }`}
              title="配置 GitHub 仓库与加速镜像"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#8e8e93] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors apple-press"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Collapsible Settings Box */}
        {showConfig && (
          <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] space-y-3 text-xs shrink-0 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between font-semibold">
              <span>GitHub 仓库与网络配置</span>
              <button
                onClick={handleSaveSettings}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium"
              >
                保存并检测
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93]">GitHub 仓库 (Owner/Repo)</label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="例如: EmotionalRonan/openclash-flow"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c0d12] border border-black/[0.1] dark:border-white/[0.1] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#6e6e73] dark:text-[#8e8e93]">当前安装版本 (测试/模拟)</label>
                <input
                  type="text"
                  value={customLocalVer}
                  onChange={(e) => setCustomLocalVer(e.target.value)}
                  placeholder="例如: 1.0.6-3"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c0d12] border border-black/[0.1] dark:border-white/[0.1] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[#6e6e73] dark:text-[#8e8e93]">GitHub Token (可选，仅私有仓库需要)</label>
                <span className="text-[10px] text-[#86868b]">私有仓库须填 PAT</span>
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_xxxx 或 ghp_xxxx (公开仓库无需填写)"
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c0d12] border border-black/[0.1] dark:border-white/[0.1] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#6e6e73] dark:text-[#8e8e93]">下载加速通道 (镜像 CDN)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'direct', label: '官方直连' },
                  { id: 'ghproxy', label: 'ghproxy 加速' },
                  { id: 'ghfast', label: 'ghfast 备用' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMirror(m.id as GitHubMirror)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all ${
                      mirror === m.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#0c0d12] border border-black/[0.08] dark:border-white/[0.08] text-[#6e6e73] dark:text-[#a1a1aa]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          
          {/* Version Comparison Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            checkResult?.error
              ? 'bg-amber-500/[0.06] dark:bg-amber-500/[0.12] border-amber-500/30'
              : hasUpdate
              ? 'bg-indigo-500/[0.06] dark:bg-indigo-500/[0.12] border-indigo-500/30'
              : 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.12] border-emerald-500/30'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {checkResult?.error ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                ) : hasUpdate ? (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 animate-pulse">
                    <Sparkles className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base">
                      {checkResult?.error 
                        ? 'GitHub 检查提示' 
                        : hasUpdate 
                        ? `发现新版本 v${latestVer}` 
                        : (checkResult?.statusMessage || '当前已是最新版本')}
                    </span>
                    {hasUpdate && !checkResult?.error && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6e6e73] dark:text-[#a1a1aa] mt-0.5">
                    {checkResult?.error
                      ? checkResult.statusMessage
                      : hasUpdate 
                      ? `本地版本: v${currentVersion} ➔ 云端最新: v${latestVer}`
                      : `本地运行版本 (v${currentVersion}) 与 GitHub 保持一致，未发现新版本`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleCheckUpdate(true)}
                disabled={checking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.05] hover:bg-black/[0.1] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-xs font-medium apple-press transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-indigo-500' : ''}`} />
                <span>{checking ? '检测中...' : '重新检测'}</span>
              </button>
            </div>
          </div>

          {/* Router Target Architecture Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>目标路由器硬件架构</span>
              </label>
              <span className="text-[11px] text-[#86868b]">自动匹配专属 IPK 产物</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ARCH_LIST.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => setSelectedArch(arch.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all apple-press flex flex-col justify-between ${
                    selectedArch === arch.id
                      ? 'bg-indigo-500/[0.08] border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-semibold truncate ${
                      selectedArch === arch.id ? 'text-indigo-600 dark:text-indigo-400' : ''
                    }`}>
                      {arch.id === 'all' ? 'Universal 全架构' : arch.id}
                    </span>
                    {selectedArch === arch.id && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#86868b] mt-1 line-clamp-1">
                    {arch.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Release Notes / Changelog */}
          {checkResult?.releaseNotes && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  版本更新内容 (Changelog)
                </span>
                {checkResult.publishedAt && (
                  <span className="text-[11px] text-[#86868b]">
                    发布时间: {new Date(checkResult.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] font-mono text-[11px] leading-relaxed text-[#48484a] dark:text-[#d1d5db] whitespace-pre-wrap max-h-36 overflow-y-auto scrollbar-thin">
                {checkResult.releaseNotes}
              </div>
            </div>
          )}

          {/* Live In-App Update Progress Area */}
          {isUpdating && (
            <div className="p-4 rounded-2xl bg-indigo-500/[0.08] border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                    {progress.message}
                  </span>
                </div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {progress.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-black/[0.08] dark:bg-white/[0.1] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              {progress.detail && (
                <p className="text-[11px] text-[#6e6e73] dark:text-[#a1a1aa] font-mono truncate">
                  {progress.detail}
                </p>
              )}

              {progress.phase === 'success' && (
                <div className="pt-2 flex items-center justify-between border-t border-indigo-500/20">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    已成功应用热升级
                  </span>
                  <button
                    onClick={handleReloadPage}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm apple-press"
                  >
                    立即刷新页面体验新版
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="pt-3 border-t border-black/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCommand}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] apple-press transition-colors"
              title="复制在 OpenWrt 终端中运行的 opkg 一键安装命令"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制指令' : '复制终端指令'}</span>
            </button>

            <a
              href={checkResult?.releaseUrl || `https://github.com/${repo}/releases`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] apple-press transition-colors"
              title="在浏览器中查看 GitHub Release 页面"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Release 网页</span>
            </a>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleDownloadIpk}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/[0.05] hover:bg-black/[0.1] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] apple-press transition-colors"
              title="直接下载当前架构的 IPK 离线安装包"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 IPK 离线包</span>
            </button>

            {/* DIRECT IN-APP UPDATE BUTTON */}
            <button
              onClick={handleDirectUpdate}
              disabled={isUpdating}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md apple-press transition-all ${
                isUpdating
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : hasUpdate
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                  : 'bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              {isUpdating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : hasUpdate ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>
                {isUpdating 
                  ? '正在安装中...' 
                  : hasUpdate 
                  ? '在界面直接更新' 
                  : '重新安装当前版本'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

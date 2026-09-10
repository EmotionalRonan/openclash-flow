import React, { useState } from 'react';
import { Download, Monitor, Share, PlusSquare, Check, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already running as an installed PWA, hide or show installed badge
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2 py-1 rounded-lg">
        <Check className="w-3 h-3" />
        <span>桌面已安装</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow with active deferredPrompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-all apple-press ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
        title="安装为独立桌面/手机应用，享受离线运行与零边框原生体验"
      >
        <Download className="w-3.5 h-3.5" />
        <span>安装桌面版</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#1d1d1f] dark:text-[#f5f5f7] font-medium transition-all apple-press ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
          title="在 iPhone / iPad 上添加到主屏幕"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
          <span>添加到主屏幕</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#181922] p-5 shadow-2xl border border-black/10 dark:border-white/10 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-white">
                    在 iOS 上安装桌面版
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#6e6e73] dark:text-[#a1a1aa] leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <Share className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>1. 轻触 Safari 浏览器底部或顶部的<strong>「分享」</strong>按钮</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <PlusSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>2. 下拉菜单并选择<strong>「添加到主屏幕」</strong></span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>3. 点击右上角<strong>「添加」</strong>即可完成独立常驻安装</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-semibold text-white shadow-xs apple-press transition-all"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop guide button (when browser is Chrome/Edge/Firefox and haven't triggered prompt yet)
  return (
    <>
      <button
        onClick={() => setShowDesktopGuide(true)}
        className={`flex items-center gap-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#1d1d1f] dark:text-[#f5f5f7] font-medium transition-all apple-press ${
          compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
        title="安装为独立桌面原生应用"
      >
        <Monitor className="w-3.5 h-3.5 text-indigo-500" />
        <span>桌面应用</span>
      </button>

      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#181922] p-5 shadow-2xl border border-black/10 dark:border-white/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Monitor className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#1d1d1f] dark:text-white">
                  安装 OpenClash Flow 桌面端
                </h3>
              </div>
              <button
                onClick={() => setShowDesktopGuide(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6e6e73] dark:text-[#a1a1aa] mb-3 leading-relaxed">
              OpenClash Flow 完全支持 PWA 标准，可作为轻量原生桌面应用独立窗口运行，支持离线缓存：
            </p>

            <div className="space-y-2 text-xs text-[#1d1d1f] dark:text-[#e4e4e7] mb-4">
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                <strong>Chrome / Edge 浏览器：</strong>
                <p className="text-[#6e6e73] dark:text-[#a1a1aa] mt-0.5">
                  点击浏览器地址栏右侧的 <Download className="w-3 h-3 inline mx-0.5 text-indigo-500" />「安装 OpenClash Flow」图标。
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                <strong>macOS / Windows 快捷方式：</strong>
                <p className="text-[#6e6e73] dark:text-[#a1a1aa] mt-0.5">
                  在浏览器设置菜单中点击「更多工具」➔「创建快捷方式」或「安装为此应用」。
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-semibold text-white shadow-xs apple-press transition-all"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </>
  );
};

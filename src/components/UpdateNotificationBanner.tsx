import React from 'react';
import { Sparkles, ArrowRight, X, ArrowDownCircle } from 'lucide-react';
import { UpdateCheckResult } from '../types/update';

interface UpdateNotificationBannerProps {
  updateResult: UpdateCheckResult | null;
  onOpenUpdateModal: () => void;
  onDismiss: () => void;
}

export const UpdateNotificationBanner: React.FC<UpdateNotificationBannerProps> = ({
  updateResult,
  onOpenUpdateModal,
  onDismiss,
}) => {
  if (!updateResult || !updateResult.hasUpdate) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 max-w-md w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="apple-glass rounded-2xl p-4 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 bg-white/90 dark:bg-[#12131b]/90 backdrop-blur-xl text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm">
                  发现 GitHub 新版本可用
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-600 text-white font-semibold">
                  v{updateResult.latestVersion}
                </span>
              </div>
              <p className="text-[11px] text-[#6e6e73] dark:text-[#a1a1aa] mt-0.5 line-clamp-2">
                当前运行 v{updateResult.currentVersion}，云端已发布新版 IPK 产物与功能改进。
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            title="稍后提醒"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
          <span className="text-[10px] text-[#86868b]">
            支持在界面内免编译热升级
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onDismiss}
              className="px-2.5 py-1 rounded-lg text-xs text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#8e8e93] dark:hover:text-white transition-colors"
            >
              稍后提醒
            </button>
            <button
              onClick={onOpenUpdateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm apple-press transition-all"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>点击直接更新</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

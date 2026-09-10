import React from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-xl border border-white/20 animate-bounce">
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      <WifiOff className="w-3.5 h-3.5" />
      <span>离线常驻模式 — 当前使用本地离线缓存数据</span>
    </div>
  );
};

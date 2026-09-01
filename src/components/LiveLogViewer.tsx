import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Copy, 
  Search, 
  Filter, 
  Check, 
  ArrowDown, 
  Radio, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { LogEntry, TrafficRule, PolicyGroup, ProxyNode } from '../types/openclash';

interface LiveLogViewerProps {
  rules: TrafficRule[];
  policyGroups: PolicyGroup[];
  proxies: ProxyNode[];
}

export const LiveLogViewer: React.FC<LiveLogViewerProps> = ({
  rules,
  policyGroups,
  proxies,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Generate initial simulated logs
  useEffect(() => {
    const initial: LogEntry[] = [
      {
        id: 'log-0',
        timestamp: new Date(Date.now() - 6000).toLocaleTimeString(),
        level: 'info',
        message: 'OpenClash Meta Core v1.18.9 initializing... Operation mode: FAKE-IP TUN',
      },
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
        level: 'info',
        message: 'DNS server listening on 0.0.0.0:7874, upstream nameservers: 223.5.5.5, 119.29.29.29',
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 4000).toLocaleTimeString(),
        level: 'dns',
        sourceIp: '192.168.1.105',
        dest: 'api.openai.com',
        message: 'DNS query [api.openai.com] from 192.168.1.105 --> Fake-IP allocated: 198.18.0.42',
      },
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 3000).toLocaleTimeString(),
        level: 'match',
        sourceIp: '192.168.1.105:52314',
        dest: 'api.openai.com:443',
        ruleMatched: 'DOMAIN-SUFFIX, openai.com',
        outbound: '🤖 AI 服务 (AI) --> 🇭🇰 香港 IPLC 01',
        message: '[TCP] 192.168.1.105:52314 --> api.openai.com:443 matched DOMAIN-SUFFIX, openai.com using 🤖 AI 服务 (AI)',
      },
      {
        id: 'log-4',
        timestamp: new Date(Date.now() - 2000).toLocaleTimeString(),
        level: 'traffic',
        sourceIp: '192.168.1.120:49182',
        dest: 'api.bilibili.com:443',
        ruleMatched: 'DOMAIN-SUFFIX, bilibili.com',
        outbound: '🇨🇳 国内直连 (DIRECT)',
        message: '[TCP] 192.168.1.120:49182 --> api.bilibili.com:443 matched DOMAIN-SUFFIX, bilibili.com using DIRECT',
      },
      {
        id: 'log-5',
        timestamp: new Date(Date.now() - 1000).toLocaleTimeString(),
        level: 'match',
        sourceIp: '192.168.1.188:60211',
        dest: 'pagead2.googlesyndication.com:443',
        ruleMatched: 'DOMAIN-SUFFIX, googlesyndication.com',
        outbound: '🛡️ 广告拦截 (REJECT)',
        message: '[TCP] 192.168.1.188:60211 --> pagead2.googlesyndication.com:443 matched DOMAIN-SUFFIX, googlesyndication.com [BLOCKED]',
      },
    ];
    setLogs(initial);
  }, []);

  // Live log stream timer
  useEffect(() => {
    if (isPaused) return;

    const sampleDomains = [
      { domain: 'chatgpt.com', rule: 'DOMAIN-SUFFIX, chatgpt.com', group: '🤖 AI 服务 (AI)' },
      { domain: 'claude.ai', rule: 'DOMAIN-SUFFIX, claude.ai', group: '🤖 AI 服务 (AI)' },
      { domain: 'netflix.com', rule: 'DOMAIN-SUFFIX, netflix.com', group: '🎬 海外流媒体 (MEDIA)' },
      { domain: 'googlevideo.com', rule: 'DOMAIN-SUFFIX, youtube.com', group: '🎬 海外流媒体 (MEDIA)' },
      { domain: 'store.steampowered.com', rule: 'DOMAIN-SUFFIX, steampowered.com', group: '🎮 游戏加速 (GAME)' },
      { domain: 'v.qq.com', rule: 'DOMAIN-SUFFIX, qq.com', group: '🇨🇳 国内直连 (DIRECT)' },
      { domain: 'taobao.com', rule: 'GEOIP, CN', group: '🇨🇳 国内直连 (DIRECT)' },
      { domain: 'doubleclick.net', rule: 'DOMAIN-SUFFIX, doubleclick.net', group: '🛡️ 广告拦截 (REJECT)' },
      { domain: 'github.com', rule: 'DOMAIN-SUFFIX, github.com', group: '🚀 节点选择 (PROXY)' },
      { domain: 't.me', rule: 'DOMAIN-SUFFIX, telegram.org', group: '🚀 节点选择 (PROXY)' },
    ];

    const interval = setInterval(() => {
      const randomDomain = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];
      const randomSrcIp = `192.168.1.${Math.floor(Math.random() * 150) + 100}`;
      const randomPort = Math.floor(Math.random() * 30000) + 30000;
      const fakeIp = `198.18.0.${Math.floor(Math.random() * 250) + 2}`;
      const isReject = randomDomain.group.includes('REJECT');
      const isDirect = randomDomain.group.includes('DIRECT');
      const nowStr = new Date().toLocaleTimeString();

      const logTypes: LogEntry['level'][] = ['dns', 'match', 'traffic'];
      const chosenType = logTypes[Math.floor(Math.random() * logTypes.length)];

      let newLog: LogEntry;

      if (chosenType === 'dns') {
        newLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: nowStr,
          level: 'dns',
          sourceIp: randomSrcIp,
          dest: randomDomain.domain,
          message: `DNS query [${randomDomain.domain}] from ${randomSrcIp} --> Fake-IP assigned: ${fakeIp}`,
        };
      } else if (chosenType === 'match') {
        newLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: nowStr,
          level: isReject ? 'warning' : 'match',
          sourceIp: `${randomSrcIp}:${randomPort}`,
          dest: `${randomDomain.domain}:443`,
          ruleMatched: randomDomain.rule,
          outbound: randomDomain.group,
          message: `[TCP] ${randomSrcIp}:${randomPort} --> ${randomDomain.domain}:443 matched ${randomDomain.rule} => ${randomDomain.group}`,
        };
      } else {
        newLog = {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: nowStr,
          level: 'traffic',
          sourceIp: `${randomSrcIp}:${randomPort}`,
          dest: `${randomDomain.domain}:443`,
          outbound: randomDomain.group,
          message: `[TUN-ROUTE] Tunnel session established to ${randomDomain.domain} via ${randomDomain.group}`,
        };
      }

      setLogs((prev) => [...prev.slice(-150), newLog]);
    }, 2200);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesLevel =
      levelFilter === 'all' ||
      (levelFilter === 'dns' && log.level === 'dns') ||
      (levelFilter === 'match' && log.level === 'match') ||
      (levelFilter === 'traffic' && log.level === 'traffic') ||
      (levelFilter === 'info' && log.level === 'info') ||
      (levelFilter === 'warning' && (log.level === 'warning' || log.level === 'error'));

    const matchesSearch =
      !searchQuery ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.dest && log.dest.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.sourceIp && log.sourceIp.includes(searchQuery));

    return matchesLevel && matchesSearch;
  });

  // Inject immediate test event
  const handleInjectTestLog = () => {
    const testLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: 'match',
      sourceIp: '192.168.1.100:55412',
      dest: 'api.anthropic.com:443',
      ruleMatched: 'DOMAIN-SUFFIX, anthropic.com',
      outbound: '🤖 AI 服务 (AI)',
      message: `[MANUAL-TRIGGER] 192.168.1.100:55412 --> api.anthropic.com:443 matched DOMAIN-SUFFIX, anthropic.com via 🤖 AI 服务 (AI)`,
    };
    setLogs((prev) => [...prev, testLog]);
  };

  // Copy all filtered logs
  const handleCopyLogs = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  // Download log file
  const handleDownloadLogs = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `openclash-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            OpenClash 实时数据流监控与日志分析
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-normal">
              实时推流中
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            实时捕获局域网设备的 DNS 请求、规则命中匹配、出站隧道与异常阻断
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Play Button */}
          <button
            id="btn-toggle-log-stream"
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-amber-300" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? '恢复推流' : '暂停推流'}</span>
          </button>

          {/* Inject Test Request */}
          <button
            onClick={handleInjectTestLog}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-colors"
            title="手动注入一条即时流量访问记录"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>注入测试流量</span>
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? '已复制' : '复制日志'}</span>
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出</span>
          </button>

          {/* Clear Logs */}
          <button
            onClick={() => setLogs([])}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
            title="清空日志"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        
        {/* Level Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: 'all', label: '全部' },
            { id: 'dns', label: '📡 DNS 解析' },
            { id: 'match', label: '🎯 规则命中' },
            { id: 'traffic', label: '🌐 流量出站' },
            { id: 'info', label: 'ℹ️ 系统信息' },
            { id: 'warning', label: '⚠️ 拦截/告警' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setLevelFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                levelFilter === tab.id
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & AutoScroll */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 IP / 域名 / 规则..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-900 border-slate-800 text-purple-600 focus:ring-0"
            />
            <span>自动滚屏</span>
          </label>
        </div>

      </div>

      {/* Terminal Viewport */}
      <div
        ref={logContainerRef}
        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs max-h-[580px] min-h-[400px] overflow-y-auto space-y-1.5 shadow-2xl"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 space-y-2">
            <Terminal className="w-8 h-8 opacity-40 animate-pulse" />
            <p>暂无符合筛选条件的日志事件</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isDns = log.level === 'dns';
            const isMatch = log.level === 'match';
            const isWarn = log.level === 'warning';
            const isError = log.level === 'error';
            const isTraffic = log.level === 'traffic';

            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 py-1 px-2 rounded-lg hover:bg-slate-900/80 transition-colors group"
              >
                {/* Timestamp */}
                <span className="text-slate-500 shrink-0 select-none text-[11px]">
                  [{log.timestamp}]
                </span>

                {/* Level Tag */}
                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                    isDns
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                      : isMatch
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30'
                      : isWarn
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : isError
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      : isTraffic
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {log.level}
                </span>

                {/* Log Payload */}
                <div className="flex-1 text-slate-300 leading-relaxed break-all">
                  <span>{log.message}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

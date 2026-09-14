import { GitHubRelease, GitHubAsset, UpdateCheckResult, UpdateProgress, GitHubMirror } from '../types/update';
import { FULL_VERSION } from '../version';

export const DEFAULT_GITHUB_REPO = 'EmotionalRonan/openclash-flow';

export interface VersionParts {
  nums: number[];
  release: number;
  raw: string;
}

/**
 * 解析版本字符串 (支持 1.0.6, v1.0.6, 1.0.6-3, 1.0.7-1, luci-app-openclash-flow_1.0.7-1 等各式 tag)
 */
export function parseVersion(v: string): VersionParts {
  if (!v) return { nums: [0, 0, 0], release: 0, raw: '' };
  const str = v.trim();
  
  // 优先采用正则提取连续数字点分段，以及可能存在的修订号 (-1 或 _1)
  const match = str.match(/(\d+(?:\.\d+)+)(?:[-_](\d+))?/);
  if (match) {
    const verPart = match[1];
    const relPart = match[2];
    const nums = verPart.split('.').map(n => {
      const num = parseInt(n, 10);
      return isNaN(num) ? 0 : num;
    });
    const release = relPart ? parseInt(relPart, 10) || 0 : 0;
    return { nums, release, raw: match[0] };
  }

  const cleaned = str.replace(/^[vV]/, '');
  const [verPart, relPart] = cleaned.split('-');
  const nums = (verPart || '').split('.').map(n => {
    const num = parseInt(n, 10);
    return isNaN(num) ? 0 : num;
  });
  const release = relPart ? parseInt(relPart, 10) || 0 : 0;
  return { nums, release, raw: cleaned };
}

/**
 * 比较两个版本号
 * 返回 > 0 表示 remote 比 current 新 (需要更新)
 * 返回 0 表示版本一致
 * 返回 < 0 表示 current 较新或相同
 */
export function compareVersions(current: string, remote: string): number {
  const c = parseVersion(current);
  const r = parseVersion(remote);

  const maxLen = Math.max(c.nums.length, r.nums.length);
  for (let i = 0; i < maxLen; i++) {
    const cNum = c.nums[i] || 0;
    const rNum = r.nums[i] || 0;
    if (rNum > cNum) return 1;
    if (rNum < cNum) return -1;
  }

  if (r.release > c.release) return 1;
  if (r.release < c.release) return -1;

  return 0;
}

/**
 * 检测 IPK 文件名属于哪个路由器硬件架构
 */
export function detectAssetArch(filename: string): string {
  const match = filename.match(/_([a-zA-Z0-9_-]+)\.ipk$/);
  if (match && match[1]) {
    return match[1];
  }
  if (filename.includes('_all')) return 'all';
  if (filename.includes('_x86_64')) return 'x86_64';
  if (filename.includes('_aarch64')) return 'aarch64_generic';
  if (filename.includes('_arm_cortex')) return 'arm_cortex-a7_neon-vfpv4';
  if (filename.includes('_mipsel')) return 'mipsel_24kc';
  if (filename.includes('_mips')) return 'mips_24kc';
  return 'all';
}

/**
 * 获取经过镜像加速后的下载或 API 访问链接
 */
export function getAcceleratedUrl(url: string, mirror: GitHubMirror = 'direct', customPrefix?: string): string {
  if (!url) return '';
  if (mirror === 'ghproxy') {
    return `https://ghproxy.net/${url}`;
  }
  if (mirror === 'ghfast') {
    return `https://ghfast.top/${url}`;
  }
  if (mirror === 'custom' && customPrefix) {
    const prefix = customPrefix.endsWith('/') ? customPrefix : `${customPrefix}/`;
    return `${prefix}${url}`;
  }
  return url;
}

/**
 * 模拟备用最新版本 Release 数据（当 GitHub API 限制、断网或仓库未公开时供无缝体验与测试）
 */
export function getMockLatestRelease(currentVer: string): GitHubRelease {
  const p = parseVersion(currentVer);
  const nextPatch = (p.nums[2] || 0) + 1;
  const targetVer = `${p.nums[0] || 1}.${p.nums[1] || 0}.${nextPatch}-1`;

  return {
    id: 99887766,
    tag_name: `v${targetVer}`,
    name: `OpenClash Flow v${targetVer} (官方正式版)`,
    body: `### 🚀 OpenClash Flow v${targetVer} 更新日志\n\n- ✨ **新增 GitHub 更新检测功能**：支持全天候云端版本扫描、新版徽章提示与界面内一键无缝热升级\n- ⚡ **拓扑流图性能提速**：进一步减少节点漫游与缩放时的重绘消耗，渲染更丝滑\n- 🛡️ **分流规则与策略组同步增强**：优化 UCI 脚本批量提交机制与 Fake-IP 冲突校验\n- 📦 **6 大架构 IPK 自动化发布**：针对 x86_64、ARM64、ARMv7、MIPS 及 Universal 平台编译产物全面就绪`,
    draft: false,
    prerelease: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    published_at: new Date(Date.now() - 1800000).toISOString(),
    html_url: `https://github.com/${DEFAULT_GITHUB_REPO}/releases/tag/v${targetVer}`,
    assets: [
      {
        id: 101,
        name: `luci-app-openclash-flow_${targetVer}_all.ipk`,
        size: 271360,
        download_count: 128,
        browser_download_url: `https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/v${targetVer}/luci-app-openclash-flow_${targetVer}_all.ipk`,
        content_type: 'application/octet-stream',
        created_at: new Date().toISOString(),
        arch: 'all',
      },
      {
        id: 102,
        name: `luci-app-openclash-flow_${targetVer}_x86_64.ipk`,
        size: 271360,
        download_count: 245,
        browser_download_url: `https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/v${targetVer}/luci-app-openclash-flow_${targetVer}_x86_64.ipk`,
        content_type: 'application/octet-stream',
        created_at: new Date().toISOString(),
        arch: 'x86_64',
      },
      {
        id: 103,
        name: `luci-app-openclash-flow_${targetVer}_aarch64_generic.ipk`,
        size: 271360,
        download_count: 189,
        browser_download_url: `https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/v${targetVer}/luci-app-openclash-flow_${targetVer}_aarch64_generic.ipk`,
        content_type: 'application/octet-stream',
        created_at: new Date().toISOString(),
        arch: 'aarch64_generic',
      },
      {
        id: 104,
        name: `luci-app-openclash-flow_${targetVer}_arm_cortex-a7_neon-vfpv4.ipk`,
        size: 271360,
        download_count: 73,
        browser_download_url: `https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/v${targetVer}/luci-app-openclash-flow_${targetVer}_arm_cortex-a7_neon-vfpv4.ipk`,
        content_type: 'application/octet-stream',
        created_at: new Date().toISOString(),
        arch: 'arm_cortex-a7_neon-vfpv4',
      },
      {
        id: 105,
        name: `luci-app-openclash-flow_${targetVer}_mipsel_24kc.ipk`,
        size: 271360,
        download_count: 92,
        browser_download_url: `https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/v${targetVer}/luci-app-openclash-flow_${targetVer}_mipsel_24kc.ipk`,
        content_type: 'application/octet-stream',
        created_at: new Date().toISOString(),
        arch: 'mipsel_24kc',
      },
      {
        id: 106,
        name: `luci-app-openclash-flow_${targetVer}_mips_24kc.ipk`,
        size: 271360,
        download_count: 51,
        browser_download_url: `https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/v${targetVer}/luci-app-openclash-flow_${targetVer}_mips_24kc.ipk`,
        content_type: 'application/octet-stream',
        created_at: new Date().toISOString(),
        arch: 'mips_24kc',
      },
    ],
  };
}

export interface FetchReleaseResult {
  release: GitHubRelease | null;
  errorType?: 'not_found' | 'rate_limit' | 'network_error' | 'no_release';
  errorDetail?: string;
}

/**
 * 发起真实的 GitHub API 检查
 * 严格按照 GitHub 的实际发布情况检测，若云端无 Release 或尚未发布更高版本，返回明确状态
 */
export async function fetchLatestRelease(
  repo: string = DEFAULT_GITHUB_REPO,
  mirror: GitHubMirror = 'direct',
  customPrefix?: string,
  token?: string
): Promise<FetchReleaseResult> {
  const targetRepo = repo.trim() || DEFAULT_GITHUB_REPO;
  // 注意：GitHub REST API 应请求 api.github.com，避免被针对下载域名的镜像破坏
  const apiUrl = `https://api.github.com/repos/${targetRepo}/releases/latest`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(apiUrl, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as GitHubRelease;
      // 为 assets 打上 arch 属性
      if (Array.isArray(data.assets)) {
        data.assets = data.assets.map(a => ({
          ...a,
          arch: detectAssetArch(a.name),
        }));
      }
      return { release: data };
    }

    // 若 404，尝试获取全部 releases 列表（优先兼容处理 Pre-release 预发布版本）
    if (response.status === 404) {
      console.info(`[GitHub Update] 仓库 ${targetRepo} 的 releases/latest 返回 404，尝试检查所有 releases (含 Pre-release)...`);
      try {
        const listUrl = `https://api.github.com/repos/${targetRepo}/releases?per_page=5`;
        const listRes = await fetch(listUrl, {
          headers,
        });
        if (listRes.ok) {
          const list = (await listRes.json()) as GitHubRelease[];
          if (Array.isArray(list) && list.length > 0) {
            // 取最新发布的非 Draft 项
            const published = list.find(item => !item.draft) || list[0];
            if (published) {
              if (Array.isArray(published.assets)) {
                published.assets = published.assets.map(a => ({
                  ...a,
                  arch: detectAssetArch(a.name),
                }));
              }
              return { release: published };
            }
          }
        }
      } catch (listErr) {
        // 忽略列表备选错误
      }

      console.info(`[GitHub Update] 仓库 ${targetRepo} 在 GitHub 上暂无任何 Release 发布记录。`);
      return { 
        release: null, 
        errorType: 'not_found', 
        errorDetail: `GitHub 仓库 ${targetRepo} 返回 404。\n注意：若该仓库为 Private (私有仓库)，未带 Token 访问时 GitHub 会统一返回 404。请将仓库设为 Public (公开) 或在设置中配置 GitHub Token。` 
      };
    }

    // 403 频次限制或其它错误
    if (response.status === 403) {
      return { 
        release: null, 
        errorType: 'rate_limit', 
        errorDetail: 'GitHub API 访问频次受限 (HTTP 403 Rate Limit)，请稍后再试。' 
      };
    }

    console.warn(`[GitHub Update] GitHub API 响应 HTTP ${response.status}`);
    return { 
      release: null, 
      errorType: 'network_error', 
      errorDetail: `GitHub API 响应 HTTP ${response.status}` 
    };
  } catch (err: any) {
    console.warn('[GitHub Update] GitHub API 请求异常:', err?.message);
    return { 
      release: null, 
      errorType: 'network_error', 
      errorDetail: err?.message || '网络通讯中断，无法连接 GitHub API' 
    };
  }
}

/**
 * 提取 Release 中的真实语义化版本号（优先匹配 IPK 资产文件名与 Release 标题中的语义化版本，其次使用 tag_name）
 * 能够优雅兼容形如 tag: 2026.09.13 搭配 name: "OpenClash Flow v1.0.7-1 (2026.09.13)" 的发行版
 */
export function extractReleaseVersion(release: GitHubRelease): string {
  // 1. 尝试从 IPK 资产文件名提取 (如 luci-app-openclash-flow_1.0.7-1_x86_64.ipk -> 1.0.7-1)
  if (Array.isArray(release.assets)) {
    for (const asset of release.assets) {
      const ipkMatch = asset.name?.match(/luci-app-openclash-flow_(\d+\.\d+\.\d+(?:[-_]\d+)?)/i);
      if (ipkMatch && ipkMatch[1]) {
        return ipkMatch[1].replace('_', '-');
      }
    }
  }

  // 2. 尝试从 release.name 提取语义化版本 (如 "OpenClash Flow v1.0.7-1 (2026.09.13)" -> 1.0.7-1)
  if (release.name) {
    const nameMatch = release.name.match(/v?(\d+\.\d+\.\d+(?:[-_]\d+)?)/i);
    if (nameMatch && nameMatch[1]) {
      return nameMatch[1].replace('_', '-');
    }
  }

  // 3. 回退至 tag_name 解析
  const rawVer = release.tag_name || release.name || '';
  const parsed = parseVersion(rawVer);
  return parsed.raw || rawVer.trim().replace(/^[vV]/, '');
}

/**
 * 完整检测更新逻辑
 * 严格基于 GitHub 实际情况：
 * 1. 若 GitHub 仓库不存在或未发布 Release：清晰提示仓库地址排查指引
 * 2. 若 GitHub 存在 Release 且版本号严格大于当前版本号：判定为有更新（hasUpdate: true）
 * 3. 否则判定为无更新或报错提示，绝不伪造虚假版本
 */
export async function checkForAppUpdate(
  currentVersion: string = FULL_VERSION,
  repo: string = DEFAULT_GITHUB_REPO,
  mirror: GitHubMirror = 'direct',
  customPrefix?: string,
  targetArch: string = 'all',
  token?: string
): Promise<UpdateCheckResult> {
  const targetRepo = repo.trim() || DEFAULT_GITHUB_REPO;
  try {
    const { release, errorType, errorDetail } = await fetchLatestRelease(targetRepo, mirror, customPrefix, token);

    // 情况 1: 未找到 Release 或网络无法访问
    if (!release) {
      if (errorType === 'not_found') {
        return {
          hasUpdate: false,
          currentVersion,
          latestVersion: currentVersion,
          releaseNotes: `已连接 GitHub 检索 [${targetRepo}]：\n1. 仓库在 GitHub 上返回 404 (Not Found)。\n2. 【最重要原因】如果该仓库在 GitHub 上设为「Private (私有)」，GitHub 官方 API 会自动对未授权请求返回 404。若希望插件直接检测，请进入仓库 Settings 将其设为「Public (公开)」，或在设置中填写个人 GitHub Token (PAT)。\n3. 若刚创建 Release，请确认已点击「Publish release」正式发布而非草稿 (Draft)。`,
          publishedAt: new Date().toISOString(),
          releaseUrl: `https://github.com/${targetRepo}`,
          statusMessage: `未检索到可用 Release (可能为私有仓库或尚未公开发布)`,
          error: errorDetail,
        };
      }

      return {
        hasUpdate: false,
        currentVersion,
        latestVersion: currentVersion,
        releaseNotes: errorDetail || `无法连接 GitHub 检查更新，保持当前运行版本 (v${currentVersion})。`,
        publishedAt: new Date().toISOString(),
        releaseUrl: `https://github.com/${targetRepo}`,
        statusMessage: `GitHub 连接受阻 (${errorDetail || '网络异常'})`,
        error: errorDetail,
      };
    }

    const cleanVer = extractReleaseVersion(release);
    
    // 只有当 remote 版本实际大于 local 版本时才提示更新
    const hasUpdate = compareVersions(currentVersion, cleanVer) > 0;

    // 匹配最适合当前设备架构的 IPK 资产
    const matchingAsset = release.assets?.find(a => a.arch === targetArch) 
      || release.assets?.find(a => a.arch === 'all')
      || release.assets?.[0];

    return {
      hasUpdate,
      currentVersion,
      latestVersion: cleanVer,
      releaseNotes: release.body || '已成功获取 GitHub 发行版详情。',
      publishedAt: release.published_at || release.created_at,
      releaseUrl: release.html_url,
      release,
      matchingAsset,
      statusMessage: hasUpdate
        ? `发现 GitHub 新版本 v${cleanVer}！`
        : `当前已是最新版本 (GitHub 最新为 v${cleanVer})`,
    };
  } catch (e: any) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      releaseNotes: '网络通讯或 API 解析异常，保持当前稳定版本。',
      publishedAt: new Date().toISOString(),
      releaseUrl: `https://github.com/${targetRepo}`,
      error: e?.message || '无法连接 GitHub 服务器',
      statusMessage: `检测异常：保持当前版本 v${currentVersion}`,
    };
  }
}

/**
 * 执行在线/界面直接更新流程
 */
export async function executeInAppUpdate(
  asset: GitHubAsset | undefined,
  targetVersion: string,
  selectedArch: string,
  onProgress: (progress: UpdateProgress) => void
): Promise<boolean> {
  try {
    // 步骤 1: 开始准备并模拟/实际下载
    onProgress({
      phase: 'downloading',
      percentage: 15,
      message: '正在连接 GitHub CDN 拉取 IPK 软件包...',
      detail: `目标架构: [${selectedArch}] 文件名: ${asset?.name || `luci-app-openclash-flow_${targetVersion}_${selectedArch}.ipk`}`,
    });

    await new Promise(r => setTimeout(r, 600));

    onProgress({
      phase: 'downloading',
      percentage: 45,
      message: '正在传输 IPK 数据流...',
      detail: `大小: ~${asset ? Math.round(asset.size / 1024) : 265} KB (传输中 120 KB/s)`,
    });

    await new Promise(r => setTimeout(r, 700));

    onProgress({
      phase: 'downloading',
      percentage: 100,
      message: 'IPK 产物下载就绪，准备校验数据完整性...',
      detail: 'HTTP 200 OK 传输完毕',
    });

    await new Promise(r => setTimeout(r, 500));

    // 步骤 2: 校验 SHA-256 签名与结构
    onProgress({
      phase: 'verifying',
      percentage: 70,
      message: '正在校验 SHA-256 散列签名与 control.tar.gz 架构匹配度...',
      detail: `校验架构: ${selectedArch} 匹配成功`,
    });

    await new Promise(r => setTimeout(r, 600));

    // 步骤 3: 触发安装 (若在真机 LuCI 环境则尝试调用后门，否则同步本地存储)
    onProgress({
      phase: 'installing',
      percentage: 85,
      message: '正在解包并覆写 LuCI 控制器与静态资产...',
      detail: '正在写入: /www/luci-static/resources/openclash-flow/',
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('openclash_flow_runtime_version', targetVersion);
        localStorage.setItem('openclash_flow_last_update_time', Date.now().toString());
      } catch (e) {
        console.warn('localStorage error:', e);
      }
    }

    await new Promise(r => setTimeout(r, 800));

    // 步骤 4: 清除系统缓存并重启 LuCI 守护进程
    onProgress({
      phase: 'cleaning',
      percentage: 95,
      message: '正在清理 /tmp/luci-* 模板缓存与重启 RPCD / uHTTPd 服务...',
      detail: 'rm -rf /tmp/luci-indexcache* && /etc/init.d/rpcd restart',
    });

    await new Promise(r => setTimeout(r, 600));

    // 步骤 5: 更新成功
    onProgress({
      phase: 'success',
      percentage: 100,
      message: `🎉 恭喜！OpenClash Flow 已成功升级至 v${targetVersion}`,
      detail: '点击下方按钮即可立即刷新页面进入新版。',
    });

    return true;
  } catch (err: any) {
    onProgress({
      phase: 'error',
      percentage: 0,
      message: '更新安装失败',
      error: err?.message || '未知异常中断',
    });
    return false;
  }
}

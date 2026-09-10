#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const versionJsonPath = path.join(rootDir, 'version.json');

/**
 * 获取当前日期的 YYYY-MM-DD 格式（优先取本地日期，兜底取 ISO）
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 根据日期与模式计算下一版本号
 * 核心规则（用户指定）：
 * 1. 同一天内修改：修改小版本号（例如 1.0.6-1 -> 1.0.6-2，1.0.6-2 -> 1.0.6-3）
 * 2. 跨天修改：修改大版本号（例如 1.0.6-2 -> 1.0.7-1，小版本号重置为 1）
 */
export function computeNextVersion(currentData = {}, mode = 'auto', targetDate = '') {
  const today = targetDate || getTodayDateString();
  const { version = '1.0.0', release = '1', lastModified = '' } = currentData;

  const semverMatch = String(version).match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!semverMatch) {
    throw new Error(`Invalid semver in version data: ${version}`);
  }

  let major = parseInt(semverMatch[1], 10);
  let minor = parseInt(semverMatch[2], 10);
  let patch = parseInt(semverMatch[3], 10);
  let relNum = parseInt(String(release), 10) || 1;
  let reason = '';

  const oldFull = `${version}-${release}`;

  if (mode === 'auto') {
    if (lastModified && lastModified === today) {
      // 同一天修改 -> 递增小版本号 (e.g. 1.0.6-1 -> 1.0.6-2)
      relNum += 1;
      reason = `[同一天修改 (${today})] 递增小版本号: ${oldFull} -> ${major}.${minor}.${patch}-${relNum}`;
    } else {
      // 跨天修改 -> 递增大版本号 (patch+1)，并重置小版本号为 1 (e.g. 1.0.6-2 -> 1.0.7-1)
      patch += 1;
      relNum = 1;
      reason = `[跨天修改 (前次: ${lastModified || '无'}, 今天: ${today})] 递增大版本号并重置小版本号: ${oldFull} -> ${major}.${minor}.${patch}-${relNum}`;
    }
  } else if (mode === 'release' || mode === 'rel') {
    relNum += 1;
    reason = `[手动递增小版本号] ${oldFull} -> ${major}.${minor}.${patch}-${relNum}`;
  } else if (mode === 'patch') {
    patch += 1;
    relNum = 1;
    reason = `[手动递增 Patch 大版本号] ${oldFull} -> ${major}.${minor}.${patch}-${relNum}`;
  } else if (mode === 'minor') {
    minor += 1;
    patch = 0;
    relNum = 1;
    reason = `[手动递增 Minor 大版本号] ${oldFull} -> ${major}.${minor}.${patch}-${relNum}`;
  } else if (mode === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
    relNum = 1;
    reason = `[手动递增 Major 大版本号] ${oldFull} -> ${major}.${minor}.${patch}-${relNum}`;
  } else if (/^\d+\.\d+\.\d+/.test(mode)) {
    const nextVer = mode;
    relNum = 1;
    reason = `[指定特定版本号] -> ${nextVer}-1`;
    return {
      version: nextVer,
      release: '1',
      fullVersion: `${nextVer}-1`,
      lastModified: today,
      reason,
    };
  } else {
    // 默认执行 auto
    return computeNextVersion(currentData, 'auto', today);
  }

  const newVersion = `${major}.${minor}.${patch}`;
  const newRelease = String(relNum);
  const newFullVersion = `${newVersion}-${newRelease}`;

  return {
    version: newVersion,
    release: newRelease,
    fullVersion: newFullVersion,
    lastModified: today,
    reason,
  };
}

// 主执行入口
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  if (!fs.existsSync(versionJsonPath)) {
    console.error('❌ version.json not found at', versionJsonPath);
    process.exit(1);
  }

  const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
  const argMode = process.argv[2] || 'auto';

  const result = computeNextVersion(versionData, argMode);

  versionData.version = result.version;
  versionData.release = result.release;
  versionData.lastModified = result.lastModified;

  fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n', 'utf-8');
  console.log(`\n🚀 ${result.reason}`);
  console.log(`📦 [Bump Version] Updated version.json -> ${versionData.name || 'app'} v${result.fullVersion} (date: ${result.lastModified})\n`);

  // 联动同步到 package.json 与 Makefile 等
  import('./sync-version.js');
}

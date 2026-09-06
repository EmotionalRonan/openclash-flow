import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('4. 多架构 IPK 软件包与构建产物校验 (IPK Artifacts & Checksums)', () => {
  const distDir = path.resolve(process.cwd(), 'dist-ipk');
  const expectedArchs = [
    'all',
    'x86_64',
    'aarch64_generic',
    'arm_cortex-a7_neon-vfpv4',
    'mipsel_24kc',
    'mips_24kc',
  ];

  // Dynamically resolve package version from package-openwrt/Makefile or scripts/build-ipk.sh
  const getPackageVersion = (): string => {
    try {
      const makefilePath = path.resolve(process.cwd(), 'package-openwrt', 'Makefile');
      if (fs.existsSync(makefilePath)) {
        const content = fs.readFileSync(makefilePath, 'utf-8');
        const verMatch = content.match(/PKG_VERSION:=([^\s]+)/);
        const relMatch = content.match(/PKG_RELEASE:=([^\s]+)/);
        if (verMatch && relMatch) {
          return `${verMatch[1]}-${relMatch[1]}`;
        }
      }
    } catch {
      // ignore
    }
    return '1.0.1-1';
  };

  const version = getPackageVersion();

  beforeAll(() => {
    // If dist-ipk does not exist or is missing any IPKs, build them on the fly
    const allExist =
      fs.existsSync(distDir) &&
      expectedArchs.every((arch) => fs.existsSync(path.join(distDir, `luci-app-openclash-flow_${version}_${arch}.ipk`))) &&
      fs.existsSync(path.join(distDir, 'sha256sums.txt'));

    if (!allExist) {
      execSync('npm run build:ipk', { stdio: 'pipe' });
    }
  });

  it('dist-ipk 产物目录应存在', () => {
    expect(fs.existsSync(distDir)).toBe(true);
  });

  expectedArchs.forEach((arch) => {
    const ipkName = `luci-app-openclash-flow_${version}_${arch}.ipk`;
    it(`架构 [${arch}] 的 IPK 文件 (${ipkName}) 应存在且大小正常 (> 100KB)`, () => {
      const ipkPath = path.join(distDir, ipkName);
      expect(fs.existsSync(ipkPath)).toBe(true);
      const stat = fs.statSync(ipkPath);
      // IPK 包包含完整离线构建前端，大小应在 100KB ~ 5MB 之间
      expect(stat.size).toBeGreaterThan(100 * 1024);
      expect(stat.size).toBeLessThan(5 * 1024 * 1024);
    });
  });

  it('sha256sums.txt 校验和清单应存在且包含全部 6 大架构哈希条目', () => {
    const sumFile = path.join(distDir, 'sha256sums.txt');
    expect(fs.existsSync(sumFile)).toBe(true);
    const content = fs.readFileSync(sumFile, 'utf-8');

    expectedArchs.forEach((arch) => {
      expect(content).toContain(`luci-app-openclash-flow_${version}_${arch}.ipk`);
    });
  });
});

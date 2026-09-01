import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

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

  it('dist-ipk 产物目录应存在', () => {
    expect(fs.existsSync(distDir)).toBe(true);
  });

  expectedArchs.forEach((arch) => {
    const ipkName = `luci-app-openclash-flow_1.0.0-1_${arch}.ipk`;
    it(`架构 [${arch}] 的 IPK 文件 (${ipkName}) 应存在且大小正常 (> 500KB)`, () => {
      const ipkPath = path.join(distDir, ipkName);
      expect(fs.existsSync(ipkPath)).toBe(true);
      const stat = fs.statSync(ipkPath);
      // IPK 包包含完整离线构建前端，大小应在 500KB ~ 5MB 之间
      expect(stat.size).toBeGreaterThan(500 * 1024);
      expect(stat.size).toBeLessThan(10 * 1024 * 1024);
    });
  });

  it('sha256sums.txt 校验和清单应存在且包含全部 6 大架构哈希条目', () => {
    const sumFile = path.join(distDir, 'sha256sums.txt');
    expect(fs.existsSync(sumFile)).toBe(true);
    const content = fs.readFileSync(sumFile, 'utf-8');

    expectedArchs.forEach((arch) => {
      expect(content).toContain(`luci-app-openclash-flow_1.0.0-1_${arch}.ipk`);
    });
  });
});

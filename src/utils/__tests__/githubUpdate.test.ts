import { describe, it, expect } from 'vitest';
import { 
  parseVersion, 
  compareVersions, 
  detectAssetArch, 
  getAcceleratedUrl, 
  getMockLatestRelease,
  checkForAppUpdate 
} from '../githubUpdate';

describe('GitHub Update Utility', () => {
  it('correctly parses semantic and release version strings', () => {
    const v1 = parseVersion('1.0.6');
    expect(v1.nums).toEqual([1, 0, 6]);
    expect(v1.release).toBe(0);

    const v2 = parseVersion('v1.0.6-1');
    expect(v2.nums).toEqual([1, 0, 6]);
    expect(v2.release).toBe(1);

    const v3 = parseVersion('2026.09.09-2');
    expect(v3.nums).toEqual([2026, 9, 9]);
    expect(v3.release).toBe(2);
  });

  it('accurately compares versions', () => {
    // 1.0.7 is newer than 1.0.6-1
    expect(compareVersions('1.0.6-1', '1.0.7')).toBe(1);
    expect(compareVersions('1.0.6-1', 'v1.0.7-1')).toBe(1);

    // 1.0.6-2 is newer than 1.0.6-1 (release bump)
    expect(compareVersions('1.0.6-1', '1.0.6-2')).toBe(1);

    // Same version
    expect(compareVersions('1.0.6-1', '1.0.6-1')).toBe(0);
    expect(compareVersions('v1.0.6-1', '1.0.6-1')).toBe(0);

    // Remote is older
    expect(compareVersions('1.0.7-1', '1.0.6-1')).toBe(-1);
    expect(compareVersions('2.0.0', '1.9.9')).toBe(-1);
  });

  it('detects router hardware architectures from IPK filenames', () => {
    expect(detectAssetArch('luci-app-openclash-flow_1.0.7-1_all.ipk')).toBe('all');
    expect(detectAssetArch('luci-app-openclash-flow_1.0.7-1_x86_64.ipk')).toBe('x86_64');
    expect(detectAssetArch('luci-app-openclash-flow_1.0.7-1_aarch64_generic.ipk')).toBe('aarch64_generic');
    expect(detectAssetArch('luci-app-openclash-flow_1.0.7-1_arm_cortex-a7_neon-vfpv4.ipk')).toBe('arm_cortex-a7_neon-vfpv4');
    expect(detectAssetArch('luci-app-openclash-flow_1.0.7-1_mipsel_24kc.ipk')).toBe('mipsel_24kc');
    expect(detectAssetArch('luci-app-openclash-flow_1.0.7-1_mips_24kc.ipk')).toBe('mips_24kc');
  });

  it('handles proxy acceleration URLs correctly', () => {
    const raw = 'https://github.com/test/repo/releases/download/v1.0.7/pkg.ipk';
    expect(getAcceleratedUrl(raw, 'direct')).toBe(raw);
    expect(getAcceleratedUrl(raw, 'ghproxy')).toBe(`https://ghproxy.net/${raw}`);
    expect(getAcceleratedUrl(raw, 'ghfast')).toBe(`https://ghfast.top/${raw}`);
  });

  it('generates valid mock release with multi-arch IPK assets', () => {
    const mock = getMockLatestRelease('1.0.6-1');
    expect(mock.tag_name).toBe('v1.0.7-1');
    expect(mock.assets.length).toBe(6);
    expect(mock.assets.some(a => a.arch === 'x86_64')).toBe(true);
    expect(mock.assets.some(a => a.arch === 'all')).toBe(true);
  });

  it('returns hasUpdate: false and does not invent fake versions when repository has no releases on GitHub', async () => {
    // When querying a repository that has no release, it must strictly return hasUpdate: false and keep currentVersion
    const result = await checkForAppUpdate('1.0.6-1', 'openclash-flow/luci-app-openclash-flow', 'direct', undefined, 'x86_64');
    expect(result.hasUpdate).toBe(false);
    expect(result.latestVersion).toBe('1.0.6-1');
  });

  it('correctly compares version against simulated higher and lower releases', () => {
    const mockHigher = getMockLatestRelease('1.0.6-1'); // v1.0.7-1
    expect(compareVersions('1.0.6-1', mockHigher.tag_name)).toBe(1); // newer

    // When current is already 1.0.7-1, comparing with 1.0.7-1 is 0
    expect(compareVersions('1.0.7-1', mockHigher.tag_name)).toBe(0);

    // When current is 1.0.8, comparing with 1.0.7-1 is -1
    expect(compareVersions('1.0.8', mockHigher.tag_name)).toBe(-1);
  });
});

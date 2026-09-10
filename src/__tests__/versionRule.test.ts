import { describe, it, expect } from 'vitest';
import { computeNextVersion } from '../../scripts/bump-version.js';
import versionInfo, { FULL_VERSION, APP_VERSION, APP_RELEASE, LAST_MODIFIED } from '../version';

describe('智能日期版本控制规则 (Date-Based Versioning Rule)', () => {
  it('同一天修改：递增小版本号 (例如 1.0.6-1 -> 1.0.6-2)', () => {
    const prev = {
      version: '1.0.6',
      release: '1',
      lastModified: '2026-09-09',
    };

    const next = computeNextVersion(prev, 'auto', '2026-09-09');
    expect(next.version).toBe('1.0.6');
    expect(next.release).toBe('2');
    expect(next.fullVersion).toBe('1.0.6-2');
    expect(next.lastModified).toBe('2026-09-09');
    expect(next.reason).toContain('同一天修改');
  });

  it('同一天内连续修改：持续递增小版本号 (1.0.6-2 -> 1.0.6-3)', () => {
    const prev = {
      version: '1.0.6',
      release: '2',
      lastModified: '2026-09-09',
    };

    const next = computeNextVersion(prev, 'auto', '2026-09-09');
    expect(next.version).toBe('1.0.6');
    expect(next.release).toBe('3');
    expect(next.fullVersion).toBe('1.0.6-3');
    expect(next.lastModified).toBe('2026-09-09');
  });

  it('跨天修改 (不是同一天)：递增大版本号并将小版本号重置为 1 (例如 1.0.6-2 -> 1.0.7-1)', () => {
    const prev = {
      version: '1.0.6',
      release: '2',
      lastModified: '2026-09-09',
    };

    // 假设第二天 2026-09-10 进行修改
    const next = computeNextVersion(prev, 'auto', '2026-09-10');
    expect(next.version).toBe('1.0.7');
    expect(next.release).toBe('1');
    expect(next.fullVersion).toBe('1.0.7-1');
    expect(next.lastModified).toBe('2026-09-10');
    expect(next.reason).toContain('跨天修改');
  });

  it('第二天再次修改：继续小版本递增 (1.0.7-1 -> 1.0.7-2)', () => {
    const prev = {
      version: '1.0.7',
      release: '1',
      lastModified: '2026-09-10',
    };

    const next = computeNextVersion(prev, 'auto', '2026-09-10');
    expect(next.version).toBe('1.0.7');
    expect(next.release).toBe('2');
    expect(next.fullVersion).toBe('1.0.7-2');
    expect(next.lastModified).toBe('2026-09-10');
  });

  it('第三天再次修改：再次递增大版本 (1.0.7-2 -> 1.0.8-1)', () => {
    const prev = {
      version: '1.0.7',
      release: '2',
      lastModified: '2026-09-10',
    };

    const next = computeNextVersion(prev, 'auto', '2026-09-11');
    expect(next.version).toBe('1.0.8');
    expect(next.release).toBe('1');
    expect(next.fullVersion).toBe('1.0.8-1');
    expect(next.lastModified).toBe('2026-09-11');
  });

  it('当前项目配置验证：版本与元数据格式规范且与单一真实来源保持一致', () => {
    expect(APP_VERSION).toBe(versionInfo.version);
    expect(APP_RELEASE).toBe(versionInfo.release);
    expect(FULL_VERSION).toBe(`${versionInfo.version}-${versionInfo.release}`);
    expect(LAST_MODIFIED).toBe(versionInfo.lastModified);

    // 格式规范校验 (Semver + Release)
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(APP_RELEASE).toMatch(/^\d+$/);
    expect(FULL_VERSION).toMatch(/^\d+\.\d+\.\d+-\d+$/);
    expect(LAST_MODIFIED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

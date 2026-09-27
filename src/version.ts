import versionInfo from '../version.json';

export const APP_NAME = versionInfo.name || 'luci-app-openclash-flow';
export const APP_VERSION = versionInfo.version || '1.0.8';
export const APP_RELEASE = versionInfo.release || '1';
export const LAST_MODIFIED = (versionInfo as any).lastModified || '2026-09-27';
export const FULL_VERSION = `${APP_VERSION}-${APP_RELEASE}`;

function compareSimpleVer(v1: string, v2: string): number {
  const p1 = v1.replace(/^[vV]/, '').split(/[-_.]/).map(Number);
  const p2 = v2.replace(/^[vV]/, '').split(/[-_.]/).map(Number);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}

export function getRuntimeVersion(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('openclash_flow_runtime_version');
    if (override) {
      if (compareSimpleVer(override, FULL_VERSION) >= 0) {
        return override;
      }
      localStorage.removeItem('openclash_flow_runtime_version');
    }
  }
  return FULL_VERSION;
}

export function setRuntimeVersion(ver: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openclash_flow_runtime_version', ver);
  }
}

export default versionInfo;


import versionInfo from '../version.json';

export const APP_NAME = versionInfo.name || 'luci-app-openclash-flow';
export const APP_VERSION = versionInfo.version || '1.0.6';
export const APP_RELEASE = versionInfo.release || '1';
export const FULL_VERSION = `${APP_VERSION}-${APP_RELEASE}`;

export function getRuntimeVersion(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('openclash_flow_runtime_version');
    if (override) return override;
  }
  return FULL_VERSION;
}

export function setRuntimeVersion(ver: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openclash_flow_runtime_version', ver);
  }
}

export default versionInfo;


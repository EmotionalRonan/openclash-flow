import versionInfo from '../version.json';

export const APP_NAME = versionInfo.name || 'luci-app-openclash-flow';
export const APP_VERSION = versionInfo.version || '1.0.1';
export const APP_RELEASE = versionInfo.release || '1';
export const FULL_VERSION = `${APP_VERSION}-${APP_RELEASE}`;

export default versionInfo;

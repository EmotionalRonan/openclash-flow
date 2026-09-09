export interface GitHubAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  content_type: string;
  created_at: string;
  arch?: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  html_url: string;
  assets: GitHubAsset[];
  tarball_url?: string;
  zipball_url?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  publishedAt: string;
  releaseUrl: string;
  release?: GitHubRelease;
  matchingAsset?: GitHubAsset;
  error?: string;
}

export type UpdatePhase = 
  | 'idle'
  | 'downloading'
  | 'verifying'
  | 'installing'
  | 'cleaning'
  | 'success'
  | 'error';

export interface UpdateProgress {
  phase: UpdatePhase;
  percentage: number;
  message: string;
  detail?: string;
  error?: string;
}

export type GitHubMirror = 'direct' | 'ghproxy' | 'ghfast' | 'custom';

#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const versionJsonPath = path.join(rootDir, 'version.json');

if (!fs.existsSync(versionJsonPath)) {
  console.error('❌ version.json not found at', versionJsonPath);
  process.exit(1);
}

const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf-8'));
let { version = '1.0.0', release = '1', name = 'luci-app-openclash-flow' } = versionData;

// Bump release or patch
// Arguments: node bump-version.js [patch | release | minor | major | <specific_version>]
const type = process.argv[2] || 'patch';

const semverMatch = version.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
if (!semverMatch) {
  console.error(`❌ Invalid semver in version.json: ${version}`);
  process.exit(1);
}

let major = parseInt(semverMatch[1], 10);
let minor = parseInt(semverMatch[2], 10);
let patch = parseInt(semverMatch[3], 10);
let relNum = parseInt(release, 10) || 1;

if (type === 'release' || type === 'rel') {
  relNum += 1;
} else if (type === 'minor') {
  minor += 1;
  patch = 0;
  relNum = 1;
} else if (type === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
  relNum = 1;
} else if (type === 'patch') {
  patch += 1;
  relNum = 1;
} else if (/^\d+\.\d+\.\d+/.test(type)) {
  version = type;
  relNum = 1;
} else {
  // Default to patch
  patch += 1;
  relNum = 1;
}

const newVersion = type.includes('.') ? type : `${major}.${minor}.${patch}`;
const newRelease = String(relNum);
const newFullVersion = `${newVersion}-${newRelease}`;

versionData.version = newVersion;
versionData.release = newRelease;

fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2) + '\n', 'utf-8');
console.log(`🚀 [Bump Version] Updated version.json -> ${name} v${newFullVersion}`);

// Automatically run sync-version.js
import('./sync-version.js');

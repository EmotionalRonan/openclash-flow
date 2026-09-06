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
const { version, release = '1', name = 'luci-app-openclash-flow' } = versionData;
const fullVersion = `${version}-${release}`;

console.log(`\n🔄 [Version Sync] Single Source of Truth: ${name} v${fullVersion}`);

// 1. Sync package.json
const packageJsonPath = path.join(rootDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  if (pkg.version !== version) {
    pkg.version = version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log(`  ✅ Synced package.json version -> ${version}`);
  } else {
    console.log(`  ✓ package.json version is already ${version}`);
  }
}

// 2. Sync package-openwrt/Makefile
const makefilePath = path.join(rootDir, 'package-openwrt', 'Makefile');
if (fs.existsSync(makefilePath)) {
  let content = fs.readFileSync(makefilePath, 'utf-8');
  const updatedContent = content
    .replace(/^PKG_VERSION:=.*/m, `PKG_VERSION:=${version}`)
    .replace(/^PKG_RELEASE:=.*/m, `PKG_RELEASE:=${release}`);
  if (content !== updatedContent) {
    fs.writeFileSync(makefilePath, updatedContent, 'utf-8');
    console.log(`  ✅ Synced package-openwrt/Makefile -> PKG_VERSION:=${version}, PKG_RELEASE:=${release}`);
  } else {
    console.log(`  ✓ package-openwrt/Makefile is already up to date`);
  }
}

// 3. Export to GitHub Actions GITHUB_OUTPUT if present
if (process.env.GITHUB_OUTPUT) {
  const outputVars = `version=${version}\nrelease=${release}\nfull_version=${fullVersion}\nname=${name}\n`;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, outputVars, 'utf-8');
  console.log(`  ✅ Exported version metadata to GITHUB_OUTPUT (full_version=${fullVersion})`);
}

console.log(`✨ Version synchronization completed: ${fullVersion}\n`);

#!/usr/bin/env node
/**
 * Scrape the Tether product repo for AppChangelog.current (with README /
 * MARKETING_VERSION fallbacks) and update this website when the version bumps.
 *
 * Version-only bumps still update the site — no new feature notes required.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PRODUCT_REPO = process.env.TETHER_REPO || 'Surajsm60720/Tether';
const PRODUCT_REF = process.env.TETHER_REF || 'master';
const TOKEN = process.env.TETHER_REPO_TOKEN || process.env.GITHUB_TOKEN || '';

const VERSION_FILE = path.join(ROOT, 'src/data/product-version.json');
const CHANGELOG_MDX = path.join(ROOT, 'src/content/docs/changelog.mdx');
const CHANGELOG_DIR = path.join(ROOT, 'src/content/changelog');

const CHANGELOG_SWIFT =
  'Packages/TetherCore/Sources/TetherCore/Changelog.swift';
const README_MD = 'README.md';
const PBXPROJ = 'Tether.xcodeproj/project.pbxproj';

const VERSION_RE = /\d+\.\d+(?:\.\d+)?/;

function fail(message) {
  console.error(`sync-product-version: ${message}`);
  process.exit(1);
}

function parseVersion(text) {
  const match = String(text).match(VERSION_RE);
  return match ? match[0] : null;
}

function compareVersions(a, b) {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10));
  const pb = b.split('.').map((n) => Number.parseInt(n, 10));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}

function versionSlug(version) {
  return version.replaceAll('.', '-');
}

async function fetchProductFile(filePath) {
  const apiUrl = `https://api.github.com/repos/${PRODUCT_REPO}/contents/${filePath}?ref=${encodeURIComponent(PRODUCT_REF)}`;
  const headers = {
    Accept: 'application/vnd.github.raw',
    'User-Agent': 'tether-website-sync-product-version',
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const res = await fetch(apiUrl, { headers });
  if (res.ok) return res.text();

  // Public raw fallback (works without API auth for public repos).
  const rawUrl = `https://raw.githubusercontent.com/${PRODUCT_REPO}/${PRODUCT_REF}/${filePath}`;
  const raw = await fetch(rawUrl, {
    headers: { 'User-Agent': 'tether-website-sync-product-version' },
  });
  if (!raw.ok) {
    fail(`could not fetch ${filePath} from ${PRODUCT_REPO}@${PRODUCT_REF} (API ${res.status}, raw ${raw.status})`);
  }
  return raw.text();
}

function versionFromChangelogSwift(source) {
  const current = source.match(/public\s+static\s+let\s+current\s*=\s*"([^"]+)"/);
  return current ? parseVersion(current[1]) : null;
}

function itemsForVersion(source, version) {
  const blockRe = new RegExp(
    String.raw`ReleaseNotes\(\s*version:\s*"${version.replaceAll('.', '\\.')}"\s*,\s*items:\s*\[([\s\S]*?)\]\s*\)`,
  );
  const block = source.match(blockRe);
  if (!block) return [];

  return [...block[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) =>
    m[1].replaceAll('\\"', '"').replaceAll('\\n', '\n'),
  );
}

function versionFromReadme(source) {
  const line = source.match(/^Version\s+(\d+\.\d+(?:\.\d+)?)\.?/m);
  return line ? line[1] : null;
}

function versionFromPbxproj(source) {
  const match = source.match(/MARKETING_VERSION\s*=\s*([^;]+);/);
  return match ? parseVersion(match[1].trim()) : null;
}

async function resolveProductVersion() {
  let changelogSource = '';
  try {
    changelogSource = await fetchProductFile(CHANGELOG_SWIFT);
  } catch {
    changelogSource = '';
  }

  let version = changelogSource ? versionFromChangelogSwift(changelogSource) : null;
  let items = version && changelogSource ? itemsForVersion(changelogSource, version) : [];

  if (!version) {
    const readme = await fetchProductFile(README_MD);
    version = versionFromReadme(readme);
  }

  if (!version) {
    const pbx = await fetchProductFile(PBXPROJ);
    version = versionFromPbxproj(pbx);
  }

  if (!version) fail('could not determine product version from Changelog.swift, README, or pbxproj');
  return { version, items, changelogSource };
}

function stubTitle(version, items) {
  if (items.length === 0) return `Version ${version}`;
  const first = items[0].replace(/\.$/, '');
  return first.length > 72 ? `${first.slice(0, 69)}…` : first;
}

function stubSummary(version, items) {
  if (items.length === 0) {
    return `Product version ${version}. Release notes will land here when the app ships What’s new copy.`;
  }
  return items[0];
}

async function ensureChangelogEntry(version, items) {
  await mkdir(CHANGELOG_DIR, { recursive: true });
  const file = path.join(CHANGELOG_DIR, `${versionSlug(version)}.md`);
  try {
    await readFile(file, 'utf8');
    return false;
  } catch {
    // create below
  }

  const title = stubTitle(version, items);
  const body = stubSummary(version, items);
  const bullets =
    items.length > 0
      ? items.map((item) => `- ${item}`).join('\n')
      : `- Version bump to ${version}.`;

  const content = `---
version: "${version}"
title: ${JSON.stringify(title)}
order: -1
---

${body}

${bullets}
`;
  await writeFile(file, content, 'utf8');
  return true;
}

async function updateChangelogMdx(version, items) {
  let source = await readFile(CHANGELOG_MDX, 'utf8');
  const next = source.replace(
    /(description:\s*Versioned What’s new, seeded from the app and README \(current )[^)]+(\)\.)/,
    `$1${version}$2`,
  );

  let updated = next;
  const heading = `## ${version}`;
  if (!updated.includes(heading)) {
    const introEnd = updated.indexOf('\n## ');
    if (introEnd === -1) fail('changelog.mdx is missing version headings');

    const note =
      items.length > 0
        ? items.map((item) => `- ${item}`).join('\n')
        : `- Version bump to ${version} (no additional What’s new notes in the app yet).`;

    const section = `\n${heading}\n\n${stubSummary(version, items)}\n\n${note}\n`;
    updated = updated.slice(0, introEnd) + section + updated.slice(introEnd);
  }

  if (updated !== source) {
    await writeFile(CHANGELOG_MDX, updated, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  const local = JSON.parse(await readFile(VERSION_FILE, 'utf8'));
  const localVersion = parseVersion(local.version);
  if (!localVersion) fail(`invalid local version in ${VERSION_FILE}`);

  const { version: remoteVersion, items } = await resolveProductVersion();
  console.log(`local=${localVersion} remote=${remoteVersion} repo=${PRODUCT_REPO}@${PRODUCT_REF}`);

  if (compareVersions(remoteVersion, localVersion) < 0) {
    fail(`remote version ${remoteVersion} is older than local ${localVersion}; refusing to downgrade`);
  }

  if (compareVersions(remoteVersion, localVersion) === 0) {
    console.log('No version bump.');
    return;
  }

  console.log(`Version bump detected: ${localVersion} → ${remoteVersion}`);

  const nextMeta = {
    version: remoteVersion,
    repo: PRODUCT_REPO,
    ref: PRODUCT_REF,
    syncedAt: new Date().toISOString(),
  };
  await writeFile(VERSION_FILE, `${JSON.stringify(nextMeta, null, 2)}\n`, 'utf8');

  const createdEntry = await ensureChangelogEntry(remoteVersion, items);
  const updatedMdx = await updateChangelogMdx(remoteVersion, items);

  console.log(
    [
      `updated ${path.relative(ROOT, VERSION_FILE)}`,
      createdEntry ? `created changelog entry for ${remoteVersion}` : null,
      updatedMdx ? `updated ${path.relative(ROOT, CHANGELOG_MDX)}` : null,
      items.length === 0 ? 'version-only bump (no app feature notes)' : `seeded ${items.length} note(s) from app`,
    ]
      .filter(Boolean)
      .join('; '),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

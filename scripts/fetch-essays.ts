/**
 * fetch-essays.ts
 *
 * Fetches essay markdown files from lossless-group/lossless-content/essays/
 * at build time via the GitHub API. Caches by commit SHA to avoid re-fetching
 * unchanged content.
 *
 * Usage:
 *   bun scripts/fetch-essays.ts
 *   bun scripts/fetch-essays.ts --verbose
 *   bun scripts/fetch-essays.ts --fresh    (ignore cache)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

// --- Configuration ---

const REPO_OWNER = 'lossless-group';
const REPO_NAME = 'lossless-content';
const REPO_BRANCH = 'master';
const ESSAYS_PATH = 'essays';

const SITE_ROOT = path.resolve(import.meta.dirname, '..');
const CACHE_DIR = path.join(SITE_ROOT, '.essays-cache');
const CACHE_PATH = path.join(CACHE_DIR, 'cache.json');
const OUTPUT_DIR = path.join(SITE_ROOT, 'src', 'content', 'essays');

const API_BASE = 'https://api.github.com';

// --- Types ---

interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

interface GitHubTreeResponse {
  sha: string;
  tree: GitHubTreeItem[];
}

interface GitHubRefResponse {
  object: { sha: string };
}

interface GitHubFileResponse {
  content: string;
  encoding: string;
}

interface EssaysCache {
  commit_sha: string;
  last_fetched: string;
}

// --- Frontmatter helpers ---

function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  if (!raw.startsWith('---')) return { data: {}, content: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, content: raw };
  const frontmatterStr = raw.slice(4, end);
  const content = raw.slice(end + 4).trimStart();
  try {
    const data = yaml.parse(frontmatterStr) || {};
    return { data, content };
  } catch {
    return { data: {}, content: raw };
  }
}

function serializeFrontmatter(data: Record<string, any>, content: string): string {
  // Convert Date objects to ISO strings so YAML doesn't output date objects
  const cleaned = JSON.parse(JSON.stringify(data, (_, v) =>
    v instanceof Date ? v.toISOString() : v
  ));
  const doc = new yaml.Document(cleaned);
  // Quote date-like strings so YAML parsers don't coerce them to Date objects
  yaml.visit(doc, {
    Scalar(_, node) {
      if (typeof node.value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(node.value)) {
        node.type = 'QUOTE_DOUBLE';
      }
    }
  });
  const frontmatterStr = doc.toString({ lineWidth: 0 }).trimEnd();
  return `---\n${frontmatterStr}\n---\n\n${content}`;
}

// --- GitHub API helpers ---

function makeHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LFM-EssaysFetcher/1.0',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function githubGet<T>(url: string, headers: Record<string, string>): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${res.statusText} — ${url}`);
  }
  return res.json() as Promise<T>;
}

// --- Cache helpers ---

async function loadCache(): Promise<EssaysCache> {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { commit_sha: '', last_fetched: '' };
  }
}

async function saveCache(cache: EssaysCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  cache.last_fetched = new Date().toISOString();
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// --- Main ---

async function main() {
  const verbose = process.argv.includes('--verbose');
  const fresh = process.argv.includes('--fresh');

  // Resolve token (optional for public repos)
  const token = process.env.GITHUB_CONTENT_PAT || undefined;
  if (!token) {
    console.log('  No GitHub token found — using unauthenticated requests (60/hr limit)');
  }
  const headers = makeHeaders(token);

  // Load cache
  const cache = fresh ? { commit_sha: '', last_fetched: '' } as EssaysCache : await loadCache();

  console.log(`\n📝 Essays (${REPO_OWNER}/${REPO_NAME}/${ESSAYS_PATH})`);

  // Get current commit SHA
  let commitSha: string;
  try {
    const refData = await githubGet<GitHubRefResponse>(
      `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/git/ref/heads/${REPO_BRANCH}`,
      headers
    );
    commitSha = refData.object.sha;
  } catch (err) {
    console.error(`  ✗ Failed to get ref: ${err}`);
    process.exit(1);
  }

  // Check cache — skip if unchanged
  if (cache.commit_sha === commitSha) {
    console.log(`  ↳ No changes (commit ${commitSha.slice(0, 7)})`);
    console.log(`\n✓ Done. 0 files fetched, cached.\n`);
    return;
  }

  // Get file tree
  let tree: GitHubTreeResponse;
  try {
    tree = await githubGet<GitHubTreeResponse>(
      `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${commitSha}?recursive=1`,
      headers
    );
  } catch (err) {
    console.error(`  ✗ Failed to get tree: ${err}`);
    process.exit(1);
  }

  // Filter to essay markdown files
  const essayFiles = tree.tree.filter(item =>
    item.type === 'blob' &&
    item.path.startsWith(ESSAYS_PATH + '/') &&
    item.path.endsWith('.md')
  );

  if (essayFiles.length === 0) {
    console.log(`  ↳ No .md files found under ${ESSAYS_PATH}/`);
    await saveCache({ ...cache, commit_sha: commitSha });
    return;
  }

  console.log(`  Found ${essayFiles.length} essays`);

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Fetch each file
  let fetched = 0;
  for (const file of essayFiles) {
    const filename = path.basename(file.path);

    let fileData: GitHubFileResponse;
    try {
      fileData = await githubGet<GitHubFileResponse>(
        `${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file.path}?ref=${REPO_BRANCH}`,
        headers
      );
    } catch (err) {
      console.error(`    ✗ Failed to fetch ${filename}: ${err}`);
      continue;
    }

    // Decode base64 content
    const rawContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // Parse frontmatter, re-serialize with clean dates
    const { data, content } = parseFrontmatter(rawContent);

    // Write to output directory
    const outputPath = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(outputPath, serializeFrontmatter(data, content));

    fetched++;
    if (verbose) console.log(`    ✓ ${filename}`);
  }

  console.log(`  ✓ Fetched ${fetched} essays (commit ${commitSha.slice(0, 7)})`);

  // Save cache
  await saveCache({ ...cache, commit_sha: commitSha });

  console.log(`\n✓ Done. ${fetched} files fetched.\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

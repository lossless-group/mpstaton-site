import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import type {
  FetcherConfig,
  FetcherCache,
  SourceRepo,
  GitHubRefResponse,
  GitHubTreeResponse,
  GitHubFileResponse,
  ContextVProvenance,
} from '../src/types/context-v.js';

const SITE_ROOT = path.resolve(import.meta.dirname, '..');
const CONFIG_PATH = path.join(SITE_ROOT, 'context-v-sources.yaml');
const CACHE_DIR = path.join(SITE_ROOT, '.context-v-cache');
const CACHE_PATH = path.join(CACHE_DIR, 'cache.json');
const OUTPUT_DIR = path.join(SITE_ROOT, 'src', 'content', 'context-v');

const API_BASE = 'https://api.github.com';

// --- Frontmatter helpers (no gray-matter dependency) ---

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
  // Force all Date objects to ISO strings so YAML doesn't output date objects
  // that Astro's Zod schema rejects as "object" instead of "string"
  const cleaned = JSON.parse(JSON.stringify(data, (_, v) =>
    v instanceof Date ? v.toISOString() : v
  ));
  const doc = new yaml.Document(cleaned);
  // Force ISO date-like strings to be quoted so YAML parsers don't coerce them to Date objects
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
    'User-Agent': 'LFM-ContextV-Fetcher/1.0',
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

async function loadCache(): Promise<FetcherCache> {
  try {
    const raw = await fs.readFile(CACHE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { tree_shas: {}, last_fetched: '' };
  }
}

async function saveCache(cache: FetcherCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  cache.last_fetched = new Date().toISOString();
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// --- Main ---

async function main() {
  const verbose = process.argv.includes('--verbose');
  const fresh = process.argv.includes('--fresh');

  // 1. Read config
  const configRaw = await fs.readFile(CONFIG_PATH, 'utf-8');
  const config: FetcherConfig = yaml.parse(configRaw);

  // 2. Resolve token. Optional for public repos in the sense that the requests
  // succeed — but anonymous callers get 60/hr against api.github.com, and one
  // cold run of this script costs a ref, a tree, and one Contents call per
  // file: ~65 for astro-knots alone. So "optional" means "works locally and
  // truncates the corpus in CI", which is exactly what happened — a deploy
  // fetched 58 files and lost the last 7 to a 403 without failing the build.
  //
  // The name is a fallback chain rather than one key because this credential
  // has different names in different places: .env carries both
  // GITHUB_PERSONAL_ACCESS_TOKEN and GITHUB_CONTENT_PAT, while the Vercel
  // project only has the latter. One hardcoded name authenticates on a laptop
  // and silently downgrades in the build.
  const TOKEN_ENV_NAMES = [
    config.auth.token_env,
    'GITHUB_CONTENT_PAT',
    'GITHUB_TOKEN',
    'GH_TOKEN',
  ].filter(Boolean);

  let token: string | undefined;
  let tokenFrom: string | undefined;
  for (const name of TOKEN_ENV_NAMES) {
    if (process.env[name]) {
      token = process.env[name];
      tokenFrom = name;
      break;
    }
  }

  if (token) {
    console.log(`  Authenticated via ${tokenFrom} (5,000/hr limit)`);
  } else {
    console.warn(
      `  ⚠️  No GitHub token in any of ${TOKEN_ENV_NAMES.join(', ')} — ` +
      'using unauthenticated requests (60/hr). Expect truncation.'
    );
  }
  const headers = makeHeaders(token);

  // 3. Load cache
  const cache = fresh ? { tree_shas: {}, last_fetched: '' } as FetcherCache : await loadCache();

  // 4. Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let totalFetched = 0;
  let totalCached = 0;

  // 5. Process each source repo
  for (const source of config.sources) {
    const [owner, repo] = source.repo.split('/');
    const branch = source.branch || config.defaults.branch;
    const contextPath = source.path || 'context-v';
    const categories = source.categories || config.defaults.categories;
    const repoSlug = repo;

    console.log(`\n📦 ${source.label} (${source.repo})`);

    // 5a. Get current commit SHA
    let commitSha: string;
    try {
      const refData = await githubGet<GitHubRefResponse>(
        `${API_BASE}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
        headers
      );
      commitSha = refData.object.sha;
    } catch (err) {
      console.error(`  ✗ Failed to get ref for ${source.repo}: ${err}`);
      continue;
    }

    // 5b. Check cache — skip if unchanged
    if (cache.tree_shas[source.repo] === commitSha) {
      console.log(`  ↳ No changes (commit ${commitSha.slice(0, 7)})`);
      totalCached++;
      continue;
    }

    // 5c. Get file tree
    let tree: GitHubTreeResponse;
    try {
      tree = await githubGet<GitHubTreeResponse>(
        `${API_BASE}/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
        headers
      );
    } catch (err) {
      console.error(`  ✗ Failed to get tree for ${source.repo}: ${err}`);
      continue;
    }

    // 5d. Filter to context-v markdown files
    const contextFiles = tree.tree.filter(item =>
      item.type === 'blob' &&
      item.path.startsWith(contextPath + '/') &&
      item.path.endsWith('.md')
    );

    if (contextFiles.length === 0) {
      console.log(`  ↳ No .md files found under ${contextPath}/`);
      cache.tree_shas[source.repo] = commitSha;
      continue;
    }

    if (verbose) console.log(`  Found ${contextFiles.length} markdown files`);

    // 5e. Fetch each file
    let repoFetched = 0;
    for (const file of contextFiles) {
      const relativePath = file.path.replace(contextPath + '/', '');

      // Determine category from directory
      const firstDir = relativePath.split('/')[0];
      const isInCategory = categories.includes(firstDir);

      // Skip root-level files unless configured to include them
      if (!isInCategory) {
        if (!config.defaults.include_root_files) {
          if (verbose) console.log(`    Skip (root): ${relativePath}`);
          continue;
        }
      }

      // Fetch file content
      let fileData: GitHubFileResponse;
      try {
        fileData = await githubGet<GitHubFileResponse>(
          `${API_BASE}/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`,
          headers
        );
      } catch (err) {
        console.error(`    ✗ Failed to fetch ${file.path}: ${err}`);
        continue;
      }

      // Decode base64 content
      const rawContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

      // Parse frontmatter, inject provenance
      const { data, content } = parseFrontmatter(rawContent);

      // Infer category from directory if not set in frontmatter
      if (!data.category && isInCategory) {
        const DIR_TO_CATEGORY: Record<string, string> = {
          specs: 'Specifications',
          blueprints: 'Blueprints',
          prompts: 'Prompts',
          reminders: 'Reminders',
          sitemap: 'Sitemap',
        };
        data.category = DIR_TO_CATEGORY[firstDir] || firstDir;
      }

      const provenance: ContextVProvenance = {
        repo: source.repo,
        repo_label: source.label,
        branch,
        commit_sha: commitSha,
        file_path: file.path,
        fetched_at: new Date().toISOString(),
        github_url: `https://github.com/${source.repo}/blob/${branch}/${file.path}`,
      };

      data._context_v = provenance;

      // Write to output directory
      const outputPath = path.join(OUTPUT_DIR, repoSlug, relativePath);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, serializeFrontmatter(data, content));

      repoFetched++;
      if (verbose) console.log(`    ✓ ${relativePath}`);
    }

    console.log(`  ✓ Fetched ${repoFetched} files (commit ${commitSha.slice(0, 7)})`);
    totalFetched += repoFetched;

    // 5f. Update cache
    cache.tree_shas[source.repo] = commitSha;
  }

  // 6. Save cache
  await saveCache(cache);

  console.log(`\n✓ Done. ${totalFetched} files fetched, ${totalCached} repos cached.\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

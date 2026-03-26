/** GitHub Git Tree API response item */
export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

/** GitHub Git Tree API response */
export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

/** GitHub Contents API response (single file) */
export interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file';
  content: string;
  encoding: 'base64';
}

/** GitHub Ref API response */
export interface GitHubRefResponse {
  ref: string;
  node_id: string;
  url: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
}

export interface SourceRepo {
  repo: string;
  label: string;
  description?: string;
  branch?: string;
  path?: string;
  categories?: string[];
}

export interface FetcherConfig {
  auth: {
    token_env: string;
  };
  defaults: {
    branch: string;
    categories: string[];
    include_root_files: boolean;
  };
  sources: SourceRepo[];
}

export interface ContextVProvenance {
  repo: string;
  repo_label: string;
  branch: string;
  commit_sha: string;
  file_path: string;
  fetched_at: string;
  github_url: string;
}

export interface FetcherCache {
  tree_shas: Record<string, string>;
  last_fetched: string;
}

export const CATEGORIES = ['specs', 'blueprints', 'prompts', 'reminders'] as const;
export type Category = typeof CATEGORIES[number];

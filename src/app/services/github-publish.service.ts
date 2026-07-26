import { Injectable, computed, signal } from '@angular/core';
import {
  ADMIN_GITHUB_OWNER,
  ADMIN_GITHUB_REPO,
  ADMIN_GITHUB_TOKEN,
} from '../admin/admin.publish';

export interface GitHubRepoTarget {
  owner: string;
  repo: string;
  branch: string;
}

@Injectable({ providedIn: 'root' })
export class GithubPublishService {
  /** Token from GitHub secret / .env (build-time). Never paste in the browser. */
  private readonly builtInToken = ADMIN_GITHUB_TOKEN.trim();

  readonly target: GitHubRepoTarget = {
    owner: ADMIN_GITHUB_OWNER || 'Emmanuel-Ratemo',
    repo: ADMIN_GITHUB_REPO || 'bakery',
    branch: 'main',
  };

  readonly hasToken = computed(() => !!this.builtInToken);
  private readonly tokenSignal = signal<string | null>(
    this.builtInToken || null
  );

  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Create or update a file in the GitHub repo (triggers Pages rebuild on main).
   */
  async putFile(path: string, contentBase64: string, message: string): Promise<void> {
    const token = this.requireToken();
    const { owner, repo, branch } = this.target;
    const apiPath = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    let sha: string | undefined;
    const existing = await fetch(`${apiPath}?ref=${branch}`, {
      headers: this.headers(token),
    });
    if (existing.ok) {
      const body = (await existing.json()) as { sha?: string };
      sha = body.sha;
    } else if (existing.status !== 404) {
      throw new Error(await this.readError(existing));
    }

    const response = await fetch(apiPath, {
      method: 'PUT',
      headers: {
        ...this.headers(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(await this.readError(response));
    }
  }

  async putJson(path: string, data: unknown, message: string): Promise<void> {
    const json = `${JSON.stringify(data, null, 2)}\n`;
    const contentBase64 = btoa(unescape(encodeURIComponent(json)));
    await this.putFile(path, contentBase64, message);
  }

  async readJson<T>(path: string): Promise<T | null> {
    const token = this.requireToken();
    const { owner, repo, branch } = this.target;
    const apiPath = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(apiPath, { headers: this.headers(token) });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(await this.readError(response));
    const body = (await response.json()) as { content?: string; encoding?: string };
    if (!body.content) return null;
    const decoded = decodeURIComponent(
      escape(atob(body.content.replace(/\n/g, '')))
    );
    return JSON.parse(decoded) as T;
  }

  private requireToken(): string {
    const token = this.tokenSignal();
    if (!token) {
      throw new Error(
        'ADMIN_GITHUB_TOKEN is not configured. Add it as a GitHub Environment secret (github-pages) or in local .env, then redeploy / restart.'
      );
    }
    return token;
  }

  private headers(token: string): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private async readError(response: Response): Promise<string> {
    try {
      const body = (await response.json()) as { message?: string };
      return body.message || `GitHub error (${response.status})`;
    } catch {
      return `GitHub error (${response.status})`;
    }
  }
}

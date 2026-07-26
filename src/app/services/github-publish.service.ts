import { Injectable, signal } from '@angular/core';
import { ADMIN_GITHUB_TOKEN_KEY } from '../admin/admin.config';

export interface GitHubRepoTarget {
  owner: string;
  repo: string;
  branch: string;
}

@Injectable({ providedIn: 'root' })
export class GithubPublishService {
  private readonly token = signal<string | null>(this.readToken());
  readonly hasToken = signal(!!this.token());

  readonly target: GitHubRepoTarget = {
    owner: 'Emmanuel-Ratemo',
    repo: 'bakery',
    branch: 'main',
  };

  setToken(token: string): void {
    const value = token.trim();
    this.token.set(value || null);
    this.hasToken.set(!!value);
    try {
      if (value) sessionStorage.setItem(ADMIN_GITHUB_TOKEN_KEY, value);
      else sessionStorage.removeItem(ADMIN_GITHUB_TOKEN_KEY);
    } catch {
      // ignore
    }
  }

  clearToken(): void {
    this.setToken('');
  }

  getToken(): string | null {
    return this.token();
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
    const token = this.token();
    if (!token) {
      throw new Error(
        'Add a GitHub token in Admin to save changes to the live site.'
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

  private readToken(): string | null {
    try {
      return sessionStorage.getItem(ADMIN_GITHUB_TOKEN_KEY);
    } catch {
      return null;
    }
  }
}

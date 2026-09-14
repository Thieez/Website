export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'https://api.thieez.com';

export type ApiAsset = {
  name: string;
  browser_download_url?: string;
  download_url?: string;
  digest?: string;
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  href: string;
  status: string;
  meta: string;
};

export type ProjectResult = {
  projects: Project[];
  source: 'api' | 'fallback';
};

export type LatestBuild = {
  tag_name?: string;
  published_at?: string;
  assets: ApiAsset[];
};

type Release = {
  tag_name?: string;
  published_at?: string;
  assets?: ApiAsset[];
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    const error = new Error(`API responded with ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}

const fallbackProjects: Project[] = [
    {
      slug: 'lisnnto',
      name: 'Lisnnto',
      description: 'A quieter way to keep up with the things worth hearing.',
      href: 'https://lisnnto.thieez.com',
      status: 'In testing',
      meta: 'Android · latest build'
    }
  ];

export async function getProjects(): Promise<ProjectResult> {
  try {
    const payload = await fetchJson<Project[] | { projects?: Project[] }>('/projects/v0');
    const projects = Array.isArray(payload) ? payload : payload.projects ?? [];
    return { projects, source: 'api' };
  } catch (cause) {
    const status = cause instanceof Error ? (cause as Error & { status?: number }).status : undefined;
    if (status !== 404 && status !== 405) throw cause;
    return { projects: fallbackProjects, source: 'fallback' };
  }
}

function resolveAssetUrl(value?: string): string | undefined {
  if (!value) return undefined;
  return new URL(value, `${API_BASE}/`).toString();
}

export async function getLatestBuild(): Promise<LatestBuild> {
  try {
    const latest = await fetchJson<LatestBuild>('/updates/v0/latest');
    return { ...latest, assets: latest.assets ?? [] };
  } catch {
    const releases = await fetchJson<Release[]>('/lisnnto/v0/builds');
    const latest = releases[0] ?? {};
    return { ...latest, assets: latest.assets ?? [] };
  }
}

export function getApkAsset(build: LatestBuild): ApiAsset | undefined {
  const asset = build.assets.find((candidate) => candidate.name.toLowerCase().endsWith('.apk'));
  if (!asset) return undefined;
  return {
    ...asset,
    browser_download_url: resolveAssetUrl(asset.browser_download_url),
    download_url: resolveAssetUrl(asset.download_url)
  };
}

export function formatReleaseDate(value?: string): string {
  if (!value) return 'Date not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

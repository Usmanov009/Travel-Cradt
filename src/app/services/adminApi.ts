export async function adminFetch(path: string, token?: string, opts: RequestInit = {}) {
  const base = `/api/admin`;
  const headers = new Headers(opts.headers || {} as any);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(base + path, { ...opts, headers });
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('admin-unauthorized'));
    throw new Error('Unauthorized');
  }
  return res;
}

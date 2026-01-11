import { getToken, clearToken } from '../auth/tokenStore';

const API_URL = import.meta.env.VITE_API_URL as string;

export class HttpError extends Error {
  status: number;
  body?: any;
  constructor(status: number, message: string, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const buildHeaders = (extra?: HeadersInit): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(extra || {}),
  };
  const token = getToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  if (res.ok) {
    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }
  if (res.status === 401) {
    clearToken();
    // Redirect to login on unauthorized
    window.location.href = '/login';
    throw new HttpError(401, 'Unauthorized');
  }
  let body: any;
  const txt = await res.text();
  try { body = JSON.parse(txt); } catch { body = txt; }
  throw new HttpError(res.status, 'Request failed', body);
};

const request = async (path: string, init?: RequestInit) => {
  const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init?.headers),
  });
  return handleResponse(res);
};

export const get = (path: string) => request(path);
export const post = (path: string, body?: any) => request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const put = (path: string, body?: any) => request(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
export const del = (path: string) => request(path, { method: 'DELETE' });

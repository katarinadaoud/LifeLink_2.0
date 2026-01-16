// Centralized API base URL handling for Vite apps
// Uses VITE_API_URL when provided; falls back to relative paths in dev/proxy.

const raw = (import.meta as any).env?.VITE_API_URL as string | undefined;

// Normalize: remove trailing slashes; default to empty string for relative URLs
export const API_BASE_URL: string = raw ? raw.replace(/\/+$/, '') : '';

export const buildApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

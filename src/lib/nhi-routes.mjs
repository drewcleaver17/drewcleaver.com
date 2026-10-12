// Public route migration only. Existing storage keys, IDs and asset paths stay stable.
export function canonicalNhiURL(value, origin) {
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return null;
    if (url.pathname === '/ufos' || url.pathname.startsWith('/ufos/')) {
      url.pathname = '/nhi' + url.pathname.slice(5);
    }
    if (url.pathname === '/nhi') url.pathname = '/nhi/';
    return url.pathname.startsWith('/nhi/') ? url : null;
  } catch { return null; }
}

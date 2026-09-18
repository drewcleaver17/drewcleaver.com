import { publicPages } from '../config/integrations';
import { profile } from '../data/profile';
export function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPages.map(path => `<url><loc>${new URL(path, profile.website).href}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

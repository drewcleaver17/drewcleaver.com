import { publicPages } from '../config/integrations';
import data from '../data/ufos/timeline.json';
import { personURL } from '../lib/ufo-people.mjs';
import { profile } from '../data/profile';
export function GET() {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...publicPages, '/buildmine/', '/buildmine/publish/', '/nhi/', '/nhi/people/', '/nhi/data/', ...data.entities.filter(n => n.type === 'person').map(n => personURL(n.id))].map(path => `<url><loc>${new URL(path, profile.website).href}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}

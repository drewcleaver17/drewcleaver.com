import type { APIRoute } from 'astro';
import { profile } from '../data/profile';
const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
export const GET: APIRoute = () => new Response([
  'BEGIN:VCARD', 'VERSION:3.0',
  `N:${escape(profile.familyName)};${escape(profile.givenName)};;;`,
  `FN:${escape(profile.name)}`,
  `EMAIL;TYPE=INTERNET:${profile.email}`,
  `URL:${profile.website}`,
  'END:VCARD', '',
].join('\r\n'), { headers: { 'Content-Type': 'text/vcard; charset=utf-8' } });

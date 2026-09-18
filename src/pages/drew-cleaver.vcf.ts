import type { APIRoute } from 'astro';
import { contactLinks, profile } from '../data/profile';
const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
export const GET: APIRoute = () => new Response([
  'BEGIN:VCARD', 'VERSION:4.0',
  `N:${escape(profile.familyName)};${escape(profile.givenName)};;;`,
  `FN:${escape(profile.name)}`,
  `EMAIL;PREF=1:${profile.email}`,
  `BDAY:${profile.birthdayMonthDay}`,
  `ADR;LABEL="${profile.contactLocation}":;;;${escape(profile.address.city)};${escape(profile.address.region)};;${escape(profile.address.country)}`,
  ...contactLinks.flatMap(({ label, url }, index) => [
    `item${index + 1}.URL${index === 0 ? ';PREF=1' : ''}:${url}`,
    // Standard URL properties work without these optional Apple-style labels.
    `item${index + 1}.X-ABLabel:${escape(label)}`,
  ]),
  'END:VCARD', '',
].join('\r\n'), { headers: { 'Content-Type': 'text/vcard; charset=utf-8' } });

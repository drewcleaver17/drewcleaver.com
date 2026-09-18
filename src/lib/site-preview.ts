// Only reviewed public content belongs in this schema. No private brief fields.
export type Theme = 'editorial' | 'studio' | 'technical';
export interface SiteDraft { version: 1; name: string; headline: string; bio: string; experience: string; highlights: string; email: string; booking: string; theme: Theme; }
export const themes: Theme[] = ['editorial', 'studio', 'technical'];
export const draftFields = ['name', 'headline', 'bio', 'experience', 'highlights', 'email', 'booking'] as const;
export const escapeHTML = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
export function safeBooking(value: string): string {
  try { const url = new URL(value.trim()); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export function safeEmail(value: string): string {
  return /^[^\s@<>"'?:#%]+@[^\s@<>"'?:#%]+\.[^\s@<>"'?:#%]+$/.test(value.trim()) ? value.trim() : '';
}
export function validateDraft(value: unknown): SiteDraft {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('This preview link is incomplete.');
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || !themes.includes(record.theme as Theme) || draftFields.some(key => typeof record[key] !== 'string')) throw new Error('This preview link is not supported.');
  const draft = Object.fromEntries(draftFields.map(key => [key, record[key]])) as unknown as SiteDraft;
  return { ...draft, email: safeEmail(draft.email), booking: safeBooking(draft.booking), version: 1, theme: record.theme as Theme };
}
const heading = /^(?:(?:professional|career|work|relevant)\s+)?(?:summary|profile|objective|experience|employment|history)\s*:?$|^(?:education|skills|certifications|projects|interests|references|achievements|qualifications|core\s+competencies)\s*:?$/i;
export function extractResume(text: string, name: string) {
  // Conservative section matching, not an AI writer. Preserve source wording.
  // Common contact lines are omitted, but a visitor must still review the draft.
  const lines = text.split(/\r?\n/).map(line => line.trim());
  const contact = /\S+@\S+|https?:\/\/|www\.|linkedin\.com|\+?\d[\d ().-]{7,}\d|\b\d+\s+.+\b(?:street|st\.?|avenue|ave\.?|road|rd\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?)\b/i;
  const usable = (line: string) => line && line.toLowerCase() !== name.trim().toLowerCase() && !contact.test(line);
  const section = (start: RegExp) => {
    const index = lines.findIndex(line => start.test(line));
    if (index === -1) return '';
    const rest: string[] = [];
    for (let i = index + 1; i < lines.length; i++) { if (heading.test(lines[i])) break; if (usable(lines[i])) rest.push(lines[i]); }
    return rest.join('\n');
  };
  // Only consider a heading immediately near the name, not a random job bullet.
  const nameIndex = lines.findIndex(line => line.toLowerCase() === name.trim().toLowerCase());
  const candidate = nameIndex >= 0 ? lines.slice(nameIndex + 1, nameIndex + 3).find(line => usable(line) && !heading.test(line) && line.length < 100) || '' : '';
  return { headline: candidate, bio: section(/^(?:(?:professional|career)\s+)?(?:summary|profile|objective)\s*:?$/i), experience: section(/^(?:(?:professional|work|career|relevant)\s+)?(?:experience|employment(?:\s+history)?|work\s+history)\s*:?$/i) };
}
export function chooseTheme(direction: string, useDrew: boolean): Theme {
  if (useDrew) return 'editorial';
  if (/technical|mono|terminal|code|developer|dark/i.test(direction)) return 'technical';
  if (/bold|playful|bright|colorful|colourful|studio|creative/i.test(direction)) return 'studio';
  return 'editorial';
}
export function renderSite(input: SiteDraft, embedded = false): string {
  const site = validateDraft(input), e = escapeHTML;
  const anchor = embedded ? 'about:srcdoc' : '';
  const section = (id: string, title: string, content: string) => content.trim() ? `<section id="${id}"><p class="label">${title}</p><div class="copy">${e(content)}</div></section>` : '';
  const contacts = `${site.email ? `<a class="button" href="mailto:${e(site.email)}">Say hello</a>` : ''}${site.booking ? `<a class="button outline" href="${e(site.booking)}" target="_blank" rel="noopener noreferrer">Schedule a conversation</a>` : ''}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>${e(site.name)}${site.headline ? ` — ${e(site.headline)}` : ''}</title><meta name="description" content="${e(site.headline)}"><style>
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:1rem}body{margin:0;background:#f7f5ee;color:#173e35;font:16px/1.7 system-ui,-apple-system,sans-serif;overflow-wrap:anywhere}a{color:inherit;text-underline-offset:.25em}a:focus-visible{outline:3px solid #bb7d20;outline-offset:5px}.wrap{width:min(1080px,calc(100% - 40px));margin:auto}header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem 2rem;border-bottom:1px solid currentColor;padding:1.25rem 0}header .name{font-family:Georgia,serif;font-size:1.25rem}nav{display:flex;gap:1.25rem;flex-wrap:wrap}nav a{padding:.65rem 0;font-size:.9rem}.hero{padding:4rem 0 3rem}.label{font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600}h1{font:400 clamp(3rem,8vw,6.4rem)/1.06 Georgia,serif;letter-spacing:-.04em;margin:1.1rem 0 1.5rem}.headline{font-size:clamp(1.15rem,3vw,1.6rem);max-width:40rem}.actions{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1.8rem}.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.7rem 1.15rem;border:1px solid #173e35;background:#173e35;color:#f7f5ee;text-decoration:none;border-radius:3px}.button.outline{background:transparent;color:inherit}.sections{display:grid;gap:2rem}section{border-top:1px solid currentColor;padding-top:1.5rem;min-width:0}.copy{white-space:pre-wrap;max-width:70ch}.hello{margin-top:3rem;padding:2rem 0 3rem}h2{font:400 clamp(2rem,5vw,3.5rem)/1.15 Georgia,serif;margin:.8rem 0}footer{padding:1.5rem 0;border-top:1px solid currentColor;font-size:.85rem}.studio{background:#1433b5;color:#fff}.studio h1{font-family:system-ui,sans-serif;font-weight:800;font-size:clamp(3.6rem,10vw,8rem);letter-spacing:-.065em}.studio header .name,.studio h2{font-family:system-ui,sans-serif;font-weight:700}.studio .hero{border-bottom:10px solid #e6ff70;margin-bottom:2rem}.studio .label{color:#e6ff70}.studio .button{background:#e6ff70;color:#0c2469;border-color:#e6ff70;border-radius:99px}.studio .button.outline{color:#fff;background:transparent}.technical{background:#131820;color:#e9edf5}.technical .label,.technical nav,.technical header .name{font-family:ui-monospace,monospace;color:#8bddcb}.technical h1,.technical h2{font-family:system-ui,sans-serif;font-weight:650;letter-spacing:-.045em}.technical .button{background:#8bddcb;color:#131820;border-color:#8bddcb;border-radius:0}.technical .button.outline{background:transparent;color:#e9edf5}.technical section{border:1px solid #657384;padding:1.3rem}.technical .hero{padding-block:3.5rem}.technical .sections{gap:1rem}@media(min-width:760px){.studio .sections{grid-template-columns:1fr 1.4fr}.studio #highlights{grid-column:1/-1}.technical .hero{display:grid;grid-template-columns:1.2fr 1fr;column-gap:3rem}.technical .hero .label{grid-column:1/-1}.technical .hero h1{grid-row:2/4}.technical .hero .actions{align-content:start}.editorial section{display:grid;grid-template-columns:180px minmax(0,1fr);gap:2rem}.editorial section>.label{margin:0}}@media(max-width:380px){.wrap{width:calc(100% - 32px)}.actions{display:grid}.button{width:100%}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body class="${site.theme}"><div class="wrap"><header><a class="name" href="${anchor}#home">${e(site.name)}</a><nav aria-label="Site navigation">${site.bio ? `<a href="${anchor}#about">About</a>` : ''}${site.experience ? `<a href="${anchor}#experience">Experience</a>` : ''}${contacts ? `<a href="${anchor}#hello">Hello</a>` : ''}</nav></header><main id="home"><div class="hero"><p class="label">${site.theme === 'studio' ? 'An introduction' : site.theme === 'technical' ? 'Profile / 01' : 'Hello, I’m'}</p><h1>${e(site.name)}</h1>${site.headline ? `<p class="headline">${e(site.headline)}</p>` : ''}${contacts ? `<div class="actions">${contacts}</div>` : ''}</div><div class="sections">${section('about', 'About', site.bio)}${section('experience', 'Experience', site.experience)}${section('highlights', 'Selected work', site.highlights)}</div>${contacts ? `<section class="hello" id="hello"><div><p class="label">Let’s connect</p><h2>A conversation starts here.</h2></div><div class="actions">${contacts}</div></section>` : ''}</main><footer>${e(site.name)}</footer></div></body></html>`;
}
export function encodeDraft(site: SiteDraft): string {
  const bytes = new TextEncoder().encode(JSON.stringify(validateDraft(site)));
  // Cap links, never input or downloads. No silent content truncation.
  if (bytes.length > 9000) throw new Error('This site is too long for a reliable share link. Download the complete website instead, or shorten its public text. Your brief and edits are unchanged.');
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeDraft(fragment: string): SiteDraft {
  if (!fragment || fragment.length > 12000 || !/^[\w-]+$/.test(fragment)) throw new Error('This preview link is incomplete or too long. Ask its creator for a new link.');
  const binary = atob(fragment.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return validateDraft(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
}

// Buildmine starter 1.0.0 — MIT. Pure, dependency-free rendering shared by browser and CLI.
export const VERSION = '1.0.0';
export const LICENSE = "MIT License\n\nCopyright (c) 2026 Drew Cleaver\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n";
export const SOURCE = 'https://github.com/drewcleaver17/drewcleaver.com/tree/main/starter';
export const fields = ['name', 'headline', 'bio', 'experience', 'highlights', 'email', 'booking'];
export const themes = ['editorial', 'studio', 'technical'];
export const questionIds = ['purpose', 'audience', 'story', 'proof', 'aesthetic', 'connection', 'boundaries'];
const object = value => value && typeof value === 'object' && !Array.isArray(value);
export const escapeHTML = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeURL(value) {
  try { const u = new URL(value.trim()); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password && !/[\u0000-\u001f\u007f]/.test(value) ? u.href : ''; } catch { return ''; }
}
export const safeEmail = value => /^[^\s@<>"'?:#%]+@[^\s@<>"'?:#%]+\.[^\s@<>"'?:#%]+$/.test(value.trim()) ? value.trim() : '';
export function normalizeSite(input) {
  if (!object(input) || input.version !== 2 || !themes.includes(input.theme) || typeof input.credit !== 'boolean' || fields.some(key => typeof input[key] !== 'string')) throw new Error('Unsupported site data. Use a Buildmine v2 site.json file.');
  // Explicit projection: private answers and unknown keys never enter exported files.
  return {version:2, ...Object.fromEntries(fields.map(key => [key,input[key]])), theme:input.theme, credit:input.credit};
}
export function validatePublic(input) {
  const site = normalizeSite(input);
  if (!site.name.trim()) throw new Error('Add your public name before exporting.');
  if (site.email && !safeEmail(site.email)) throw new Error('Use a valid public email address, or leave it blank.');
  if (site.booking && !safeURL(site.booking)) throw new Error('Use an http or https scheduling URL without embedded sign-in credentials, or leave it blank.');
  return site;
}
export function normalizeProject(input) {
  if (!object(input) || input.format !== 'buildmine-private-project' || input.version !== 1 || !object(input.brief) || typeof input.brief.name !== 'string' || typeof input.brief.resume !== 'string' || typeof input.brief.drewStyle !== 'boolean' || !object(input.brief.answers) || questionIds.some(key => typeof input.brief.answers[key] !== 'string') || !(input.site === null || object(input.site))) throw new Error('This is not a supported private Buildmine project. Choose the .buildmine.json file you saved.');
  return {format:'buildmine-private-project',version:1,brief:{name:input.brief.name,resume:input.brief.resume,drewStyle:input.brief.drewStyle,answers:Object.fromEntries(questionIds.map(key => [key,input.brief.answers[key]]))},site:input.site === null ? null : normalizeSite(input.site)};
}
export function namedPath(slug) {
  if (typeof slug !== 'string' || slug.length > 80 || !/^[a-z][a-z0-9]*(?:\.[a-z0-9]+){2,5}$/.test(slug)) throw new Error('Use a dotted name such as alex.rivera.example, with lowercase letters and digits.');
  return `p/${slug}/`;
}
export function renderPage(input, css, page = 'home', options = {}) {
  const s = normalizeSite(input), e = escapeHTML;
  if (!['home','about','hello'].includes(page)) throw new Error('Unknown page.');
  const single = Boolean(options.single), demo = Boolean(options.demo), embedded = Boolean(options.embedded);
  const prefix = page === 'home' || single ? './' : '../';
  const hasAbout = Boolean(s.bio.trim() || s.experience.trim());
  const mail = safeEmail(s.email), booking = safeURL(s.booking), hasHello = Boolean(mail || booking);
  const anchor = embedded ? 'about:srcdoc' : '';
  const href = p => single ? `${anchor}#${p}` : p === 'home' ? `${prefix}index.html` : `${prefix}${p}/index.html`;
  const link = (p,label) => `<a href="${href(p)}"${!single && p === page ? ' aria-current="page"' : ''}>${label}</a>`;
  const section = (id,label,text) => text.trim() ? `<section id="${id}"><h2 class="label">${label}</h2><div class="copy">${e(text)}</div></section>` : '';
  const contacts = `${mail ? `<a class="button" href="mailto:${e(mail)}">Say hello</a>` : ''}${booking ? `<a class="button outline" href="${e(booking)}" target="_blank" rel="noopener noreferrer">Schedule a conversation</a>` : ''}`;
  const hero = `<div class="hero" id="home"><p class="label">${demo ? 'Fictional example · Buildmine starter' : 'Hello, I’m'}</p><h1>${e(s.name)}</h1>${s.headline ? `<p class="headline">${e(s.headline)}</p>` : ''}${contacts ? `<div class="actions">${contacts}</div>` : ''}</div>`;
  const about = section('about','About',s.bio) + section('experience','Experience',s.experience);
  const hello = `<section class="hello" id="hello"><div><p class="label">Let’s connect</p><h2>A conversation starts here.</h2></div><div class="actions">${contacts}</div></section>`;
  const content = single ? `${hero}<div class="sections">${about}${section('highlights','Selected work',s.highlights)}</div>${hasHello ? hello : ''}` : page === 'home' ? `${hero}${section('highlights','Selected work',s.highlights)}` : page === 'about' ? `<div class="page-title"><h1>About ${e(s.name)}</h1></div><div class="sections">${about}</div>` : `<div class="page-title"><h1>Say hello.</h1></div>${hello}`;
  const title = `${s.name}${page === 'home' && s.headline ? ` — ${s.headline}` : page !== 'home' ? ` — ${page === 'about' ? 'About' : 'Hello'}` : ''}`;
  const inline = single || embedded;
  return `<!doctype html>\n<!-- ${LICENSE} -->\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="${demo || embedded ? 'noindex, nofollow' : 'index, follow'}"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'"><title>${e(title)}</title><meta name="description" content="${e(s.headline)}">${inline ? `<style>${css}</style>` : `<link rel="stylesheet" href="${prefix}assets/style.css">`}</head><body class="${s.theme}"><a class="skip" href="${anchor}#main">Skip to content</a><div class="wrap"><header><a class="name" href="${href('home')}">${e(s.name)}</a><nav aria-label="Site navigation">${link('home','Home')}${hasAbout ? link('about','About') : ''}${hasHello ? link('hello','Hello') : ''}</nav></header>${demo ? '<p class="example">Fictional example. This page demonstrates the starter; it is not a customer, testimonial, or verified identity.</p>' : ''}<main id="main">${content}</main><footer><span>${e(s.name)}</span>${s.credit ? '<a href="https://drewcleaver.com/buildmine/?utm_source=starter&amp;utm_medium=referral&amp;utm_campaign=buildmine&amp;utm_content=footer">Made with Buildmine · Make yours</a>' : ''}</footer></div></body></html>\n`;
}
export function staticFiles(input, css, options = {}) {
  const s = validatePublic(input);
  const result = {'index.html':renderPage(s,css,'home',options),'assets/style.css':css,'LICENSE.txt':LICENSE,'.nojekyll':''};
  if (s.bio.trim() || s.experience.trim()) result['about/index.html'] = renderPage(s,css,'about',options);
  if (s.email || s.booking) result['hello/index.html'] = renderPage(s,css,'hello',options);
  return result;
}
export function kitFiles(input, css, sources) {
  const s = validatePublic(input);
  const result = {...sources,'site.json':JSON.stringify(s,null,2)+'\n','styles.css':css,'provenance.json':JSON.stringify({generator:'Buildmine',version:VERSION,source:SOURCE,license:'MIT',notice:'The generator supplied the structure. Site content belongs to its author. Visible attribution is optional.'},null,2)+'\n'};
  for (const [path,content] of Object.entries(staticFiles(s,css))) result[`site/${path}`] = content;
  return result;
}
export function encodeSite(input) {
  const bytes = new TextEncoder().encode(JSON.stringify(validatePublic(input)));
  if (bytes.length > 9000) throw new Error('This site is too long for a share link. Download the complete kit instead. Your content has not been shortened.');
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decodeSite(fragment) {
  if (!fragment || fragment.length > 12000 || !/^[\w-]+$/.test(fragment)) throw new Error('This preview link is incomplete or too long.');
  const binary = atob(fragment.replace(/-/g,'+').replace(/_/g,'/'));
  return validatePublic(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c => c.charCodeAt(0)))));
}
// ZIP STORE: no compression dependencies; UTF-8 names and CRC-32 checked by tests.
export function zipFiles(files) {
  const enc = new TextEncoder(), local = [], directory = []; let offset = 0;
  const crc32 = bytes => { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for (let n=0;n<8;n++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return (crc ^ 0xffffffff) >>> 0; };
  const header = size => { const bytes = new Uint8Array(size); return {bytes,view:new DataView(bytes.buffer)}; };
  const entries = Object.entries(files);
  if (entries.length > 65535) throw new Error('Too many files for this kit.');
  for (const [path,content] of entries) {
    if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(p => !p || p === '.' || p === '..')) throw new Error('Unsafe kit path.');
    const name = enc.encode(path), data = enc.encode(content), crc = crc32(data);
    if (name.length > 65535 || data.length > 0xffffffff || offset + data.length + name.length + 30 > 0xffffffff) throw new Error('This kit exceeds the ZIP format limit.');
    const h = header(30), c = header(46);
    h.view.setUint32(0,0x04034b50,true); h.view.setUint16(4,20,true); h.view.setUint16(6,0x800,true); h.view.setUint16(12,33,true); h.view.setUint32(14,crc,true); h.view.setUint32(18,data.length,true); h.view.setUint32(22,data.length,true); h.view.setUint16(26,name.length,true);
    c.view.setUint32(0,0x02014b50,true); c.view.setUint16(4,20,true); c.view.setUint16(6,20,true); c.view.setUint16(8,0x800,true); c.view.setUint16(14,33,true); c.view.setUint32(16,crc,true); c.view.setUint32(20,data.length,true); c.view.setUint32(24,data.length,true); c.view.setUint16(28,name.length,true); c.view.setUint32(42,offset,true);
    local.push(h.bytes,name,data); directory.push(c.bytes,name); offset += 30 + name.length + data.length;
  }
  const length = directory.reduce((n,b) => n+b.length,0), end = header(22);
  if (offset + length + 22 > 0xffffffff) throw new Error('This kit exceeds the ZIP format limit.');
  end.view.setUint32(0,0x06054b50,true); end.view.setUint16(8,entries.length,true); end.view.setUint16(10,entries.length,true); end.view.setUint32(12,length,true); end.view.setUint32(16,offset,true);
  const output = new Uint8Array(offset+length+22); let cursor = 0;
  for (const part of [...local,...directory,end.bytes]) { output.set(part,cursor); cursor += part.length; }
  return output;
}

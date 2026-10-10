import { readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
const destination = process.argv[2];
if (!destination || !isAbsolute(destination)) throw Error('Supply an absolute output HTML path.');
const dom = new JSDOM(readFileSync('dist/cleaver2028/index.html','utf8'));
const doc = dom.window.document;
const copy = doc.querySelector('article').textContent.replace(/\s+/g,' ').trim();
const copySections = [...doc.querySelectorAll('article>section')].map(section => [...section.querySelectorAll('h1,h2,h3,h4,p,dt,dd,a.button')].map(n => n.textContent.trim()).join('\n\n')).join('\n\n---\n\n');
const css = [...doc.querySelectorAll('link[rel="stylesheet"]')].map(link => { const text=readFileSync('dist'+link.getAttribute('href'),'utf8'); link.remove(); return text; }).join('\n');
const style = doc.createElement('style'); style.textContent = css; doc.head.append(style);
doc.querySelectorAll('link[rel="icon"]').forEach(n=>n.remove());
writeFileSync(destination.replace(/\.html$/, '-Copy.txt'),copySections);
for (const image of doc.querySelectorAll('img[src]')) {
  const src=image.getAttribute('src');
  if (!src.startsWith('/cleaver2028/') || !src.endsWith('.jpeg')) throw Error('Unexpected review image source.');
  image.src='data:image/jpeg;base64,'+readFileSync('dist'+src).toString('base64');
}
for (const a of doc.querySelectorAll('a[href]')) {
  if (a.getAttribute('href').startsWith('#')) continue;
  if (a.getAttribute('href').startsWith('/')) a.href = new URL(a.getAttribute('href'), 'https://drewcleaver.com').href;
  a.target='_blank'; a.rel='noopener noreferrer';
}
const page = '<!doctype html>'+doc.documentElement.outerHTML;
const notes = readFileSync('docs/cleaver2028/R02-REVIEW.md','utf8');
const patch = execFileSync('git',['diff','c8decb50d82a136705af2743b389907783aa5d3f','--binary'],{encoding:'utf8'});
if (!patch.includes('src/pages/cleaver2028')) throw Error('Missing campaign implementation patch.');
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const payload = JSON.stringify({page,copy:copySections,patch}).replaceAll('<','\\u003c');
writeFileSync(destination,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Cleaver2028 — local review</title><style>
*{box-sizing:border-box}body{margin:0;background:#e9ece2;color:#173e35;font:15px/1.6 system-ui,sans-serif}.review-header{padding:16px 20px;background:#f7f5ee;border-bottom:1px solid #bdc7ba}.review-header h1{font:24px/1.2 Georgia,serif;margin:0}.review-header p{max-width:90ch;margin:8px 0}.controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}button{font:inherit;min-height:44px;padding:7px 12px;background:#f7f5ee;color:#173e35;border:1px solid #9dac9d;border-radius:3px;cursor:pointer}button[aria-pressed=true]{background:#173e35;color:#f7f5ee}:focus-visible{outline:3px solid #b56d24;outline-offset:3px}.stage{padding:20px 12px;overflow:auto}iframe{display:block;margin:auto;border:1px solid #bfcabc;background:#f7f5ee;height:850px;width:100%;max-width:none}details{padding:16px 20px;background:#f7f5ee;border-top:1px solid #bdc7ba}summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600}pre{white-space:pre-wrap;overflow-wrap:anywhere;max-width:95ch;font:15px/1.75 system-ui,sans-serif}a{color:inherit}.small{font-size:13px}noscript{display:block;padding:20px}
</style></head><body><header class="review-header"><h1>Cleaver2028 / R02 local draft review</h1><p>Actual built page and CSS. Not published or deployed. The file can be forwarded; noindex is not privacy. Lab and project links remain disabled.</p><p class="small">No browser screenshots or completed visual/keyboard QA are claimed. Width buttons support your inspection. Page links open existing live destinations or your mail client when clicked.</p><div class="controls" role="group" aria-label="Preview width"><span>Width</span>${[320,390,768,1440,'fluid'].map(w=>`<button type="button" data-width="${w}" aria-pressed="${w==='fluid'}">${w==='fluid'?'Fit window':w}</button>`).join('')}</div></header><div class="stage"><iframe id="frame" title="Actual Cleaver2028 page" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe></div><noscript>Enable JavaScript to display this review wrapper. The production page itself has no scripts. Copy and notes remain readable below.</noscript><details><summary>Page copy</summary><button id="copy-download" type="button">Download page copy</button><pre>${escape(copySections)}</pre></details><details><summary>Review notes, verification and release decisions</summary><pre>${escape(notes)}</pre></details><details><summary>Recover the implementation</summary><p>Local branch based on main c8decb5. This patch contains the additive source, safeguards, checks and review notes. No source was pushed.</p><button type="button" id="patch-download">Download source patch</button></details><script>
const payload=${payload};const frame=document.getElementById('frame');frame.srcdoc=payload.page;
document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{frame.style.width=button.dataset.width==='fluid'?'100%':button.dataset.width+'px';document.querySelectorAll('[data-width]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.getElementById('copy-download').addEventListener('click',()=>download('Cleaver2028-Copy.txt',payload.copy));
document.getElementById('patch-download').addEventListener('click',()=>download('Cleaver2028-Implementation.patch',payload.patch));
</script></body></html>`);
console.log(JSON.stringify({destination,words:copy.split(/\s+/).length,embeddedRecoveryPatch:patch.length>0}));

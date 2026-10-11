import { readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { execFileSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
const destination = process.argv[2];
if (!destination || !isAbsolute(destination) || !destination.endsWith('.html')) throw Error('Supply an absolute output HTML path.');
const revision = JSON.parse(readFileSync('src/data/cleaver2028-revisions.json','utf8'));
if (revision.contentStatus !== 'draft' || revision.publishedAt !== null) throw Error('This generator is for unpublished draft review.');
const doc = new JSDOM(readFileSync('dist/cleaver2028/index.html','utf8')).window.document;
const copyNodes = [...doc.body.querySelectorAll('h1,h2,h3,h4,p,dt,dd,figcaption,summary,a')].filter(n => n.tagName !== 'A' || !n.closest('p,dt,dd,figcaption,summary,h1,h2,h3,h4'));
const copy = copyNodes.map(n => n.textContent.replace(/\s+/g,' ').trim()+(n.tagName==='A'?' ['+n.getAttribute('href')+']':'')).join('\n\n');
const css = [...doc.querySelectorAll('link[rel="stylesheet"]')].map(link => { const text=readFileSync('dist'+link.getAttribute('href'),'utf8'); link.remove(); return text; }).join('\n');
const style = doc.createElement('style'); style.textContent = css; doc.head.append(style);
doc.querySelectorAll('link[rel="icon"]').forEach(n=>n.remove());
for (const img of doc.querySelectorAll('img[src]')) {
  const src=img.getAttribute('src');
  if (!src.startsWith('/cleaver2028/') && !src.startsWith('/_astro/')) throw Error('Unexpected review image source.');
  const type=src.endsWith('.webp')?'image/webp':'image/jpeg';
  img.src='data:'+type+';base64,'+readFileSync('dist'+src).toString('base64');
  img.removeAttribute('srcset'); img.removeAttribute('sizes');
}
for (const a of doc.querySelectorAll('a[href]')) {
  const href=a.getAttribute('href');
  if (href.startsWith('#')) continue;
  if (href.startsWith('/')) a.href = new URL(href, 'https://drewcleaver.com').href;
  a.target='_blank'; a.rel='noopener noreferrer';
}
const page = '<!doctype html>'+doc.documentElement.outerHTML;
const notes = readFileSync('docs/cleaver2028/R03-REVIEW.md','utf8');
const patch = execFileSync('git',['diff',revision.baseCommit,'--binary'],{encoding:'utf8'});
if (!patch.includes('src/pages/cleaver2028') || !patch.includes('cleaver2028-revisions.json')) throw Error('Stage new files before making the recovery patch.');
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const payload = JSON.stringify({page,copy,patch}).replaceAll('<','\\u003c');
writeFileSync(destination,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Cleaver2028 R03 — private local review</title><style>
*{box-sizing:border-box}body{margin:0;background:#e9ece2;color:#173e35;font:15px/1.6 system-ui,sans-serif}.review-header{padding:16px 20px;background:#f7f5ee;border-bottom:1px solid #bdc7ba}.review-header h1{font:24px/1.2 Georgia,serif;margin:0}.review-header p{max-width:100ch;margin:8px 0}.controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}button{font:inherit;min-height:44px;padding:7px 12px;background:#f7f5ee;color:#173e35;border:1px solid #9dac9d;border-radius:3px;cursor:pointer}button[aria-pressed=true]{background:#173e35;color:#f7f5ee}:focus-visible{outline:3px solid #b56d24;outline-offset:3px}.stage{padding:20px 12px;overflow:auto}iframe{display:block;margin:auto;border:1px solid #bfcabc;background:#f7f5ee;height:900px;width:100%;max-width:none}details{padding:16px 20px;background:#f7f5ee;border-top:1px solid #bdc7ba}summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600}pre{white-space:pre-wrap;overflow-wrap:anywhere;max-width:100ch;font:15px/1.75 system-ui,sans-serif}a{color:inherit}.small{font-size:13px}noscript{display:block;padding:20px}
</style></head><body><header class="review-header"><h1>Cleaver2028 / R03 draft review</h1><p>Actual built page, with its CSS and images included. Nothing has been pushed or published. DPC and ProofPath links are proposed: releasing them would make those unlisted pages easier to discover. No Lab hub link is proposed.</p><p class="small">This is a local review file, not a hosted site. It can be forwarded. Project links open the existing live concepts; email opens your mail app. The preview has no external asset requests. Browser layout and keyboard verification remain blocked; width controls are for your review.</p><div class="controls" role="group" aria-label="Preview width"><span>Width</span>${[320,390,768,1440,'fluid'].map(w=>`<button type="button" data-width="${w}" aria-pressed="${w==='fluid'}">${w==='fluid'?'Fit window':w}</button>`).join('')}<button type="button" id="page-download">Download standalone page</button></div></header><div class="stage"><iframe id="frame" title="Actual Cleaver2028 R03 draft" sandbox="allow-popups allow-popups-to-escape-sandbox"></iframe></div><noscript>Enable JavaScript for the review frame. The production page itself needs no JavaScript. Its complete copy and review notes are below.</noscript><details><summary>Final proposed copy</summary><button id="copy-download" type="button">Download page copy</button><pre>${escape(copy)}</pre></details><details><summary>Sources, changed files, checks and release decisions</summary><pre>${escape(notes)}</pre></details><details><summary>Recover the local implementation</summary><p>Source patch against main ${revision.baseCommit}. Includes the page, draft release safeguard, revision record and supporting review files. Stage new files when regenerating it. No public branch or PR was created.</p><button type="button" id="patch-download">Download implementation patch</button></details><script>
const payload=${payload};const frame=document.getElementById('frame');frame.srcdoc=payload.page;
document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{frame.style.width=button.dataset.width==='fluid'?'100%':button.dataset.width+'px';document.querySelectorAll('[data-width]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
function download(name,text,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.getElementById('copy-download').addEventListener('click',()=>download('Cleaver2028-R03-Copy.txt',payload.copy));
document.getElementById('patch-download').addEventListener('click',()=>download('Cleaver2028-R03-Implementation.patch',payload.patch));
document.getElementById('page-download').addEventListener('click',()=>download('Cleaver2028-R03-Page.html',payload.page,'text/html;charset=utf-8'));
</script></body></html>`);
writeFileSync(destination.replace(/\.html$/, '-Copy.txt'),copy);
console.log(JSON.stringify({destination,words:copy.split(/\s+/).length,embeddedRecoveryPatch:true,externalAssetRequests:0}));

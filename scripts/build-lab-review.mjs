import { readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { JSDOM } from 'jsdom';
const destination = process.argv[2];
if (!destination || !isAbsolute(destination)) throw Error('Supply an absolute review HTML output path.');
const paths = ['/lab/', '/lab/healthcare/', '/lab/work/', '/lab/updates/'];
const pages = {};
for (const path of paths) {
  const dom = new JSDOM(readFileSync(`dist${path}index.html`, 'utf8'));
  const document = dom.window.document;
  let css = [...document.querySelectorAll('style')].map(node => node.textContent).join('\n');
  for (const node of document.querySelectorAll('link[rel="stylesheet"]')) {
    css += readFileSync(`dist${node.getAttribute('href')}`, 'utf8'); node.remove();
  }
  document.querySelectorAll('link[rel="manifest"], link[rel="icon"], link[rel="apple-touch-icon"]').forEach(node => node.remove());
  const style = document.createElement('style'); style.textContent = css; document.head.append(style);
  for (const link of document.querySelectorAll('a[href]')) {
    const url = new URL(link.getAttribute('href'), 'https://drewcleaver.com' + path);
    if (!url.pathname.startsWith('/lab/') && url.origin === 'https://drewcleaver.com') link.href = url.href;
  }
  // This script is review-only. Production Lab pages contain no JavaScript.
  const script = document.createElement('script');
  script.textContent = `document.addEventListener('click', event => {
    const link = event.target.closest('a'); if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('/lab/')) { event.preventDefault(); parent.postMessage({labReview: href}, '*'); }
  });`;
  document.body.append(script);
  pages[path] = '<!doctype html>' + document.documentElement.outerHTML;
}
const safeJSON = JSON.stringify(pages).replaceAll('<', '\\u003c');
writeFileSync(destination, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Lab R01 — review preview</title><style>
*{box-sizing:border-box}body{margin:0;background:#e9ece2;color:#173e35;font:15px/1.6 system-ui,sans-serif}.review-bar{padding:16px 20px;background:#f7f5ee;border-bottom:1px solid #bfcabc}.review-bar strong{font-family:Georgia,serif;font-size:23px}.review-bar p{margin:6px 0;max-width:85ch}.review-controls{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:12px}button,select{font:inherit;min-height:44px;border:1px solid #9dac9d;border-radius:3px;padding:7px 12px;background:#f7f5ee;color:#173e35;cursor:pointer}button[aria-pressed=true]{background:#173e35;color:#f7f5ee}:focus-visible{outline:3px solid #b56d24;outline-offset:3px}.stage{overflow:auto;padding:20px 12px}iframe{display:block;margin:auto;border:1px solid #bfcabc;background:#f7f5ee;height:850px;max-width:none}.status{font-size:13px;color:#5d6962}a{color:inherit}
</style></head><body><header class="review-bar"><strong>Drew Cleaver / Lab — R01 draft review</strong><p>Production markup and CSS, packaged for review. Not deployed. Viewport buttons let you inspect layouts; no screenshots, browser QA or device installation are claimed.</p><p class="status">Review navigation uses a small wrapper script. The website itself reads and navigates without JavaScript. Source proposals open the existing live website in a new tab; the manifest is omitted from this review wrapper.</p><div class="review-controls"><label for="page">Page</label><select id="page"><option value="/lab/">Lab Home</option><option value="/lab/healthcare/">Healthcare</option><option value="/lab/work/">Work</option><option value="/lab/updates/">Updates</option></select><span>Width</span><button type="button" data-width="320" aria-pressed="false">320</button><button type="button" data-width="390" aria-pressed="false">390</button><button type="button" data-width="768" aria-pressed="false">768</button><button type="button" data-width="1440" aria-pressed="false">1440</button><button type="button" data-width="fluid" aria-pressed="true">Fit window</button></div></header><div class="stage"><iframe id="frame" title="Lab production page preview" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" style="width:100%"></iframe></div><script>
const pages=${safeJSON}; const frame=document.getElementById('frame');const selector=document.getElementById('page');
function show(path,hash=''){if(!pages[path])return;selector.value=path;frame.srcdoc=pages[path].replace('</body>',hash?'<script>location.hash='+JSON.stringify(hash)+';<\\/script></body>':'</body>');}
selector.addEventListener('change',()=>show(selector.value));
document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{frame.style.width=button.dataset.width==='fluid'?'100%':button.dataset.width+'px';document.querySelectorAll('[data-width]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
window.addEventListener('message',event=>{if(event.source!==frame.contentWindow||typeof event.data?.labReview!=='string')return;const url=new URL(event.data.labReview,'https://drewcleaver.com');if(url.origin==='https://drewcleaver.com')show(url.pathname,url.hash);});show('/lab/');
</script></body></html>`);
console.log(destination);

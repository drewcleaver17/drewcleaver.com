import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeSite,validatePublic,normalizeProject,questionIds,renderPage,staticFiles,kitFiles,zipFiles,encodeSite,decodeSite,namedPath} from './core.mjs';
const sample=JSON.parse(readFileSync(new URL('./site.json',import.meta.url),'utf8'));
const css=readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const site={...sample,name:'Zoë 李',bio:'Résumé 🧰\nSecond paragraph.',credit:true};
test('public data excludes unknown and private fields',()=>{
 const unsafe={...site,resume:'PRIVATE_SENTINEL',answers:{boundaries:'PRIVATE_SENTINEL'},brief:'PRIVATE_SENTINEL'};
 assert.equal(JSON.stringify(normalizeSite(unsafe)).includes('PRIVATE_SENTINEL'),false);
 assert.equal(JSON.stringify(kitFiles(unsafe,css,{})).includes('PRIVATE_SENTINEL'),false);
 assert.deepEqual(decodeSite(encodeSite(unsafe)),site);
});
test('markup and URL injection cannot produce executable user content',()=>{
 const attack={...site,name:'<script>alert(1)</script>',bio:'<img src=x onerror=alert(1)>',booking:'javascript:alert(1)',email:'a@b.test?subject=oops'};
 const html=renderPage(attack,css,'home',{single:true});
 assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('<img'));assert(!html.includes('href="javascript:'));assert(!html.includes('mailto:'));
 assert.throws(()=>validatePublic(attack));
 for(const booking of ['data:text/html,bad','https://user:pass@example.com','https://example.com\n@evil.test']) assert.throws(()=>validatePublic({...site,booking}));
 assert.throws(()=>normalizeSite({...site,theme:'"><script>'}));
});
test('long UTF-8 copy remains complete in projects, HTML and kits; links fail explicitly',()=>{
 const long='日本語 🧰 café\n'.repeat(4000),s={...site,bio:long};
 const project={format:'buildmine-private-project',version:1,brief:{name:'Name',resume:long,drewStyle:true,answers:Object.fromEntries(questionIds.map(k=>[k,long]))},site:s,approved:true};
 const restored=normalizeProject(JSON.parse(JSON.stringify(project)));
 assert.equal(restored.brief.resume,long); for(const key of questionIds) assert.equal(restored.brief.answers[key],long);
 assert.deepEqual(restored.site,s);assert(!('approved' in restored));
 assert(kitFiles(s,css,{})['site/about/index.html'].includes(long));
 assert.throws(()=>encodeSite(s),/too long/);
 const bad=structuredClone(project);delete bad.brief.answers.boundaries;assert.throws(()=>normalizeProject(bad));
 assert.throws(()=>normalizeProject({...project,version:7}));
 assert.deepEqual(normalizeProject({...project,site:null}).site,null);
});
test('relative navigation and styles resolve at domain root, repository subpath and named demo',()=>{
 for(const theme of ['editorial','studio','technical']) {
 const files=staticFiles({...site,theme},css);
 for(const prefix of ['/', '/my-repository/', '/p/alex.rivera.example/']) for(const [path,html] of Object.entries(files).filter(([p])=>p.endsWith('.html'))) {
  const pageURL=new URL(prefix+path,'https://example.test');
  for(const [,href] of html.matchAll(/href="([^"]+)"/g)) {
   if(/^(?:https?:|mailto:|#)/.test(href)) continue;
   const target=new URL(href,pageURL).pathname;
   assert(target.startsWith(prefix));assert(Object.hasOwn(files,target.slice(prefix.length)),`Missing ${target}`);
  }
 }
 }
 assert.equal(namedPath('alex.rivera.example'),'p/alex.rivera.example/');
 for(const bad of ['../admin','foo','a..b','a.b./x','A.b.c','a.b.c?x']) assert.throws(()=>namedPath(bad));
});
test('blank sections disappear and credit can be removed',()=>{
 const blank={...site,bio:'',experience:'',email:'',booking:'',highlights:'',credit:false};
 const files=staticFiles(blank,css);assert(!files['about/index.html']);assert(!files['hello/index.html']);
 assert(!files['index.html'].includes('Made with Buildmine'));assert(!files['index.html'].includes('href="./about/'));
 assert(!files['index.html'].includes('<script'));
 const demo=staticFiles(site,css,{demo:true});assert(demo['index.html'].includes('Fictional example'));assert(demo['index.html'].includes('noindex, nofollow'));
});
test('ZIP has stable filenames, UTF-8 byte lengths and valid CRC32 for every file',()=>{
 const files={'index.html':renderPage(site,css,'home',{single:true}),'site.json':JSON.stringify(site),'notes/日本語.txt':'Zoë 🧰'},zip=zipFiles(files),v=new DataView(zip.buffer);
 let at=0;const found={};
 const crc=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let n=0;n<8;n++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
 while(v.getUint32(at,true)===0x04034b50){
  const length=v.getUint32(at+18,true),nameLength=v.getUint16(at+26,true),start=at+30+nameLength;
  assert.equal(v.getUint16(at+6,true),0x800);
  const name=new TextDecoder().decode(zip.slice(at+30,start)),bytes=zip.slice(start,start+length);
  assert.equal(v.getUint32(at+14,true),crc(bytes));found[name]=new TextDecoder().decode(bytes);at=start+length;
 }
 assert.equal(v.getUint32(at,true),0x02014b50);assert.deepEqual(found,files);
 assert.equal(v.getUint32(zip.length-22,true),0x06054b50);assert.equal(v.getUint16(zip.length-12,true),Object.keys(files).length);
 assert.throws(()=>zipFiles({'../escape':'x'}));
});

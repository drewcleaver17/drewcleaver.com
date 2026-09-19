// Exercises the actual production bundle against the built page DOM.
// This checks behavior, not visual layout or a live hosting deployment.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {SourceTextModule} from 'node:vm';
import {JSDOM} from 'jsdom';
const output=resolve('dist');
async function setup(page='buildmine',hash='') {
 const html=readFileSync(`${output}/${page}/index.html`,'utf8');
 const dom=new JSDOM(html,{url:`https://example.test/${page}/${hash}`,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,downloads=[],modules=new Map();
 Object.assign(w,{TextEncoder,TextDecoder,Blob,confirm:()=>true});
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:https://example.test/download';};
 w.URL.revokeObjectURL=()=>{};
 w.HTMLAnchorElement.prototype.click=function(){};
 const ctx=dom.getInternalVMContext();
 const getModule=async path=>{
  if(modules.has(path))return modules.get(path);
  const m=new SourceTextModule(readFileSync(path,'utf8'),{context:ctx,identifier:path,importModuleDynamically:async specifier=>{const next=await getModule(resolve(dirname(path),specifier));if(next.status==='unlinked')await next.link((s,m)=>getModule(resolve(dirname(m.identifier),s)));if(next.status==='linked')await next.evaluate();return next;}});
  modules.set(path,m);return m;
 };
 for(const script of w.document.querySelectorAll('script[type="module"][src]')){
  const m=await getModule(resolve(output,script.getAttribute('src').slice(1)));
  await m.link((specifier,ref)=>getModule(resolve(dirname(ref.identifier),specifier)));await m.evaluate();
 }
 const el=id=>w.document.getElementById(id);
 const input=(id,value)=>{el(id).value=value;el(id).dispatchEvent(new w.Event('input',{bubbles:true}));};
 const click=id=>el(id).click();
 const restore=async obj=>{Object.defineProperty(el('project-file'),'files',{configurable:true,value:[{text:async()=>typeof obj==='string'?obj:JSON.stringify(obj)}]});el('project-file').dispatchEvent(new w.Event('change'));await new Promise(r=>setImmediate(r));};
 return {dom,w,el,input,click,downloads,restore};
}
test('blank start, review gate, all themes, share invalidation, full project round trip and bad-file recovery',async()=>{
 const t=await setup();const {w,el,input,click,downloads,restore}=t;
 try {
 assert.equal(el('builder-inputs').disabled,false);assert.equal(w.document.querySelectorAll('.buildmine-question').length,7);
 input('build-name','Example Tester');click('build-send');assert.equal(el('builder-result').hidden,false);
 assert.equal(el('site-email').value,'');assert.equal(el('site-booking').value,'');
 click('site-export');assert.equal(downloads.length,0);assert.match(el('editor-status').textContent,/approval box/);
 input('site-bio','Public 🧰 biography');input('site-email','example@example.com');
 el('review-approved').checked=true;click('site-share');assert.equal(el('share-output').hidden,false);
 input('site-headline','Edited headline');assert.equal(el('review-approved').checked,false);assert.equal(el('share-output').hidden,true);
 for(const theme of ['studio','technical','editorial']) { const radio=w.document.querySelector(`input[name=theme][value=${theme}]`);radio.checked=true;radio.dispatchEvent(new w.Event('input',{bubbles:true}));assert(el('site-frame').srcdoc.includes(`class="${theme}"`)); }
 input('resume-text','PRIVATE_RESUME 🧰\n'.repeat(1000));
 for(const id of ['purpose','audience','story','proof','aesthetic','connection','boundaries'])input(`answer-${id}`,`PRIVATE_${id} `+'日本語 '.repeat(100));
 click('project-save');const project=JSON.parse(await downloads.at(-1).text());
 assert.equal(project.brief.resume,el('resume-text').value);assert.equal(project.site.bio,'Public 🧰 biography');assert.equal(project.brief.answers.boundaries,el('answer-boundaries').value);
 input('site-bio','Unsaved changes');const before=el('site-bio').value;await restore('{invalid');assert.equal(el('site-bio').value,before);assert.match(el('project-status').textContent,/unchanged/);
 w.confirm=()=>false;await restore(project);assert.equal(el('site-bio').value,before);
 w.confirm=()=>true;await restore(project);assert.equal(el('site-bio').value,project.site.bio);assert.equal(el('resume-text').value,project.brief.resume);assert.equal(el('review-approved').checked,false);
 el('review-approved').checked=true;click('site-export');const zip=Buffer.from(await downloads.at(-1).arrayBuffer());
 assert.equal(zip.readUInt32LE(0),0x04034b50);assert(!zip.includes(Buffer.from('PRIVATE_RESUME')));assert(!zip.includes(Buffer.from('PRIVATE_boundaries')));assert(zip.includes(Buffer.from('Public 🧰 biography')));
 input('site-booking','javascript:alert(1)');el('review-approved').checked=true;const n=downloads.length;click('site-export');assert.equal(downloads.length,n);
 input('site-booking','');el('review-approved').checked=true;el('site-credit').checked=false;el('site-credit').dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(el('review-approved').checked,false);
 }finally{t.dom.window.close();}
});
test('resume TXT import is local and missing snapshot links show a recoverable error',async()=>{
 const t=await setup();try{
 const file={name:'fictional.txt',size:150,type:'text/plain',text:async()=> 'Example Tester\nWorkshop organizer\nSummary\nA fictional résumé.\nExperience\nCommunity workshop'};
 Object.defineProperty(t.el('resume-file'),'files',{configurable:true,value:[file]});t.el('resume-file').dispatchEvent(new t.w.Event('change'));t.click('import-resume-button');
 // Wait for the actual lazy module import and handler completion, not a fixed delay.
 for(let i=0;i<100 && t.el('import-resume-button').disabled;i++) await new Promise(r=>setImmediate(r));
 assert.match(t.el('resume-text').value,/A fictional résumé/);assert.match(t.el('resume-import-status').textContent,/not been uploaded/);
 t.input('build-name','Example Tester');t.click('build-send');assert.equal(t.el('site-bio').value,'A fictional résumé.');
 }finally{t.dom.window.close();}
 const v=await setup('preview');try{assert.match(v.el('preview-error').textContent,/missing or incomplete/);assert.equal(v.el('shared-site-frame').hidden,true);}finally{v.dom.window.close();}
});

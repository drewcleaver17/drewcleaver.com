import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { initInquiry } from '../src/scripts/inquiry.mjs';
const html = readFileSync('dist/contact/index.html','utf8');
function setup(fetch) {
  const dom = new JSDOM(html,{url:'https://drewcleaver.com/contact/?reason=advisory'});
  const {window:w}=dom; w.fetch=fetch;
  const form=w.document.querySelector('form');
  form.elements.name.value='Test visitor';form.elements.email.value='test@example.invalid';form.elements.message.value='A useful question';
  initInquiry(w.document);
  return {w,form,status:w.document.querySelector('#form-status'),button:w.document.querySelector('#send-button'),send:()=>form.dispatchEvent(new w.Event('submit',{cancelable:true}))};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('native validation, optional fields and category prefill', async()=>{
  let calls=0;const x=setup(async()=>{calls++;return {ok:true}});
  assert.equal(x.form.elements.reason.value,'advisory');
  for(const name of ['reason','price'])assert.equal(x.form.elements[name].required,false);
  x.form.elements.message.value='   ';x.send();assert.equal(calls,0);
  x.form.elements.message.value='A question';x.form.elements.message.dispatchEvent(new x.w.Event('input'));
  x.form.elements.email.value='invalid';x.send();assert.equal(calls,0);
  x.form.elements.email.value='test@example.invalid';x.send();await settle();assert.equal(calls,1);x.w.close();
});
test('pending prevents duplicates; acceptance resets unchanged values and focuses result',async()=>{
  let finish,calls=0;const x=setup(()=>{calls++;return new Promise(r=>finish=r)});
  x.send();x.send();assert.equal(calls,1);assert(x.button.disabled);assert.equal(x.form.getAttribute('aria-busy'),'true');
  finish({ok:true});await settle();assert.equal(x.form.elements.message.value,'');assert.match(x.status.textContent,/Inbox delivery is not confirmed/);assert.equal(x.w.document.activeElement,x.status);assert(!x.button.disabled);x.w.close();
});
test('success never discards edits made while request is pending',async()=>{
  let finish,body;const x=setup(async()=>({ok:true}));
  x.w.fetch=(_,options)=>{body=options.body;return new Promise(r=>finish=r)};
  x.send();x.form.elements.message.value='New unsent draft';finish({ok:true});await settle();
  assert.equal(body.get('message'),'A useful question');assert.equal(x.form.elements.message.value,'New unsent draft');assert.match(x.status.textContent,/newer edits.*not been sent/);x.w.close();
});
for(const mode of ['HTTP','network','timeout'])test(`${mode} failure preserves all input and permits retry`,async()=>{
  const x=setup(async()=>{if(mode==='HTTP')return {ok:false};throw new Error(mode)});
  if(mode==='timeout'){
    x.w.setTimeout=fn=>{queueMicrotask(fn);return 1};
    x.w.fetch=(_,opts)=>new Promise((_,reject)=>opts.signal.addEventListener('abort',()=>reject(new Error('abort'))));
  }
  x.form.elements.price.value='Let’s discuss';x.send();await settle();
  assert.equal(x.form.elements.message.value,'A useful question');assert.equal(x.form.elements.price.value,'Let’s discuss');assert(x.status.classList.contains('error'));assert(!x.button.disabled);x.w.fetch=async()=>({ok:true});x.send();await settle();assert.equal(x.form.elements.message.value,'');x.w.close();
});
test('public routes, contact links, downloads and vCard agree',()=>{
  for(const route of ['','about/','services/','contact/','hello/']){
    const d=new JSDOM(readFileSync(`dist/${route}index.html`,'utf8')).window.document;
    assert.equal(d.querySelectorAll('h1').length,1);
    for(const a of d.querySelectorAll('a[href]')){
      const href=a.getAttribute('href');
      if(href.startsWith('mailto:'))assert.equal(href,'mailto:drew@drewcleaver.com');
      if(href.includes('calendly.com'))assert.equal(href,'https://calendly.com/drewcleaver');
      if(href.startsWith('/')&&!href.startsWith('//')){
        const u=new URL(href,'https://drewcleaver.com');const path='dist'+u.pathname;
        assert(existsSync(path)||existsSync(path+'/index.html'),href);
      }
    }
  }
  const card=readFileSync('dist/drew-cleaver.vcf','utf8');
  for(const field of ['VERSION:4.0','BDAY:--0717','EMAIL;PREF=1:drew@drewcleaver.com',';;;Austin;Texas;;USA','https://calendly.com/drewcleaver','https://github.com/drewcleaver17'])assert(card.includes(field));
  assert(!/TEL|Resume|résumé/i.test(card));assert(!/(?<!\r)\n/.test(card));assert(card.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
  assert(readFileSync('dist/Drew-Cleaver-Resume.pdf').subarray(0,5).equals(Buffer.from('%PDF-')));
});

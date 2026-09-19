import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,readFileSync as read,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {encodeDraft,decodeDraft,renderSite,extractResume} from '../src/lib/site-preview.ts';
import {kitFiles,staticFiles} from '../starter/core.mjs';
const root=new URL('../starter/',import.meta.url);
const css=readFileSync(new URL('styles.css',root),'utf8');
const sample=JSON.parse(readFileSync(new URL('site.json',root),'utf8'));
test('old v1 snapshot links preserve UTF-8 and render safely',()=>{
 const v1={...sample,version:1};delete v1.credit;
 assert.deepEqual(decodeDraft(encodeDraft(v1)),v1);assert(renderSite(v1,true).includes('Alex Rivera'));
 assert.throws(()=>decodeDraft('not!base64'));
});
test('resume matching leaves contact details and private answers out of initial public fields',()=>{
 const s=extractResume('Test Person\nCommunity organizer\nprivate@example.com\nSummary\nI build useful tools.\n555-555-1212\nExperience\nWorkshop coordinator\nEducation\nExample University','Test Person');
 assert.deepEqual(s,{headline:'Community organizer',bio:'I build useful tools.',experience:'Workshop coordinator'});
 assert.deepEqual(extractResume('','Test Person'),{headline:'',bio:'',experience:''});
});
test('a complete exported kit regenerates exactly with no dependencies',()=>{
 const names=['core.mjs','generate.mjs','LICENSE','README.md','DEPLOY.md','CUSTOMIZE_WITH_AI.md','CONTRIBUTING.md','CHANGELOG.md','package.json','core.test.mjs','.gitignore','.github/workflows/pages.yml'];
 const sources=Object.fromEntries(names.map(n=>[n,readFileSync(new URL(n,root),'utf8')]));
 const kit=kitFiles(sample,css,sources),dir=mkdtempSync(join(tmpdir(),'buildmine-kit-'));
 try {
  for(const [path,content] of Object.entries(kit)){mkdirSync(dirname(join(dir,path)),{recursive:true});writeFileSync(join(dir,path),content);}
  execFileSync(process.execPath,['generate.mjs'],{cwd:dir});
  for(const [path,content] of Object.entries(staticFiles(sample,css))) assert.equal(read(join(dir,'site',path),'utf8'),content);
  const env={...process.env}; delete env.NODE_TEST_CONTEXT;
  execFileSync(process.execPath,['--test','core.test.mjs'],{cwd:dir,env});
 }finally{rmSync(dir,{recursive:true,force:true});}
});

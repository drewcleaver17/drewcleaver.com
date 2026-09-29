import fs from 'node:fs';import path from 'node:path';import {build} from 'esbuild';import {JSDOM} from 'jsdom';
const dest=process.argv[2];if(!dest||!path.isAbsolute(dest))throw Error('Supply absolute output path');
const dom=new JSDOM(fs.readFileSync('dist/dpc/index.html','utf8')),doc=dom.window.document;
let css=[...doc.querySelectorAll('style')].map(n=>n.textContent).join('\n');for(const n of doc.querySelectorAll('link[rel="stylesheet"]'))css+=fs.readFileSync('dist'+n.getAttribute('href'),'utf8');
const article=doc.querySelector('article');article.querySelectorAll('script').forEach(n=>n.remove());
const pdf=fs.readFileSync('public/dpc-deck.pdf').toString('base64');for(const a of article.querySelectorAll('a[href]')){const href=a.getAttribute('href');if(/^\/(dpc|metsicare)-deck.pdf/.test(href))a.href='data:application/pdf;base64,'+pdf;else if(href.startsWith('/'))a.href='https://drewcleaver.com'+href;}
const bundle=await build({stdin:{contents:"import {initializeDpcWorksheet} from './src/scripts/dpc-calculator.js';initializeDpcWorksheet();",resolveDir:process.cwd()},bundle:true,write:false,format:'iife',minify:true});
fs.writeFileSync(dest,'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DPC R09 — interactive reference</title><style>'+css+'</style></head><body>'+article.outerHTML+'<script>'+bundle.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script></body></html>');console.log(dest);

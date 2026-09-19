import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {staticFiles} from './core.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const site=JSON.parse(await readFile(join(root,'site.json'),'utf8'));
const css=await readFile(join(root,'styles.css'),'utf8');
// Validate and render first. Never delete the old build after a validation error.
const files=staticFiles(site,css);
await rm(join(root,'site'),{recursive:true,force:true});
for(const [path,content] of Object.entries(files)) {const dest=join(root,'site',path);await mkdir(dirname(dest),{recursive:true});await writeFile(dest,content);}
console.log('Built site/. Publish only that folder. Your source files remain here.');

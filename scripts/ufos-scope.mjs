import { execFileSync } from 'node:child_process';
import { assertPermittedPaths } from './ufos-update.mjs';
const { BASE_SHA, HEAD_SHA } = process.env;
if (![BASE_SHA, HEAD_SHA].every(s => /^[a-f0-9]{40}$/.test(s || ''))) throw new Error('Explicit commit SHAs required');
const files=execFileSync('git',['diff','--name-only',BASE_SHA,HEAD_SHA],{encoding:'utf8'}).trim().split('\n');
assertPermittedPaths(files);
console.log('Automatic update file scope valid.');

import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const issues=JSON.parse(readFileSync(new URL('../src/data/45north-survey.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../dist/45north/index.html',import.meta.url),'utf8');
const {window}=new JSDOM(html);
try {
  const doc=window.document;
  const list=doc.querySelector('#issue-list');
  assert.ok(list, 'The priority list belongs on the landing page.');
  assert.equal(list.closest('details,[hidden],noscript,template'),null);
  const rows=Array.from(list.querySelectorAll('article[data-id]'));
  const ids=rows.map(row=>Number(row.dataset.id)).sort((a,b)=>a-b);
  assert.deepEqual(ids,issues.map(issue=>issue.id).sort((a,b)=>a-b));
  const scoreLabels=Array.from({length:10},(_,i)=>String(i+1));
  for(const row of rows) {
    const issue=issues.find(issue=>issue.id===Number(row.dataset.id));
    assert.equal(row.id,'idea-'+String(issue.id).padStart(3,'0'));
    assert.ok(row.textContent.includes(issue.title),'A proposal needs its public title.');
    assert.ok(row.textContent.includes(issue.action),'Every rating must be accompanied by its exact proposal.');
    const choices=Array.from(row.querySelectorAll('fieldset[data-role="scale"] button[data-score]'));
    assert.deepEqual(choices.map(b=>b.dataset.score),scoreLabels);
    for(const choice of choices) {
      assert.equal(choice.type,'button');
      assert.equal(choice.closest('details,[hidden],noscript,template'),null,'Scoring must not require opening another UI.');
      assert.notEqual(choice.getAttribute('aria-pressed'),'true','Do not preselect a public score.');
    }
  }
  assert.ok(doc.querySelector('#search') && doc.querySelector('#show-results'));
  assert.equal(doc.querySelector('[role=tablist]'),null);
  console.info('45 North landing: all 45 frozen proposals and 450 directly exposed rating controls verified.');
} finally {
  window.close();
}

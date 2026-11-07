import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {makeGroups} from '../public/45north/assets/groups.mjs';

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
  const sections = Array.from(list.querySelectorAll('[data-group-rows]'));
  const groups = makeGroups(issues, ids);
  assert.equal(sections.length, 9, 'All nine categories must be on the landing page.');
  for (const group of groups) {
    const container = sections.find(section => {
      const members = [...section.querySelectorAll('article[data-id]')].map(row => Number(row.dataset.id));
      return members.length === 5 && group.ids.every(id => members.includes(id));
    });
    assert.ok(container, 'Missing complete category: ' + group.label);
    const section = container.closest('section');
    assert.ok(section, 'Each category needs a semantic section.');
    assert.ok([...section.querySelectorAll('h2,h3')].some(title => title.textContent.trim() === group.label),
      'Each category needs its visible title.');
    const editor = section.querySelector('[data-group-editor]');
    assert.ok(editor, 'Every complete group needs a priority-order editor.');
    assert.equal(editor.closest('details,[hidden],noscript,template'), null, 'Order these five on the landing page.');
  }
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
  console.info('45 North landing: nine groups of five, nine inline order editors and all 450 issue rating controls verified.');
} finally {
  window.close();
}

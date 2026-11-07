import assert from 'node:assert/strict';
import test from 'node:test';
import { GROUPS, makeGroups } from '../public/45north/assets/groups.mjs';

const ids = Array.from({ length: 45 }, (_, index) => index + 1);
const catalog = ids.map(id => ({ id, title: 'Existing proposal ' + id }));
const byGroup = list => new Map(list.map(group => [group.id, group]));
const allocated = list => list.flatMap(group => group.ids).sort((a, b) => a - b);

test('nine editorial comparison sets cover each of the 45 permanent launch IDs exactly once', () => {
  assert.equal(GROUPS.length, 9);
  assert.equal(new Set(GROUPS.map(group => group.id)).size, 9);
  assert.equal(new Set(GROUPS.map(group => group.label)).size, 9);
  assert.deepEqual(allocated(GROUPS), ids);
  const actual = makeGroups(catalog, ids);
  assert.deepEqual(actual.map(({id, label, ids}) => ({id, label, ids})), GROUPS);
  for (const group of actual) {
    assert.equal(group.ids.length, 5);
    assert.deepEqual(group.ids, [...group.ids].sort((a, b) => a - b));
    assert.equal(group.key, 'order-v1:' + group.id + ':' + group.ids.join('.'));
  }
  assert.deepEqual(makeGroups([...catalog].reverse(), [...ids].reverse()), actual);
  assert.deepEqual(makeGroups(catalog), actual);
});

test('new qualifiers fill topical openings while unrelated contests keep their keys', () => {
  // Both new issues share a broad topic in the source. Their wording separates the rental and utility contests.
  const extra = [
    { id: 46, topic: 'Housing', title: 'Lower security deposits for renters', action: 'Tenants would pay deposits in installments.' },
    { id: 47, topic: 'Housing', title: 'Insulation for homes with high utility bills', action: 'A county could pay for weatherization.' },
  ];
  const members = ids.filter(id => id !== 8 && id !== 20).concat(47, 46);
  const roster = byGroup(makeGroups(catalog.concat(extra), members));
  const before = byGroup(makeGroups(catalog, ids));
  assert.deepEqual(roster.get('renting').ids, [10, 19, 24, 35, 46]);
  assert.deepEqual(roster.get('homes').ids, [3, 31, 40, 43, 47]);
  assert.notEqual(roster.get('renting').key, before.get('renting').key);
  assert.notEqual(roster.get('homes').key, before.get('homes').key);
  for (const group of GROUPS.filter(g => g.id !== 'renting' && g.id !== 'homes')) {
    assert.equal(roster.get(group.id).key, before.get(group.id).key);
  }
  assert.deepEqual(allocated([...roster.values()]), members.sort((a, b) => a - b));
  assert.deepEqual(byGroup(makeGroups(catalog.concat(extra).reverse(), members.reverse())), roster);
  assert.deepEqual(makeGroups(catalog.concat(extra), ids), makeGroups(catalog, ids));
});

test('removed, archived and duplicate IDs cannot occupy a place or enter an order key', () => {
  const live = catalog.filter(idea => idea.id !== 2).map(idea => idea.id === 16 ? {...idea, active: false} : idea);
  const groups = makeGroups(live, [2, 16, 21, 21, 28, 999, 12]);
  assert.deepEqual(groups, [{
    id: 'caregiving', label: 'Family caregiving', ids: [12, 21, 28], key: 'order-v1:caregiving:12.21.28'
  }]);
  assert.deepEqual(makeGroups(catalog, []), []);
  assert.deepEqual(makeGroups([], ids), []);
});

test('each qualifying issue can appear once even if the complete 45 change', () => {
  const newCatalog = ids.map(id => ({ id: id + 45, title: 'A proposal under review' }));
  const selected = newCatalog.map(idea => idea.id);
  const roster = makeGroups(newCatalog, selected);
  assert.equal(roster.length, 9);
  assert.ok(roster.every(group => group.ids.length === 5));
  assert.deepEqual(allocated(roster), selected);
  assert.deepEqual(makeGroups(newCatalog.reverse(), selected.reverse()), roster);
  assert.deepEqual(allocated(GROUPS), ids);
});

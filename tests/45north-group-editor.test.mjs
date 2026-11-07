import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createGroupOrders} from '../public/45north/assets/group-order.mjs';

const group = {id: 'health', label: 'Health', ids: [4, 8, 12, 16, 20], key: 'order-v1:health:4.8.12.16.20'};
const blind = [16, 8, 20, 4, 12];
const ranking = [20, 4, 16, 12, 8];
const now = Date.UTC(2026, 10, 6, 13);
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

function report(order = null, when = now) {
  return {
    asOf: when, version: 'group-order-v1',
    groups: [{...group, n: order ? 1 : 0, items: blind.map(id => ({
      id, counts: Array.from({length: 5}, (_, pos) => Number(order?.[pos] === id)),
      meanRank: order ? order.indexOf(id) + 1 : null
    }))}]
  };
}

function setup(t, handler, onStale = () => {}) {
  const dom = new JSDOM('<div id="mount"></div><div id="exports"></div>', {pretendToBeVisual: true});
  const doc = dom.window.document;
  const mount = doc.querySelector('#mount'), exports = doc.querySelector('#exports');
  const calls = [];
  const request = async (path, options) => {
    const body = options?.body === undefined ? null : JSON.parse(options.body);
    calls.push({path, options, body});
    return handler(path, body, options);
  };
  const controller = createGroupOrders({request, onStale});
  t.after(() => {controller.destroy(); dom.window.close();});
  const sync = (g = group, orderedIds = blind, flags = {ready: true, available: true}) => controller.sync(
    [{group: g, mount, ideas: orderedIds.map(id => ({id, title: 'Issue ' + id}))}], flags);
  const pick = id => mount.querySelector('[data-order-pick="' + id + '"]');
  const button = (action, id) => (id ? mount.querySelector('[data-order-item="' + id + '"]') : mount)
    .querySelector('[data-order-action="' + action + '"]');
  const order = () => Array.from(mount.querySelectorAll('[data-order-pick]')).filter(n => n.dataset.position)
    .sort((a, b) => Number(a.dataset.position) - Number(b.dataset.position)).map(b => Number(b.dataset.orderPick));
  return {doc, controller, mount, exports, calls, sync, pick, button, order};
}

test('only deliberate complete within-group choices save, with undo, numbered review, edit and withdrawal', async t => {
  let saved = null;
  const h = setup(t, (path, body) => {
    if (path === '/survey/my-group-orders') return Response.json({orders: [], asOf: now});
    assert.equal(path, '/survey/group-order');
    assert.equal(body.key, group.key);
    assert.match(body.operation, /^[0-9a-f]{32}$/);
    assert.ok(Math.abs(body.issuedAt - now) < 3000);
    saved = body.order;
    return Response.json({key: group.key, order: saved, asOf: now, expiresAt: saved ? now + 86400000 : null});
  });
  h.sync();
  await settle();
  assert.deepEqual(h.calls.map(c => c.path), ['/survey/my-group-orders']);
  assert.deepEqual(h.order(), []);
  assert.equal(h.mount.querySelector('[data-order-results]').hidden, true);
  assert.equal(h.button('save').disabled, true);
  assert.deepEqual(Array.from(h.mount.querySelectorAll('[data-order-pick]'), n => Number(n.dataset.orderPick)), blind);
  h.pick(8).click(); h.pick(16).click(); h.button('undo').click(); h.button('clear').click();
  assert.deepEqual(h.order(), []);
  for (const id of ranking.slice(0, 4)) h.pick(id).click();
  h.button('save').click();
  assert.equal(h.calls.length, 1);
  h.pick(ranking[4]).click();
  assert.equal(h.pick(20).querySelector('.go-position').textContent, '1st');
  assert.equal(h.button('save').disabled, false);
  assert.equal(h.calls.length, 1);
  h.button('save').click(); await settle();
  assert.deepEqual(saved, ranking);
  assert.equal(h.mount.querySelector('.group-order').dataset.orderSaved, 'true');
  assert.equal(h.button('edit').hidden, false);
  h.button('edit').click();
  h.button('up', 4).click();
  assert.deepEqual(h.order(), [4,20,16,12,8]);
  h.button('cancel').click();
  assert.deepEqual(h.order(), ranking);
  h.button('edit').click(); h.button('down', 20).click(); h.button('save').click(); await settle();
  assert.deepEqual(saved,[4,20,16,12,8]);
  h.button('remove').click(); await settle();
  assert.deepEqual(h.order(), []);
  assert.equal(saved, null);
  assert.equal(h.calls.filter(c => c.path === '/survey/group-order').length, 3);
  assert.match(h.mount.querySelector('[data-order-status]').textContent, /removed/i);
});

test('restore an exact private order, keep an in-progress edit, and discard it when the five members change', async t => {
  const h = setup(t, () => Response.json({asOf: now, orders: [{key: group.key, order: ranking, expiresAt: now + 86400000}]}));
  h.controller.setActive(false); h.sync(); await settle();
  assert.equal(h.calls.length, 0);
  h.controller.setActive(true); await settle();
  assert.deepEqual(h.order(), ranking);
  h.button('edit').click(); h.button('clear').click(); h.pick(4).click(); h.sync(); await settle();
  assert.deepEqual(h.order(), [4]);
  const revised = {...group, ids: [4,8,12,16,30], key: 'order-v1:health:4.8.12.16.30'};
  h.sync(revised, [30,4,8,12,16]); await settle();
  assert.deepEqual(h.order(), []);
  assert.match(h.mount.querySelector('[data-order-status]').textContent, /group changed/i);
  assert.equal(h.pick(20), null);
  const short = {...group, ids:[4,8,12,16], key:'order-v1:health:4.8.12.16'};
  h.sync(short, short.ids);
  assert.equal(h.mount.querySelector('[data-order-pick]'), null);
  assert.match(h.mount.textContent, /five issues/i);
});

test('a lost save retains the exact operation and issuance, and the retry shows the authoritative newer answer', async t => {
  let writes = 0;
  const h = setup(t, (path, body) => {
    if (path === '/survey/my-group-orders') return Response.json({asOf: now, orders: []});
    assert.equal(path, '/survey/group-order');
    if (++writes === 1) throw Error('lost acknowledgement');
    return Response.json({key: body.key, order: [...ranking].reverse(), asOf: now + 500, expiresAt: now + 86400000});
  });
  h.sync(); await settle();
  ranking.forEach(id => h.pick(id).click()); h.button('save').click(); await settle();
  assert.equal(h.button('retry').hidden, false);
  assert.match(h.mount.querySelector('[data-order-status]').textContent, /could not be confirmed/i);
  assert.equal(h.button('save').disabled, true);
  h.button('retry').click(); await settle();
  const attempts = h.calls.filter(c => c.path === '/survey/group-order');
  assert.deepEqual(attempts[0].body, attempts[1].body);
  assert.deepEqual(h.order(), [...ranking].reverse());
  assert.match(h.mount.querySelector('[data-order-status]').textContent, /current order/i);
});

test('public comparisons and the aggregate CSV require disclosure; restored private data reveals no aggregate', async t => {
  const h = setup(t, path => {
    if (path === '/survey/my-group-orders') return Response.json({asOf: now, orders: []});
    if (path === '/survey/group-export.csv') return new Response('rank_1,rank_2', {headers: {'content-type':'text/csv'}});
    assert.equal(path, '/survey/group-results');
    return Response.json(report(ranking), {headers:{etag:'"order1"'}});
  });
  h.sync(); await settle();
  assert.equal(h.calls.some(c => c.path === '/survey/group-results'), false);
  h.controller.setResults(true, h.exports); await settle();
  const stats = h.mount.querySelector('[data-order-results]');
  assert.equal(stats.hidden,false);
  assert.equal(stats.querySelector('[data-order-count]').dataset.orderCount, '1');
  assert.equal(stats.querySelector('[data-order-result-id="20"] [data-first-picks]').dataset.firstPicks, '1');
  assert.equal(stats.querySelector('[data-order-result-id="4"] [data-first-picks]').dataset.firstPicks, '0');
  const click = h.doc.defaultView.HTMLAnchorElement.prototype.click;
  h.doc.defaultView.HTMLAnchorElement.prototype.click = () => {};
  t.after(() => { h.doc.defaultView.HTMLAnchorElement.prototype.click = click; });
  h.exports.querySelector('[data-order-action=export]').click(); await settle();
  assert.ok(h.exports.querySelector('a[download]'));
  h.controller.setResults(false, h.exports);
  assert.equal(stats.hidden,true); assert.equal(stats.textContent,'');
  assert.equal(h.exports.hidden,true);
  assert.deepEqual(h.calls.map(x => x.path), ['/survey/my-group-orders','/survey/group-results','/survey/group-export.csv']);
  assert.deepEqual(h.order(),[]);
});

test('a roster conflict never confirms a stale order and asks the page to refresh membership', async t => {
  let stale = 0;
  const h = setup(t, path => path === '/survey/my-group-orders' ? Response.json({asOf: now, orders: []}) :
    Response.json({error: 'This group changed. Reload its five issues before saving your order.'}, {status: 409}), () => {stale++;});
  h.sync(); await settle(); ranking.forEach(id => h.pick(id).click()); h.button('save').click(); await settle();
  assert.equal(stale, 1); assert.equal(h.button('save').disabled, true);
  assert.match(h.mount.querySelector('[data-order-status]').textContent,/changed/i);
  assert.equal(h.mount.querySelector('.group-order').dataset.orderSaved, 'false');
});

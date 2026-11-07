// The previous landing and the grouped landing share the same absolute-rating, search and receipt behavior.
import { startList } from './list-controller.mjs';
import { makeGroups } from './groups.mjs';

function shuffle(nodes) {
  for (let i = nodes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
  }
  return nodes;
}

const root = document.querySelector('[data-north]');
if (root) {
  const list = root.querySelector('#issue-list');
  if (!list.dataset.shuffled) {
    const boundary = list.querySelector('#other-group');
    for (const section of shuffle(Array.from(list.querySelectorAll('[data-group-id]')))) {
      const holder = section.querySelector('[data-group-rows]');
      holder.append(...shuffle(Array.from(holder.children)));
      list.insertBefore(section, boundary);
    }
    list.dataset.shuffled = 'true';
  }
  startList(root, groupedLayout);
}

// Move existing nodes only when necessary, preserving form text, disclosures and live receipts.
function arrange(holder, nodes, preserveOrder) {
  if (preserveOrder) {
    for (const row of nodes) {
      if (row.parentElement !== holder) holder.append(row);
    }
    return;
  }
  let next = holder.firstElementChild;
  for (const row of nodes) {
    if (row !== next) holder.insertBefore(row, next);
    next = row.nextElementSibling;
  }
}

function groupedLayout({root, list, rows, order, request, onStale}) {
  const sections = new Map(Array.from(list.querySelectorAll('[data-group-id]'), section => [
    section.dataset.groupId,
    {
      section,
      holder: section.querySelector('[data-group-rows]'),
      mount: section.querySelector('[data-group-editor]'),
      jumpLink: section.querySelector('[data-order-jump]')
    }
  ]));
  const other = list.querySelector('#other-group');
  const otherRows = other.querySelector('[data-other-rows]');
  const projection = list.querySelector('#matching-issues');
  const projectionRows = projection.querySelector('[data-matching-rows]');
  const projectionHeading = projection.querySelector('h2');
  const exports = root.querySelector('#group-results-tools');
  const search = root.querySelector('#search');
  const topicJump = root.querySelector('#topic-jump');
  topicJump.disabled = false;
  let topicFor = new Map(), records = new Map(), searchCatalog = [];
  let groups = [], editor, active = !location.hash.startsWith('#status-');
  let resultsShown = false, available = Boolean(request), verified = false;

  function syncEditors() {
    if (!editor) return;
    const byGroup = new Map(groups.map(group => [group.id, group]));
    const mounts = [];
    for (const [id, section] of sections) {
      const group = byGroup.get(id);
      if (!group) continue;
      // Keep the option list stable even when the reader explicitly sorts issue results.
      const ideas = order.filter(ideaId => topicFor.get(ideaId)?.id === id).map(ideaId => records.get(ideaId));
      mounts.push({group, mount:section.mount, ideas});
    }
    editor.sync(mounts, {ready:verified, available});
  }

  // An unavailable comparison editor must never disable the independent issue-rating controls.
  import('./group-order.mjs').then(({createGroupOrders}) => {
    editor = createGroupOrders({request, onStale});
    editor.setActive(active);
    syncEditors();
    editor.setResults(resultsShown, exports);
  }).catch(() => {
    for (const {mount} of sections.values()) {
      const note = document.createElement('p');
      note.textContent = 'Group ordering could not load. Reload to try again.';
      mount.replaceChildren(note);
    }
  });

  function setCatalog(ideas, shortlist, supplied) {
    records = new Map(ideas.map(idea => [idea.id, idea]));
    groups = makeGroups(ideas, shortlist);
    const received = new Map((Array.isArray(supplied) ? supplied : []).map(group => [group.id, group]));
    verified = Array.isArray(supplied) && received.size === groups.length && groups.every(group => {
      const source = received.get(group.id);
      return source?.key === group.key && Array.isArray(source.ids) &&
        source.ids.length === group.ids.length && source.ids.every((n, i) => n === group.ids[i]);
    });
    topicFor = new Map(groups.flatMap(group => group.ids.map(id => [id, group])));
    searchCatalog = ideas.map(idea => {
      const group = topicFor.get(idea.id);
      return group ? {...idea, aliases:[...(idea.aliases || []), group.label]} : idea;
    });
    const present = new Set(groups.map(group => group.id));
    for (const option of topicJump.options) {
      if (option.value) option.disabled = !present.has(option.value);
    }
    for (const group of groups) {
      const section = sections.get(group.id);
      if (section) section.jumpLink.hidden = group.ids.length !== 5;
    }
    syncEditors();
  }

  function render({eligible, found, query, compare, protect}) {
    const flat = Boolean(query || compare);
    for (const [id, row] of rows) row.hidden = !eligible.has(id);
    const knownOrder = order.filter(id => rows.has(id));
    for (const [id, section] of sections) {
      const members = knownOrder.filter(ideaId => topicFor.get(ideaId)?.id === id);
      const grouped = flat ? members.filter(ideaId => !eligible.has(ideaId)) : members;
      arrange(section.holder, grouped.map(ideaId => rows.get(ideaId)), protect);
      section.section.hidden = flat || !members.some(ideaId => eligible.has(ideaId));
    }
    const extra = knownOrder.filter(id => !topicFor.has(id));
    const otherIds = flat ? extra.filter(id => !eligible.has(id)) : extra;
    arrange(otherRows, otherIds.map(id => rows.get(id)), protect);
    other.hidden = flat || !extra.some(id => eligible.has(id));
    projection.hidden = !flat;
    if (flat) {
      const selected = (compare ? [...knownOrder].sort(compare) : found.map(idea => idea.id))
        .filter(id => eligible.has(id) && rows.has(id));
      arrange(projectionRows, selected.map(id => rows.get(id)), protect);
      projectionHeading.textContent = query ? 'Matching issues' : 'Issues in results order';
    }
  }

  // The projection is only for a requested search or global results sort. Restore the original groups in place.
  function restoreGroups() {
    const sort = root.querySelector('[data-results-sort]');
    if (sort && sort.value !== 'original') {
      sort.value = 'original';
      sort.dispatchEvent(new Event('change'));
    }
    if (search.value) {
      search.value = '';
      search.dispatchEvent(new Event('input'));
    }
  }

  projection.querySelector('[data-back-to-groups]').addEventListener('click', () => {
    restoreGroups();
    const heading = list.querySelector('[data-group-id]:not([hidden]) [data-group-title]');
    heading?.focus({preventScroll:true});
    heading?.scrollIntoView({block:'start'});
  });

  topicJump.addEventListener('change', () => {
    const id = topicJump.value;
    if (!id) return;
    topicJump.value = '';
    restoreGroups();
    const hash = '#group-' + id;
    if (location.hash === hash) jump(hash);
    else location.hash = hash;
  });

  function jump(hash) {
    const match = hash.match(/^#(group|order)-([a-z][a-z0-9-]*)$/);
    if (!match) return false;
    const section = sections.get(match[2]);
    if (!section || section.section.hidden) return false;
    requestAnimationFrame(() => {
      if (match[1] === 'group') {
        const heading = section.section.querySelector('[data-group-title]');
        heading.focus({preventScroll:true});
        heading.scrollIntoView({block:'start'});
        return;
      }
      const control = [...section.mount.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled)')]
        .find(node => !node.closest('[hidden]') && node.getClientRects().length);
      (control || section.mount).focus({preventScroll:true});
      section.mount.scrollIntoView({block:'start'});
    });
    return true;
  }

  return {
    setCatalog, render, jump,
    searchItems: () => searchCatalog,
    setAvailable(value) { if (value !== available) { available = value; syncEditors(); } },
    setActive(value) { active = value; editor?.setActive(value); },
    setResults(value) {
      resultsShown = value;
      exports.hidden = !value;
      editor?.setResults(value, exports);
    }
  };
}

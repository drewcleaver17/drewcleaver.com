const form = document.querySelector<HTMLFormElement>('#library-controls');
const grid = document.querySelector<HTMLElement>('#video-grid');
if (form && grid) {
  const search = document.querySelector<HTMLInputElement>('#video-search')!;
  const length = document.querySelector<HTMLSelectElement>('#video-length')!;
  const sort = document.querySelector<HTMLSelectElement>('#video-sort')!;
  const topicSelect = document.querySelector<HTMLSelectElement>('#video-topic')!;
  const count = document.querySelector<HTMLElement>('#video-count')!;
  const clear = document.querySelector<HTMLButtonElement>('#clear-filters')!;
  const empty = document.querySelector<HTMLElement>('#no-results')!;
  const topicButtons = [...form.querySelectorAll<HTMLButtonElement>('[data-topic]')];
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-video-id]')];
  const normalize = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const records = cards.map(card => ({
    card,
    search: normalize(card.dataset.search || ''),
    topics: JSON.parse(card.dataset.topics || '[]') as string[],
    duration: card.dataset.duration ? Number(card.dataset.duration) : null,
  }));
  let topic = '';
  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());

  function update() {
    const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    records.forEach(record => {
      const seconds = record.duration;
      const matchesLength = length.value === 'all' || (seconds !== null && (
        (length.value === 'short' && seconds < 600) ||
        (length.value === 'medium' && seconds >= 600 && seconds < 1800) ||
        (length.value === 'long' && seconds >= 1800)
      ));
      record.card.hidden = !(terms.every(term => record.search.includes(term)) && (!topic || record.topics.includes(topic)) && matchesLength);
      if (!record.card.hidden) visible++;
    });
    [...records].sort((a, b) => {
      if (sort.value === 'title') return (a.card.dataset.title || '').localeCompare(b.card.dataset.title || '');
      if (sort.value === 'recent') return (b.card.dataset.added || '').localeCompare(a.card.dataset.added || '');
      if (sort.value === 'shortest') return (a.duration ?? Infinity) - (b.duration ?? Infinity);
      return Number(a.card.dataset.order) - Number(b.card.dataset.order);
    }).forEach(({ card }) => grid!.append(card));
    count.textContent = `${visible} of ${cards.length} ${cards.length === 1 ? 'video' : 'videos'}`;
    empty.hidden = visible > 0 || cards.length === 0;
    clear.hidden = !search.value && !topic && length.value === 'all' && sort.value === 'curated';
    topicButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === topic)));
    topicSelect.value = topic;
  }

  function reset() {
    search.value = '';
    topic = '';
    length.value = 'all';
    sort.value = 'curated';
    update();
    search.focus();
  }
  search.addEventListener('input', update);
  length.addEventListener('change', update);
  sort.addEventListener('change', update);
  topicSelect.addEventListener('change', () => { topic = topicSelect.value; update(); });
  topicButtons.forEach(button => button.addEventListener('click', () => { topic = button.dataset.topic || ''; update(); }));
  clear.addEventListener('click', reset);
  document.querySelector('#reset-search')?.addEventListener('click', reset);

  const dialog = document.querySelector<HTMLDialogElement>('#video-dialog')!;
  const mount = document.querySelector<HTMLElement>('#player-mount')!;
  const playerTitle = document.querySelector<HTMLElement>('#player-title')!;
  const youtube = document.querySelector<HTMLAnchorElement>('#player-youtube')!;
  let opener: HTMLButtonElement | null = null;
  let priorOverflow = '';

  if (typeof dialog.showModal === 'function') {
    document.querySelectorAll<HTMLButtonElement>('[data-watch]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        const id = button.dataset.watch!;
        if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
        const title = button.closest<HTMLElement>('[data-video-id]')?.dataset.title || 'Video';
        opener = button;
        playerTitle.textContent = title;
        youtube.href = `https://www.youtube.com/watch?v=${id}`;
        const frame = document.createElement('iframe');
        const source = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
        source.searchParams.set('playsinline', '1');
        source.searchParams.set('origin', location.origin);
        frame.src = source.href;
        frame.title = title;
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        mount.replaceChildren(frame);
        priorOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        document.querySelector<HTMLButtonElement>('#close-player')!.focus();
      });
    });
    document.querySelector('#close-player')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      mount.replaceChildren();
      document.body.style.overflow = priorOverflow;
      opener?.focus();
    });
  }
}

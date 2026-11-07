// A Fisher–Yates draw performed one item at a time also accommodates newly published issues.
export class IssueVisit {
  constructor(random = Math.random) {
    this.random = random;
    this.shown = new Set();
    this.trail = [];
    this.position = -1;
  }

  get current() { return this.trail[this.position] ?? null; }

  enter(id) {
    if (this.current !== id) {
      this.trail.splice(this.position + 1);
      this.trail.push(id);
      this.position++;
    }
    this.shown.add(id);
    return id;
  }

  draw(ids) {
    const active = new Set(ids);
    while (this.position + 1 < this.trail.length) {
      const next = this.trail[++this.position];
      if (active.has(next)) return next;
    }
    const remaining = ids.filter(id => !this.shown.has(id));
    return remaining.length ? this.enter(remaining[Math.floor(this.random() * remaining.length)]) : null;
  }

  back(active) {
    for (let i = this.position - 1; i >= 0; i--) {
      if (active.has(this.trail[i])) {
        this.position = i;
        return this.current;
      }
    }
    return null;
  }

  canGoBack(active) {
    return this.trail.slice(0, this.position).some(id => active.has(id));
  }
}

export function ratingMessage({outcome,score}) {
  if (outcome === 'removed') return 'Rating removed for this connection.';
  if (outcome === 'empty') return 'This connection has no active rating for this issue.';
  if (outcome === 'unchanged') return score + ' out of 10 was already counted for this connection.';
  if (outcome === 'changed') return 'Rating changed to ' + score + ' out of 10.';
  return 'Rating saved: ' + score + ' out of 10.';
}

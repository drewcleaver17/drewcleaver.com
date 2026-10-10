const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
// Discard rather than truncate invalid values. Never attach query values to events.
export function readCampaign(search) {
  const params = new URLSearchParams(search);
  const campaign = {};
  for (const key of campaignKeys) {
    const value = params.get(key);
    if (value && value.length <= 80 && /^[a-zA-Z0-9_-]+$/.test(value)) campaign[key] = value;
  }
  return Object.freeze(campaign);
}
export function initFkl(doc, { development = false } = {}) {
  const win = doc.defaultView;
  const regionSelect = doc.querySelector('#fkl-region');
  if (!win || !regionSelect) return;
  const regions = JSON.parse(doc.querySelector('#fkl-regions').textContent);
  const campaign = readCampaign(win.location.search);
  const allowedEvents = new Set(['primary_cta_click', 'region_selection', 'official_booking_handoff', 'inquiry_form_start', 'demo_inquiry_completion']);
  const placements = new Set(['hero', 'closing']);
  const emit = (name, context = {}) => {
    if (!allowedEvents.has(name)) return;
    const properties = {};
    if (placements.has(context.placement)) properties.placement = context.placement;
    if (regions.some(r => r.id === context.region)) properties.region = context.region;
    // No age, experience, free text, contact details, campaign values, or URLs.
    doc.dispatchEvent(new win.CustomEvent('fkl:funnel', { detail: Object.freeze({ name, properties: Object.freeze(properties) }) }));
  };
  if (development) {
    const inspector = doc.createElement('details');
    inspector.id = 'fkl-event-inspector'; inspector.className = 'wrap';
    const summary = doc.createElement('summary'); summary.textContent = 'Development event inspector · no information is transmitted';
    const list = doc.createElement('ol'); inspector.append(summary, list); doc.body.append(inspector);
    doc.addEventListener('fkl:funnel', event => {
      const item = doc.createElement('li'); item.textContent = JSON.stringify(event.detail); list.append(item);
      if (list.children.length > 20) list.firstElementChild.remove();
    });
    // Campaign context is independently inspectable, contains validated tokens only.
    inspector.dataset.campaign = JSON.stringify(campaign);
  }
  doc.querySelectorAll('[data-primary]').forEach(link => link.addEventListener('click', () => emit('primary_cta_click', { placement: link.dataset.primary })));
  const result = doc.querySelector('#finder-result');
  regionSelect.addEventListener('change', () => {
    const region = regions.find(r => r.id === regionSelect.value);
    result.replaceChildren();
    if (!region) { const p = doc.createElement('p'); p.textContent = 'Select a region to see your official next step.'; result.append(p); return; }
    const heading = doc.createElement('h3'); heading.textContent = region.location;
    const info = doc.createElement('p'); info.textContent = region.detail;
    const link = doc.createElement('a');
    link.href = `https://fat-kartingleague.com/hubs${region.id === 'other' ? '' : '/' + region.id}`;
    link.className = 'button primary'; link.rel = 'noopener noreferrer';
    link.textContent = region.id === 'other' ? 'Explore official FKL hubs ↗' : `View ${region.label} sessions at FKL ↗`;
    const external = doc.createElement('p'); external.className = 'small'; external.textContent = 'Opens the official FKL website. Look for Testing & Coaching; confirm venue, price and eligibility there.';
    link.addEventListener('click', () => emit('official_booking_handoff', { region: region.id }));
    result.append(heading, info, link, external); emit('region_selection', { region: region.id });
  });
  const age = doc.querySelector('#finder-age');
  age.addEventListener('change', () => { doc.querySelector('#age-guidance').textContent = age.selectedIndex === 4 ? 'FKL serves ages 5–17. Contact FKL before booking if your child is outside this range or you are unsure. This finder does not confirm eligibility.' : 'Age guidance is advisory. FKL must confirm eligibility and kart fit.'; });
  const form = doc.querySelector('#fkl-inquiry');
  const fields = doc.querySelector('#demo-fields');
  const status = doc.querySelector('#form-status');
  fields.disabled = false;
  let started = false;
  form.addEventListener('input', () => { if (!started) { started = true; emit('inquiry_form_start'); } });
  form.addEventListener('change', () => { if (!started) { started = true; emit('inquiry_form_start'); } });
  const required = ['parent-name', 'parent-email', 'parent-location', 'parent-age'];
  const clearErrors = () => required.forEach(id => { const field = doc.getElementById(id); field.removeAttribute('aria-invalid'); field.removeAttribute('aria-describedby'); doc.getElementById(id + '-error').hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault(); clearErrors(); status.hidden = true;
    const invalid = [];
    for (const id of required) {
      const field = doc.getElementById(id);
      if (!field.value.trim() || !field.checkValidity()) {
        invalid.push(field); const error = doc.getElementById(id + '-error');
        error.textContent = id === 'parent-email' ? 'Enter a valid sample email address.' : id === 'parent-age' ? 'Choose an age band.' : 'Enter a sample value for this field.';
        error.hidden = false; field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', error.id);
      }
    }
    if (invalid.length) { invalid[0].focus(); return; }
    // Integration boundary: only a demonstration occurs. Do not serialize fields.
    form.reset(); clearErrors(); started = false;
    status.textContent = 'Demo complete. Your inquiry was demonstrated, not delivered. Sample details have been cleared. Nothing was sent or saved, and no follow-up is scheduled.';
    status.hidden = false; status.focus(); emit('demo_inquiry_completion');
  });
  win.addEventListener('pagehide', () => { form.reset(); clearErrors(); status.hidden = true; started = false; });
}

import { buildmineQuestions } from '../data/buildmine';
import { chooseTheme, draftFields, encodeDraft, extractResume, renderSite, safeBooking, safeEmail, type SiteDraft, type Theme } from '../lib/site-preview';
const form = document.querySelector<HTMLFormElement>('#buildmine-form');
if (form) {
  const el = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
  const editor = el<HTMLFormElement>('#site-editor');
  const resume = el<HTMLTextAreaElement>('#resume-text');
  const fileInput = el<HTMLInputElement>('#resume-file');
  const importButton = el<HTMLButtonElement>('#import-resume-button');
  const importStatus = el<HTMLElement>('#resume-import-status');
  const send = el<HTMLButtonElement>('#build-send');
  const download = el<HTMLButtonElement>('#build-download');
  const frame = el<HTMLIFrameElement>('#site-frame');
  const approved = el<HTMLInputElement>('#review-approved');
  let importing = false, generated = false, edited = false;
  const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value || '';
  const setStatus = (id: string, text: string, error = false) => { const status = el<HTMLElement>(id); status.textContent = text; status.hidden = false; status.classList.toggle('error', error); };
  const readDraft = (): SiteDraft => ({ version: 1, theme: (editor.elements.namedItem('theme') as RadioNodeList).value as Theme, ...Object.fromEntries(draftFields.map(key => [key, (editor.elements.namedItem(key) as HTMLInputElement).value])) } as SiteDraft);
  const briefText = () => [
    'BUILD MINE — WEBSITE BRIEF (v2)', `Name: ${value('name')}`, '',
    ...buildmineQuestions.flatMap((question, index) => [`${index + 1}. ${question.title}`, value(`answer_${question.id}`) || '(Skipped)', ...(question.id === 'aesthetic' ? [`Use Drew’s style: ${el<HTMLInputElement>('#drew-style').checked ? 'Yes' : 'No'}`] : []), '']),
    'RÉSUMÉ — PRIVATE BACKGROUND', resume.value, '',
    ...(generated ? ['EDITABLE WEBSITE DRAFT — REVIEW BEFORE SHARING', JSON.stringify(readDraft(), null, 2)] : []),
    '', 'This file has not been sent to Drew. No purchase or domain setup is authorized.',
  ].join('\n');
  let savedSnapshot = briefText();
  const saveFile = (content: string, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  send.hidden = false; download.hidden = false; el<HTMLElement>('#resume-import').hidden = false;
  download.addEventListener('click', () => { const text = briefText(); saveFile(text, 'my-website-brief.txt', 'text/plain;charset=utf-8'); savedSnapshot = text; el<HTMLElement>('#build-saving-note').textContent = 'Your brief was downloaded, including your résumé and any site edits. Keep it private. Save again after making changes.'; });
  fileInput.addEventListener('change', () => { importButton.hidden = !fileInput.files?.length; importStatus.textContent = fileInput.files?.length ? 'Read the selected file below. A successful import replaces the current résumé text.' : ''; });
  importButton.addEventListener('click', async () => {
    const file = fileInput.files?.[0]; if (!file || importing) return;
    importing = true; importButton.disabled = true; fileInput.disabled = true; send.disabled = true; resume.readOnly = true;
    importStatus.textContent = 'Reading your résumé on this device…';
    try { const { readResume } = await import('./resume-import'); resume.value = await readResume(file); resume.dispatchEvent(new Event('input', { bubbles: true })); importStatus.textContent = 'Text imported. Check the order and details below. Your original file has not been uploaded.'; }
    catch (error) { importStatus.textContent = error instanceof Error ? error.message : 'Please paste your résumé text instead.'; }
    finally { importing = false; importButton.disabled = false; fileInput.disabled = false; send.disabled = false; resume.readOnly = false; }
  });
  const refresh = () => { frame.srcdoc = renderSite(readDraft(), true); };
  const invalidateShare = () => { approved.checked = false; el<HTMLElement>('#share-output').hidden = true; el<HTMLInputElement>('#share-url').value = ''; el<HTMLAnchorElement>('#share-open').removeAttribute('href'); el<HTMLElement>('#editor-status').hidden = true; };
  form.addEventListener('submit', event => {
    event.preventDefault(); if (importing) return;
    for (const input of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]')) { input.setCustomValidity(input.value.trim() ? '' : 'Please fill in this field.'); input.addEventListener('input', () => input.setCustomValidity(''), { once: true }); }
    if (!form.reportValidity()) return;
    if (edited && !window.confirm('Creating a new draft replaces the edits below. Save your brief first if you want to keep them. Create a new draft?')) return;
    const source = extractResume(resume.value, value('name'));
    const draft: SiteDraft = { version: 1, name: value('name').trim(), ...source, highlights: '', email: '', booking: '', theme: chooseTheme(value('answer_aesthetic'), el<HTMLInputElement>('#drew-style').checked) };
    // Free-form answers are directions, not approved website copy. Keep them
    // out of the public schema; no private boundary/contact answers are copied.
    for (const key of draftFields) (editor.elements.namedItem(key) as HTMLInputElement).value = draft[key];
    (editor.querySelector(`input[name="theme"][value="${draft.theme}"]`) as HTMLInputElement).checked = true;
    generated = true; edited = false; invalidateShare(); refresh();
    el<HTMLElement>('#builder-result').hidden = false;
    setStatus('#build-status', 'Your starter is ready below. Review its text before sharing. Your résumé and answers have not been sent anywhere.');
    send.textContent = 'Create a new draft';
    el<HTMLElement>('#result-title').focus(); el<HTMLElement>('#builder-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  editor.addEventListener('submit', event => event.preventDefault());
  editor.addEventListener('input', event => {
    const target = event.target as HTMLInputElement;
    if (!draftFields.includes(target.name as typeof draftFields[number]) && target.name !== 'theme') return;
    target.setCustomValidity(''); edited = true; invalidateShare(); refresh();
  });
  el<HTMLSelectElement>('#preview-width').addEventListener('change', event => { frame.classList.toggle('phone-preview', (event.target as HTMLSelectElement).value === 'mobile'); });
  const reviewedDraft = () => {
    const draft = readDraft();
    const name = editor.elements.namedItem('name') as HTMLInputElement;
    name.setCustomValidity(draft.name.trim() ? '' : 'Add the name to show on your website.');
    (editor.elements.namedItem('booking') as HTMLInputElement).setCustomValidity(draft.booking && !safeBooking(draft.booking) ? 'Use a complete http or https scheduling link without sign-in credentials.' : '');
    (editor.elements.namedItem('email') as HTMLInputElement).setCustomValidity(draft.email && !safeEmail(draft.email) ? 'Use a valid email address.' : '');
    if (!editor.reportValidity()) return null;
    if (!approved.checked) { setStatus('#editor-status', 'Review the public fields, then check the approval box before sharing or downloading.', true); approved.focus(); return null; }
    return draft;
  };
  el<HTMLButtonElement>('#site-export').addEventListener('click', () => {
    const draft = reviewedDraft(); if (!draft) return;
    saveFile(renderSite(draft).replace('<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="index, follow">'), 'index.html', 'text/html;charset=utf-8');
    setStatus('#editor-status', 'Your website was downloaded as index.html. Open it to view the site, or upload it to static hosting. This did not publish it or save your private brief.');
  });
  el<HTMLButtonElement>('#site-share').addEventListener('click', () => {
    const draft = reviewedDraft(); if (!draft) return;
    try { const url = new URL('/preview/', window.location.origin); url.hash = encodeDraft(draft); el<HTMLInputElement>('#share-url').value = url.href; el<HTMLAnchorElement>('#share-open').href = url.href; el<HTMLElement>('#share-output').hidden = false; setStatus('#editor-status', 'Your snapshot link is ready. Only the public fields are included. Copy the entire link when sharing.'); }
    catch (error) { setStatus('#editor-status', error instanceof Error ? error.message : 'Could not create a link. Download your website instead.', true); }
  });
  el<HTMLButtonElement>('#share-copy').addEventListener('click', async () => {
    const input = el<HTMLInputElement>('#share-url');
    try { await navigator.clipboard.writeText(input.value); setStatus('#editor-status', 'Preview link copied.'); }
    catch { input.focus(); input.select(); setStatus('#editor-status', 'Select and copy the full link above. Automatic copying isn’t available in this browser.'); }
  });
  el<HTMLFieldSetElement>('#builder-inputs').disabled = false;
  window.addEventListener('beforeunload', event => { if (briefText() !== savedSnapshot) { event.preventDefault(); event.returnValue = ''; } });
}

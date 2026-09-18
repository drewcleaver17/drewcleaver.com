import { buildmineQuestions } from '../data/buildmine';

const form = document.querySelector<HTMLFormElement>('#buildmine-form');
if (form) {
  const field = <T extends HTMLElement>(selector: string) => form.querySelector<T>(selector)!;
  const status = field<HTMLParagraphElement>('#build-status');
  const send = field<HTMLButtonElement>('#build-send');
  const download = field<HTMLButtonElement>('#build-download');
  const style = field<HTMLInputElement>('#drew-style');
  const aesthetic = field<HTMLTextAreaElement>('#answer-aesthetic');
  const resume = field<HTMLTextAreaElement>('#resume-text');
  const fileInput = field<HTMLInputElement>('#resume-file');
  const importButton = field<HTMLButtonElement>('#import-resume-button');
  const importStatus = field<HTMLParagraphElement>('#resume-import-status');
  let importing = false;
  let pending = false;
  let lastSent = '';
  let cleanSnapshot = '';

  const setStatus = (message: string, error = false) => {
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle('error', error);
  };
  const updateStyle = () => {
    aesthetic.required = !style.checked;
    aesthetic.setCustomValidity(!style.checked && !aesthetic.value.trim() ? 'Describe your visual direction or choose Drew’s style.' : '');
  };
  style.addEventListener('change', updateStyle);
  aesthetic.addEventListener('input', updateStyle);
  updateStyle();

  const briefText = () => {
    // Read controls directly so exports remain complete while the form is
    // temporarily disabled during an in-flight request.
    const value = (key: string) => {
      const control = form.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!control || (control instanceof HTMLInputElement && control.type === 'checkbox' && !control.checked)) return '';
      return control.value;
    };
    return [
      'BUILD MINE — WEBSITE BRIEF (v1)',
      `Name: ${value('name')}`,
      `Reply email (private unless explicitly approved in answer 6): ${value('email')}`,
      '',
      ...buildmineQuestions.flatMap((question, index) => [
        `${index + 1}. ${question.title}`,
        ...(question.id === 'aesthetic' ? [`Use Drew’s visual style: ${style.checked ? 'Yes' : 'No'}`] : []),
        value(`answer_${question.id}`) || '(No additional direction)',
        ...(question.id === 'connection' ? [`Optional scheduling URL: ${value('booking_url') || '(None supplied)'}`] : []),
        '',
      ]),
      'RÉSUMÉ TEXT — BACKGROUND ONLY; NOT APPROVED FOR PUBLIC DOWNLOAD',
      resume.value,
      '',
      `Consent: ${value('consent') || '(Not yet given)'}`,
      '',
      'Public launch requires the participant’s approval. No domain purchase or paid-service authorization is included.',
    ].join('\n');
  };

  download.hidden = false;
  field<HTMLElement>('#resume-import').hidden = false;
  cleanSnapshot = briefText();
  download.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([briefText()], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-website-brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    field<HTMLElement>('#build-saving-note').textContent = 'A copy was downloaded. It includes your answers and résumé text—keep it somewhere private. Changes after this download need a new copy.';
  });

  fileInput.addEventListener('change', () => {
    importButton.hidden = !fileInput.files?.length;
    importStatus.textContent = fileInput.files?.length ? 'File selected. Read it below when you’re ready; importing replaces the current résumé text only after a successful read.' : '';
  });
  importButton.addEventListener('click', async () => {
    const file = fileInput.files?.[0];
    if (!file || importing || pending) return;
    importing = true;
    importButton.disabled = true;
    fileInput.disabled = true;
    send.disabled = true;
    resume.readOnly = true;
    importStatus.textContent = 'Reading your résumé on this device…';
    try {
      const { readResume } = await import('./resume-import');
      const text = await readResume(file);
      resume.value = text;
      resume.dispatchEvent(new Event('input', { bubbles: true }));
      importStatus.textContent = 'Text imported. Please check the order and details below, and remove anything you don’t want to share. Your original file has not been uploaded.';
    } catch (error) {
      importStatus.textContent = error instanceof Error ? error.message : 'That file couldn’t be read. Please paste your résumé text below.';
    } finally {
      importing = false;
      importButton.disabled = false;
      fileInput.disabled = false;
      send.disabled = false;
      resume.readOnly = false;
    }
  });

  form.addEventListener('input', () => {
    if (lastSent && briefText() !== lastSent && !pending) {
      lastSent = '';
      send.disabled = false;
      send.textContent = 'Send updated brief ↗';
      setStatus('You’ve changed your brief since sending. Send again when you’re ready to share the update.');
    }
  });
  window.addEventListener('beforeunload', event => {
    const current = briefText();
    if (current !== cleanSnapshot && current !== lastSent) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || importing) return;
    updateStyle();
    for (const control of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required]:not([type="checkbox"]), textarea[required]')) {
      if (control === aesthetic) continue;
      control.setCustomValidity(control.value.trim() ? '' : 'Please add an answer. “Help me decide” is fine.');
      control.addEventListener('input', () => control.setCustomValidity(''), { once: true });
    }
    if (!form.reportValidity()) return;
    const submitted = briefText();
    if (submitted === lastSent) return;
    const data = new FormData(form);
    // The file input has no name. Only reviewed text goes to the existing form
    // endpoint; no file attachment, base64 file, or résumé URL is submitted.
    data.set('message', submitted);
    for (const question of buildmineQuestions) data.delete(`answer_${question.id}`);
    data.delete('resume_text');
    data.delete('booking_url');
    data.delete('drew_style');
    pending = true;
    const controls = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('input, textarea, button')];
    const previousDisabled = controls.map(control => control.disabled);
    controls.forEach(control => { if (control !== download) control.disabled = true; });
    send.textContent = 'Sending your brief…';
    setStatus('Sending your answers and résumé text. Keep this page open.');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(`Submission not accepted (${response.status})`);
      lastSent = submitted;
      cleanSnapshot = submitted;
      setStatus('Your brief was submitted. I’ll review it and follow up by email with a preview or questions. Your answers are still here if you’d like to save a copy.');
    } catch {
      setStatus('I couldn’t confirm your brief was received. Your answers are still here. Try again, or save your brief below and email it to drew@drewcleaver.com. If the form can’t accept a long brief, emailing the saved file keeps it complete.', true);
    } finally {
      window.clearTimeout(timer);
      pending = false;
      controls.forEach((control, index) => { control.disabled = previousDisabled[index]; });
      send.disabled = submitted === lastSent;
      send.textContent = send.disabled ? 'Brief submitted ✓' : 'Try sending again ↗';
      status.focus();
    }
  });
}

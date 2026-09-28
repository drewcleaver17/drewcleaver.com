// Provider acceptance is not proof of inbox delivery. No inquiry data is stored.
export function initInquiry(document) {
  const form = document.querySelector('#inquiry-form');
  const status = document.querySelector('#form-status');
  const button = document.querySelector('#send-button');
  if (!form || !status || !button) return;
  const window = document.defaultView;
  const reason = form.querySelector('#reason');
  const requestedReason = new URLSearchParams(window.location.search).get('reason');
  if (reason && requestedReason && Array.from(reason.options).some(option => option.value === requestedReason)) reason.value = requestedReason;
  const requiredText = ['name', 'message'].map(id => form.querySelector(`#${id}`));
  for (const field of requiredText) field.addEventListener('input', () => field.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    for (const field of requiredText) field.setCustomValidity(field.value.trim() ? '' : 'Please enter more than spaces.');
    if (!form.reportValidity()) return;
    const data = new window.FormData(form);
    const submitted = JSON.stringify([...data]);
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.classList.remove('error');
    status.textContent = 'Sending your message…';
    const controller = new window.AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await window.fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Submission was not accepted');
      const edited = submitted !== JSON.stringify([...new window.FormData(form)]);
      status.textContent = edited
        ? 'Your submitted message was accepted. Your newer edits are still here and have not been sent. Inbox delivery is not confirmed here.'
        : 'Thanks—your message was accepted for submission. Inbox delivery is not confirmed here. I look forward to reading it.';
      if (!edited) form.reset();
    } catch {
      status.classList.add('error');
      status.textContent = 'I couldn’t confirm your message was submitted. Your text is still here. You can try again or use the email link. If the connection timed out, the first submission may still have gone through.';
    } finally {
      window.clearTimeout(timer);
      form.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = 'Send my message ↗';
      // Make the result discoverable to keyboard and screen-reader visitors.
      status.focus();
    }
  });
}

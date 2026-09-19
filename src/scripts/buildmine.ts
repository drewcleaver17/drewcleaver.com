import { buildmineQuestions } from '../data/buildmine';
import { chooseTheme, extractResume } from '../lib/site-preview';
import { fields, normalizeProject, normalizeSite, renderPage, validatePublic, encodeSite } from '../../starter/core.mjs';
import { css, downloadKit } from '../lib/buildmine-kit';
const form = document.querySelector<HTMLFormElement>('#buildmine-form');
if (form) {
  const el = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
  const editor = el<HTMLFormElement>('#site-editor');
  const resume = el<HTMLTextAreaElement>('#resume-text');
  const fileInput = el<HTMLInputElement>('#resume-file');
  const importButton = el<HTMLButtonElement>('#import-resume-button');
  const importStatus = el<HTMLElement>('#resume-import-status');
  const send = el<HTMLButtonElement>('#build-send');
  const frame = el<HTMLIFrameElement>('#site-frame');
  const approved = el<HTMLInputElement>('#review-approved');
  let importing = false, generated = false, edited = false;
  const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value || '';
  const setStatus = (id: string, text: string, error = false) => { const status = el<HTMLElement>(id); status.textContent = text; status.hidden = false; status.classList.toggle('error', error); };
  const readDraft = () => normalizeSite({version:2,theme:(editor.elements.namedItem('theme') as RadioNodeList).value,credit:el<HTMLInputElement>('#site-credit').checked,...Object.fromEntries(fields.map((key: string) => [key,(editor.elements.namedItem(key) as HTMLInputElement).value]))});
  const readProject = () => normalizeProject({format:'buildmine-private-project',version:1,brief:{name:value('name'),resume:resume.value,drewStyle:el<HTMLInputElement>('#drew-style').checked,answers:Object.fromEntries(buildmineQuestions.map(q => [q.id,value(`answer_${q.id}`)]))},site:generated ? readDraft() : null});
  const snapshot = () => JSON.stringify(readProject());
  const briefText = () => ['BUILD MINE — PRIVATE WEBSITE BRIEF (v3)',`Name: ${value('name')}`,'',...buildmineQuestions.flatMap((q,i) => [`${i+1}. ${q.title}`,value(`answer_${q.id}`) || '(Skipped)','']),`Use Drew’s style: ${el<HTMLInputElement>('#drew-style').checked ? 'Yes' : 'No'}`,'RÉSUMÉ — PRIVATE BACKGROUND',resume.value,'',...(generated ? ['PUBLIC DRAFT — REVIEW BEFORE SHARING',JSON.stringify(readDraft(),null,2)] : []),'This brief has not been sent anywhere. Save a .buildmine.json project to reopen your work in the editor.'].join('\n');
  let savedSnapshot = snapshot();
  const saveFile = (content: string | Uint8Array, filename: string, type: string) => {
    const part = typeof content === 'string' ? content : new Uint8Array(content).buffer;
    const url = URL.createObjectURL(new Blob([part], {type}));
    const a = document.createElement('a'); a.href=url; a.download=filename; document.body.append(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  const refresh = () => { frame.srcdoc = renderPage(readDraft(),css,'home',{single:true,embedded:true}); };
  const invalidateShare = () => { approved.checked=false; el<HTMLElement>('#share-output').hidden=true; el<HTMLInputElement>('#share-url').value=''; el<HTMLAnchorElement>('#share-open').removeAttribute('href'); el<HTMLElement>('#editor-status').hidden=true; };
  const fillDraft = (draft: ReturnType<typeof readDraft>) => {
    for (const key of fields) { const field = editor.elements.namedItem(key) as HTMLInputElement; field.value=draft[key]; field.setCustomValidity(''); }
    (editor.querySelector(`input[name="theme"][value="${draft.theme}"]`) as HTMLInputElement).checked=true;
    el<HTMLInputElement>('#site-credit').checked=draft.credit;
    generated=true; invalidateShare(); refresh(); el<HTMLElement>('#builder-result').hidden=false; send.textContent='Create a new draft';
  };
  send.hidden=false; el<HTMLElement>('#build-download').hidden=false; el<HTMLElement>('#resume-import').hidden=false; el<HTMLElement>('#project-tools').hidden=false;
  el<HTMLButtonElement>('#project-save').addEventListener('click', () => {
    if (importing) { setStatus('#project-status','Wait for the file import to finish, then save.',true); return; }
    const data=readProject(); saveFile(JSON.stringify(data,null,2),'my-website.buildmine.json','application/json'); savedSnapshot=JSON.stringify(data);
    setStatus('#project-status','Private project downloaded. Keep this file private; it includes your full résumé, answers and edits. Save again after making changes.');
  });
  el<HTMLInputElement>('#project-file').addEventListener('change', async event => {
    const input=event.target as HTMLInputElement, file=input.files?.[0]; if (!file) return;
    if (importing) { setStatus('#project-status','Wait for the résumé import to finish before opening a project.',true); input.value=''; return; }
    // Read/validate before touching the form. Malformed files leave all work intact.
    const before=snapshot(); input.disabled=true;
    try {
      const project=normalizeProject(JSON.parse(await file.text()));
      if ((snapshot() !== savedSnapshot || snapshot() !== before) && !window.confirm('Replace your current work with this saved project? Cancel and save a private project first to keep your current edits.')) return;
      (form.elements.namedItem('name') as HTMLInputElement).value=project.brief.name;
      (form.elements.namedItem('name') as HTMLInputElement).setCustomValidity('');
      resume.value=project.brief.resume; el<HTMLInputElement>('#drew-style').checked=project.brief.drewStyle;
      for (const q of buildmineQuestions) (form.elements.namedItem(`answer_${q.id}`) as HTMLTextAreaElement).value=project.brief.answers[q.id];
      fileInput.value=''; importButton.hidden=true; importStatus.textContent='';
      generated=false; edited=false; invalidateShare();
      if (project.site) { fillDraft(project.site); edited=true; }
      else { editor.reset(); el<HTMLElement>('#builder-result').hidden=true; frame.removeAttribute('srcdoc'); send.textContent='Create my preview ↗'; }
      savedSnapshot=snapshot(); setStatus('#project-status','Project restored. Review your public fields again before sharing or downloading.');
    } catch (error) { setStatus('#project-status',error instanceof Error && ! (error instanceof SyntaxError) ? error.message : 'Could not open that JSON file. Choose a saved .buildmine.json project. Your current work is unchanged.',true); }
    finally { input.disabled=false; input.value=''; }
  });
  el<HTMLButtonElement>('#build-download').addEventListener('click', () => { saveFile(briefText(),'my-website-brief.txt','text/plain;charset=utf-8'); el<HTMLElement>('#build-saving-note').textContent='Your readable brief was downloaded. Keep it private. Save a private project as well to reopen this work in the editor.'; });
  fileInput.addEventListener('change', () => { importButton.hidden=!fileInput.files?.length; importStatus.textContent=fileInput.files?.length ? 'Read the selected file below. A successful import replaces the current résumé text.' : ''; });
  importButton.addEventListener('click', async () => {
    const file=fileInput.files?.[0]; if (!file || importing) return;
    importing=true; importButton.disabled=true; fileInput.disabled=true; send.disabled=true; resume.readOnly=true; el<HTMLInputElement>('#project-file').disabled=true;
    importStatus.textContent='Reading your résumé on this device…';
    try { const {readResume}=await import('./resume-import'); resume.value=await readResume(file); resume.dispatchEvent(new Event('input',{bubbles:true})); importStatus.textContent='Text imported. Check the order and details below. Your original file has not been uploaded.'; }
    catch (error) { importStatus.textContent=error instanceof Error ? error.message : 'Please paste your résumé text instead.'; }
    finally { importing=false; importButton.disabled=false; fileInput.disabled=false; send.disabled=false; resume.readOnly=false; el<HTMLInputElement>('#project-file').disabled=false; }
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); if (importing) return;
    const name=form.elements.namedItem('name') as HTMLInputElement;
    name.setCustomValidity(name.value.trim() ? '' : 'Please add your name.'); name.addEventListener('input',()=>name.setCustomValidity(''),{once:true});
    if (!form.reportValidity()) return;
    if (edited && !window.confirm('Creating a new draft replaces the public edits below. Save a private project first to keep them. Create a new draft?')) return;
    const source=extractResume(resume.value,value('name'));
    fillDraft({version:2,name:value('name').trim(),...source,highlights:'',email:'',booking:'',theme:chooseTheme(value('answer_aesthetic'),el<HTMLInputElement>('#drew-style').checked),credit:true}); edited=false;
    setStatus('#build-status','Your starter is ready below. Review its text before sharing. Your résumé and answers have not been sent anywhere.');
    el<HTMLElement>('#result-title').focus(); el<HTMLElement>('#builder-result').scrollIntoView({behavior:'smooth',block:'start'});
  });
  editor.addEventListener('submit', event => event.preventDefault());
  editor.addEventListener('input', event => {
    const target=event.target as HTMLInputElement;
    if (!fields.includes(target.name) && !['theme','credit'].includes(target.name)) return;
    target.setCustomValidity(''); edited=true; invalidateShare(); refresh();
  });
  el<HTMLSelectElement>('#preview-width').addEventListener('change',event => { frame.classList.toggle('phone-preview',(event.target as HTMLSelectElement).value==='mobile'); });
  const reviewedDraft = () => {
    try {
      const draft=validatePublic(readDraft());
      if (!editor.reportValidity()) return null;
      if (!approved.checked) { setStatus('#editor-status','Review the public fields, then check the approval box before sharing or downloading.',true); approved.focus(); return null; }
      return draft;
    } catch (error) { setStatus('#editor-status',error instanceof Error ? error.message : 'Check your public fields.',true); return null; }
  };
  el<HTMLButtonElement>('#site-export').addEventListener('click', () => {
    const draft=reviewedDraft(); if (!draft) return;
    try { saveFile(downloadKit(draft),'my-website-buildmine-1.0.0.zip','application/zip'); setStatus('#editor-status','Website kit downloaded. Unzip it, open site/index.html, and follow DEPLOY.md to publish. This did not publish the site or save your private project.'); }
    catch (error) { setStatus('#editor-status',error instanceof Error ? error.message : 'Could not build the kit. Save your private project and try again.',true); }
  });
  el<HTMLButtonElement>('#site-single').addEventListener('click', () => { const draft=reviewedDraft(); if (!draft) return; saveFile(renderPage(draft,css,'home',{single:true}),'index.html','text/html;charset=utf-8'); setStatus('#editor-status','Single-page website downloaded. Your multi-page kit and private project are separate downloads.'); });
  el<HTMLButtonElement>('#site-share').addEventListener('click', () => {
    const draft=reviewedDraft(); if (!draft) return;
    try { const url=new URL('/preview/',window.location.origin); url.hash=encodeSite(draft); el<HTMLInputElement>('#share-url').value=url.href; el<HTMLAnchorElement>('#share-open').href=url.href; el<HTMLElement>('#share-output').hidden=false; setStatus('#editor-status','Snapshot link ready. Only the reviewed public fields are included. Copy the entire link. It cannot be revoked.'); }
    catch (error) { setStatus('#editor-status',error instanceof Error ? error.message : 'Could not create a link. Download your kit instead.',true); }
  });
  el<HTMLButtonElement>('#share-copy').addEventListener('click', async () => { const input=el<HTMLInputElement>('#share-url'); try { await navigator.clipboard.writeText(input.value); setStatus('#editor-status','Preview link copied.'); } catch { input.focus(); input.select(); setStatus('#editor-status','Select and copy the full link above. Automatic copying isn’t available in this browser.'); } });
  el<HTMLFieldSetElement>('#builder-inputs').disabled=false;
  window.addEventListener('beforeunload',event => { if (snapshot() !== savedSnapshot) { event.preventDefault(); event.returnValue=''; } });
}

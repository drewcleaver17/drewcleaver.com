// Parse locally. Do not upload the original file or render document HTML.
export async function readResume(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error('Please choose a file under 10 MB, or paste your résumé text below.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'txt') {
    const text = (await file.text()).trim();
    if (!text) throw new Error('That file looks empty. Please paste your résumé text below.');
    return text;
  }
  if (extension !== 'pdf') throw new Error('Choose a PDF or TXT file. For a Word document, copy and paste its text below.');
  // The compatibility build includes polyfills for older mobile browsers.
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { default: workerURL } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
  GlobalWorkerOptions.workerSrc = workerURL;
  const task = getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, disableFontFace: true });
  // Passwords are never collected by the form. Ask for an unlocked copy instead.
  task.onPassword = () => { void task.destroy(); };
  const timer = window.setTimeout(() => { void task.destroy(); }, 30000);
  try {
    const pdf = await task.promise;
    const pages: string[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim());
      page.cleanup();
    }
    const text = pages.join('\n\n').trim();
    if (!text) throw new Error('NO_TEXT');
    return text;
  } catch {
    throw new Error('I couldn’t read text from that PDF. It may be scanned, locked, or unsupported. Try an unlocked text-based PDF, or paste your résumé below.');
  } finally {
    window.clearTimeout(timer);
    await task.destroy();
  }
}

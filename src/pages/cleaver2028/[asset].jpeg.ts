import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { includeCampaign } from '../../data/cleaver2028.mjs';
// Keep the supplied logo behind the same output gate as the landing page.
// Public-directory assets would otherwise ship during unrelated releases.
export function getStaticPaths() {
  return includeCampaign ? [{ params: { asset: 'logo' } }] : [];
}
export function GET() {
  // Prerender bundles relocate import.meta.url; use the project build root.
  const bytes = readFileSync(join(process.cwd(), 'src/assets/cleaver2028/logo.jpeg'));
  return new Response(bytes, { headers: { 'Content-Type': 'image/jpeg' } });
}

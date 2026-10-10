import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
// Astro can retain prior output when getStaticPaths later returns no routes.
// Clear only this generated directory before either ordinary or review builds.
export function cleanCampaignOutput(root = new URL('../dist/', import.meta.url)) {
  rmSync(new URL('cleaver2028/', root), { recursive: true, force: true });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) cleanCampaignOutput();

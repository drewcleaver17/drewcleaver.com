import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { campaign, isLocalReview } from '../src/data/cleaver2028.mjs';
// Astro can retain prior output when getStaticPaths later returns no routes.
// Clear only this generated directory before either ordinary or review builds.
export function cleanCampaignOutput(root = new URL('../dist/', import.meta.url)) {
  rmSync(new URL('cleaver2028/', root), { recursive: true, force: true });
}
export function assertCampaignBuildAuthorized(approved = campaign.releaseApproved, review = isLocalReview) {
  if (!approved && !review) throw Error('Cleaver2028 R03 is an unapproved draft. Use CLEAVER2028_REVIEW=1 for a local review only. Do not deploy this checkout.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assertCampaignBuildAuthorized();
  cleanCampaignOutput();
}

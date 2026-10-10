# Cleaver2028 — release and maintenance

## Authorized release

Drew authorized publication of the reviewed page with his supplied logo and
confirmed on October 10, 2026 that he personally pays for it and has not registered
with the FEC. The starting state remains pre-filing planning. No receipt, candidate
ID, committee name, endorsement, nomination, ballot qualification, team, funding
from others, pilot participants or measured outcomes are asserted.

Canonical URL: https://drewcleaver.com/cleaver2028
The generated directory route is /cleaver2028/index.html. No new capitalization
alias, global navigation entry, homepage link, sitemap entry, analytics, backend,
form, mailing list, recruitment, payment, donation or advertising is introduced.
Noindex/nofollow is a search request, not privacy: the released page is public.

The supplied original 1536 × 768 logo is preserved byte for byte, including its
white background and Reinventing Our Future slogan. Its responsive white field
has a maximum width of 560px; the name heading supports it at a smaller size.
The logo also supplies social metadata with accurate dimensions and alt text.
The page uses existing green/ivory tokens, Georgia headings and focus/button
treatment. No suitable portrait was supplied; no photograph was invented.

## Lab exposure

Lab remains at R02, DPC at R09 and ProofPath at R04. They are published concept
pages, not implemented programs. The landing page describes them and imports
their revision labels, but does not link to them: explicit approval of the
proposed exposure was not provided. labLinksApproved remains false. Lab and both
proposals retain their existing inbound-link exclusions and noindex treatment.
Approve the links separately before enabling them; they would make these
unlisted pages easier to discover. Existing calculators, saved worksheets,
historical engines, PDF aliases and revision records remain untouched.

## Payer disclosure and scope-specific research

Visible line: Paid for by Drew Cleaver.
This is a voluntary factual disclosure based on Drew's confirmed personal
payment; it does not name an invented committee or assert FEC approval.

Official guidance checked October 10, 2026:
https://www.fec.gov/help-candidates-and-committees/advertising-and-disclaimers/
https://www.fec.gov/updates/internet-communications-and-activity/
https://www.fec.gov/help-candidates-and-committees/registering-candidate/testing-the-waters-possible-candidacy/

FEC guidance distinguishes political committee websites, which require
disclaimers, and paid internet public communications placed or promoted on
others' properties. The authorized scope here is an organic page on Drew's
existing personal site, paid personally, with no committee represented,
solicitation, fundraising or paid third-party placement. On those stated facts,
no committee-style disclaimer is added; the factual personal payer line is
included voluntarily. This is a limited research assessment, not a binding
legal determination or legal opinion. FEC registration is not the sole test
of candidate or committee obligations. Planning language is not a safe harbor.
Reassess this disclosure when filing, committee formation, financing,
fundraising or paid promotion changes; consult qualified election counsel for
case-specific legal conclusions.

## Maintain status deliberately

Shared copy and all status fields live in src/data/cleaver2028.mjs.
A future filed statement requires a verified real filing date and official
record URL. Update the label, introduction and FAQ together after owner approval.
No automatic status change, fake identifier or placeholder link is supported.
The validation checks evidence shape, not the truth of the record.

releaseApproved enables ordinary output after explicit owner authorization.
The local review flag includes the route before release and shows proposed
Lab links only in review builds. Never deploy a flagged local review build.
The scoped prebuild cleanup prevents Astro's retained output from carrying
stale campaign files into subsequent builds; the logo endpoint uses the same
output gate as the page. If release approval is withdrawn, rebuilding will
exclude both page and logo, and the output guards enforce that exclusion.

Contact remains mailto:drew@drewcleaver.com, imported from the shared profile.
Existing About and contact-card routes are used. No external test inquiry is
sent. Form regression responses are mocked and do not prove inbox delivery.

## Checks and release evidence

Run npm test, npm run build, and
node --test scripts/public-contact.test.mjs tests/cleaver2028.test.mjs.
Output checks cover one H1/main, unique anchors/labels, canonical/noindex and
social metadata, original logo bytes/dimensions, status wording, contact links,
no collection, and no campaign discovery or unapproved Lab exposure.

The local review generator embeds actual built HTML/CSS and the original logo
plus a recovery patch. It rewrites outgoing relative links to existing live
destinations. This is a local file, not a hosted or authenticated preview.
All existing production files are compared to the retained base output.

This managed runtime has no supported control-browser capability; Sites
guidance prohibits substituting a preview server or browser in this state.
Actual mobile/desktop pixel inspection, screenshots, keyboard focus/overflow
and device email handling remain unverified. Source/DOM/color checks do not
establish successful browser or device QA.

Publish only through the existing GitHub Pages workflow after the authorized
PR passes CI. Record the actual successful deployment and live checks below.
Rollback through a scoped revert; no hosting or DNS changes are needed.

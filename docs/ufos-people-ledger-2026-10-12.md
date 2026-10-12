# UFO People directory — October 12, 2026 review

Review-ready feature branch: `feat/ufos-people-directory-2026-10-12`, based on current main `df413f1`. **Not published. Real-browser/device QA remains unverified.** AGENTS.md requires the owner to review a concrete preview before publication approval. The machine-readable [ledger](ufos-people-ledger-2026-10-12.json) records all 251 people, sources, inspection scopes, work reconciliation, exceptions, portrait checks and link results.

## Coverage

| Measure | Count |
|---|---:|
| Retained canonical people / enriched profiles | 251 / 251 |
| Resolved identities / retained initialed exceptions | 249 / 2 |
| Featured / nonfeatured people | 100 / 151 |
| Selected works and primary records, stored once | 159 |
| Person-to-work references / people with selected works | 254 / 236 |
| Sourced contribution bullets | 358 |
| Reusable portraits / designed fallbacks | 139 / 112 |
| New immutable sources / total source registry | 95 / 521 |

No people or birth-date events were invented or added. All 399 event objects and all non-person entities remain unchanged. Fifteen profiles omit selected works where this pass did not justify an appropriate selection; that omission is not a claim that the person published nothing.

**Unresolved:** P. F. Scott and R. A. Collins remain identified by the initials and instrumental roles documented in Bell Burnell's account. No full names or portraits were guessed. Verified expansions retain their old abbreviated aliases: Howard Percy Robertson, Benjamin P. Abbott, Bas Hensen, Hannes Bernien and Ronald Hanson. Joe Spielberger is supported by the official hearing record; Walter is an inherited editorial error, not an alias. One existing CRISPR relationship's collaborator name was corrected to Michael Hauer.

## Evidence and bibliography

The five complete batches contain 394 scoped inspection-log entries: 102 fresh source-text entries, 43 fresh catalogue/metadata entries and 249 explicit reuses of previously documented inspections. These are log entries, not 394 unique works or full readings. A further targeted review covered 27 disputed profiles and 12 fresh source inspections. The access audit screened the Full text selections and independently checked excerpt/edition risks.

Shared papers are consolidated across coauthors, including Wilkins–Stokes–Wilson, Lee–Yang, Maxwell and Fowler–Milne. The three NYT coauthors reference one 2017 article. The Law of One Book V (1998), The Ra Contact (2018) and Wheelock's undated edition guide have distinct records and roles. Tusi's composition is distinct from the 1289 copy. Faraday's 1832 article is distinct from the linked 1849 collected edition. Copernicus, Maxwell sections, Cocconi–Morrison's abridged reprint and Athanasius excerpts are labeled Preview. Utts's 1995 UC Davis affiliation is distinguished from current UC Irvine hosting.

All 426 previous source objects and source-review records remain immutable. The broad research cutoff remains `2026-09-19`, and `lastCheckedAt` remains `2026-10-12T05:26:02Z`. The new per-profile/per-work dates do not imply a whole-site source recheck. The 54 batch exception notes describe identity, edition, access and selection limits; they are not 54 unresolved people.

## Images

139 local 320 × 400 WebPs total 2,008,398 bytes: 115 photographs, 12 historical portraits and 12 later depictions. All source originals and resulting crops were inspected; group crops for Fravor, Bray and Keyhoe were corrected. File-specific identity, creator, reuse license or public-domain basis, source, attribution and crop notes are retained in [attribution.json](../public/images/ufos/people/attribution.json) and each canonical profile. No generated historical likenesses, runtime Wikipedia calls or third-party image hotlinks are used.

## Interface and maintenance

People occupies the reading-path position beside Added or corrected. `/ufos/people/` provides name/alias/work/institution search, eight multi-valued role groups, A–Z/Z–A order, Featured, counts, reset and empty state. A person opens inline from their card; filters and selected person have shareable URL state. Closing returns focus and position; direct static profile routes provide no-JS access. Legacy person and featured anchors lead to this single directory. Related events use full history, with `via=people` return navigation distinct from the `from` date filter.

The timeline projection omits full person profiles and works. A complete JSON export is fetched on demand from a noindex HTML wrapper at `/ufos/data/`. Every UFO child route remains `noindex, nofollow`, excluded from the sitemap and public navigation. Automation configuration, schedules, permissions, status and dataset-only boundaries are unchanged; imported envelopes cannot publish biography, work or portrait changes. The existing PR validation workflow now recognizes the new feature paths.

## Performance

| Production payload | Before | After |
|---|---:|---:|
| Initial timeline HTML | 5,554,143 B | 5,519,776 B |
| Timeline HTML gzip, level 6 | 819,385 B | 829,883 B |
| Initial timeline JavaScript, imported chunks included | 16,328 B | 17,734 B |
| Timeline JavaScript gzip | 6,178 B | 6,638 B |
| External CSS | 55,903 B | 56,486 B |
| Default timeline image elements | 0 | 0 |

The directory ships 291,761 B HTML (51,267 B gzip), a compact search index, 7,716 B JavaScript including imported chunks, and 9,067 B additional CSS. Details are fetched only when opened. A long profile is 10,850 B HTML. All 139 directory image elements use lazy loading and explicit dimensions. Actual transfer timing and browser lazy-loading thresholds were not measured. The legacy timeline remains large; this feature does not attempt a broader archival-payload refactor.

## Verification and remaining limits

- `npm test`: **44 passed**.
- `npm run build`: **passed**, 287 routes, release/discovery gates and **133 build-invoked tests** (including 15 UFO/People DOM tests).
- All 251 generated profiles checked for no-JS content, unique anchors, source references, local URLs and noindex. Every old timeline anchor remains. Event objects and institutional dossiers are unchanged.
- Built-client tests cover combined filters, reset/empty states, direct/refresh state, inline fetch/failure/cache, back/forward state, focus calls, image failure, related events, return navigation and complete export. The date-filter/return-parameter collision found during review was corrected and regression-tested.
- HTTP GET checks: **231 reachable, 6 access-blocked, 4 timed out, 2 server responses; 0 confirmed dead** across 243 distinct biography/bibliography URLs. Status alone is not evidence inspection. Portrait file-description rights checks are separately recorded.
- Offline review file smoke check passed for search, embedded profile loading, close and destinations. Static directory and long-profile images at 390/1440 px, plus 320 px narrow renders, were visually reviewed.
- **No native-browser/device pass was possible.** The managed Sites environment exposed no supported browser and its skill forbids alternate servers/browser installs. The supplied images are static HTML renders with explicit renderer compatibility rules, not browser screenshots. Real keyboard/touch interaction, screen-reader behavior, mobile overflow and image-network timing remain unverified.

The scoped Lab release-guard correction allows legitimate external source URLs such as `qutech.nl/lab/...`; relative, same-origin and protocol-relative links exposing this site's Lab remain rejected and are directly asserted. Unrelated production HTML is unchanged after normalizing two generated script filenames.

## Release handoff

Review the concrete offline HTML and static renders. After explicit owner publication approval, reconcile current main, pass the existing CI checks, merge through the established workflow, verify the exact Pages deployment and live directory/profile/noindex behavior, and only then append a genuine publication receipt. Do not treat this local build or draft PR as publication or a scheduled-run success.

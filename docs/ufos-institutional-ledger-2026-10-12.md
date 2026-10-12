# Institutional history — reviewed release, October 12, 2026 UTC

This revision is implemented on `feat/ufos-institutions-r01`, from main `5053f6242004d514a9f33453087f50e91d1e5754`. The fetched live page's embedded dataset equaled that baseline. The initial working tree was clean; open PR #49 concerned unrelated DPC work and was not changed. Drew explicitly approved live deployment of the reviewed revision on October 12, 2026. Current main was reconciled again and remains the same baseline. Publication uses the existing PR, validation and GitHub Pages workflow.

## Coverage and counts

The prior edition had 139 main milestones, 37 supporting records, 176 events, 358 canonical entities, 256 source records, 34 relationships and one selected YouTube video. Existing major national-security milestones were retained. The earlier 84- and 112-record editions are historical baselines only.

| Measure | Added / changed | Review total |
| --- | ---: | ---: |
| Main reading milestones | 15 | 154 |
| Supporting records | 208 | 245 |
| Events | 223 added; one access-scope correction | 399 |
| Canonical entities | 163 added; 28 existing entities receive dossiers | 521 |
| Institutional dossiers | 191 | 191 |
| Sources | 170 new immutable versions | 426 |
| Sourced relationships | 89 added | 123 |
| Selected YouTube videos | 0 added | 1 |

New date roles: 64 formation, 22 authorization, 29 operational-start, 39 rename, 25 transfer, 17 designation, nine closure, six public-acknowledgment, three declassification, one public release, five public reference and three document-date records. These are counts of dated records, not counts of newly discovered agencies. The institutional view includes 246 old and new linked records. Of 191 dossiers, 134 have dated links; 57 are bounded identity/roster records with no invented formation date.

The owner review package contains 886 candidate/claim/roster disposition rows and the complete 191-row baseline coverage matrix. Multiple rows can concern different questions about one institution. The companion JSON in this directory records the baseline matrix, mappings, limits and publication boundary; private corpus notes and source collections are not added to this public repository.

## Research boundary

Research occurred October 12 UTC (October 11 US/Central). The broad news/research cutoff remains **September 19, 2026**. Scoped receipts identify the newly inspected supporting passages; source inspection does not verify every assertion made in a record.

- Screened the official FY2026 NCSES FFRDC workbook: 41 populated current rows plus an extra NCAR name-only stub, all 85 Historical rows, and 2024/2025 comparisons. Center, administrator and sponsor remain separate. An ambiguous list row is not silently counted as another center.
- Screened all 15 displayed UARCs. Founding, later designation, university affiliation and undated roster sponsor are distinct. SDL's stale sponsor row is disclosed alongside the later transition record.
- Screened all 18 displayed Intelligence Community components; this is a dated roster observation, not a hard-coded permanent count or 18 independent agencies.
- Inventoried the original UAP Gerb channel's returned 53 Videos and 17 Live cards. Fourteen descriptions and portions of 13 third-party transcripts were inspected. No audiovisual viewing or full-transcript review is claimed. Shorts, community posts, comments, deleted/private material and external appearances were not inventoried.
- Extracted 289 typed candidates, screened 332 raw acronym tokens, and recorded 32 claim-to-source crosswalks. Transcription candidates and co-mentions are not verified institutions or command relationships. The full manifest remains in the private owner review package, not a supplementary public video playlist.

## Consequential distinctions

NURO receives a priority dossier. The inspected scholarly retrospective estimates inception in 1969; an original office charter and an exact day remain unresolved. The February 17, 1970 NSDM refers to a National Underwater Reconnaissance Program, not an office-formation instrument. The 2022 oral history and 2023 CIA journal book review are public references, not established first acknowledgment or declassification dates. The profile describes an acquisition office without asserting an unverified formal interagency arrangement.

NRO's September 6, 1961 organizing letter remains at its old anchor with the unimplemented codirectorship caveat. Earlier public references, the September 18, 1992 acknowledgment and program-specific disclosures are separate. NRP is a program, not an alias for the office. Programs A–D are linked to their organization/closure milestones without asserting continuous staffing from a program's lifespan.

Research centers and operators do not collapse into one identity. MITRE's incorporation, separately named centers and the 2026 records inquiry answer different questions. RAND, IDA and CNA histories retain center-level distinctions. GOCO/FFRDC/UARC snapshots are period-scoped. Current NLR/NREL name continuity does not backdate the new name to its 2024 GOCO source. Historic FFRDC-list removals at JHU APL, UW APL and Penn State ARL are not laboratory closures or automatic UARC transitions.

Document dates are not copied into publication fields. Original classified memoranda, the 2023 PARCAE remarks reproduced in a 2026 hearing volume, and the 1985 speech reproduced in a 2008 collection retain distinct provenance. The congressional MITRE letter is ten pages total including its enclosure; an inquiry is not a finding of a hidden operational program. Acknowledgment of a response is not proof of production or custody.

The only changed original event object is `aaro-history-report`: its access note now reconciles the inspected original-report mirror with the earlier inaccessible official host. The correction history preserves the prior note. All other 175 original event objects, 256 old source objects, 34 relationships and the original video selection remain unchanged.

## Canonical model and UI

Content model 5 keeps schema version 1 and the existing canonical entity array. `institutionalProfile` adds primary type, distinct attributes and period snapshots, domain, mission, relevance, UAP-status boundary, roster provenance, milestone/source IDs and open questions. Relationship effective dates may be unknown with an explicit `dateBasis`; a source observation date is identified as such. Unknown ends do not imply uninterrupted continuation.

`view=institutions` adds a chronology using existing cards. `iq`, `itype`, `idomain`, `iuap` and `idesignation` independently filter canonical dossiers. Timeline interactions preserve those parameters; popstate and filtered dossier reveal are tested. Existing anchors, people navigation, URL presets, core/contextual and main/supporting distinctions, JSON export and source panels survive. Large-list rendering caches era containers and batches card moves.

Importer schema-1 compatibility remains. Unattended changes to institutional classification/history require editorial review; no entity/relationship writes are allowed through the existing automated envelope. This is a human editorial extension, not a change to the reporter's cadence, activation/status, permissions, thresholds, configuration or dataset-only write boundary.

## Verification and handoff

- `npm test`: 39 UFO tests pass.
- `npm run ufos:validate`: 399 records pass schema/editorial validation.
- `npm run build`: production Astro build, release controls, eight built-DOM UFO tests and all 118 additional repository tests pass.
- `git diff --check`: pass.
- All 58 unrelated built HTML outputs match baseline after asset-name normalization. Sitemap and robots bytes match. Prior ledgers and workflow files are untouched. Existing operational metadata and publication history are retained; the current publication receipt is cleared pending a future authorized release.
- Noindex/nofollow, sitemap/inbound-discovery exclusions and analytics absence pass release checks. Analytics remains absent with saved consent in DOM tests.
- The owner package provides the complete offline HTML, searchable review/evidence HTML, machine-readable ledgers and a static PDF of selected production markup.

The managed Sites browser-control skill/tools were unavailable. No server or public preview was started. Static PDF rendering and jsdom do not establish real browser layout, screen-reader behavior, exact 320/390/768/1440 widths or full keyboard traversal. These checks remain unverified; this limit was disclosed in the review before Drew authorized deployment. The authorization does not convert unavailable checks into passes. No scheduled reporter run is claimed.

Release sequence: rerun required gates, publish the scoped branch, merge only after CI passes, verify the exact merged Pages deployment and fresh live content, then record the observed publication receipt. Preserve all unlisted/discovery protections. Noindex is not access control.

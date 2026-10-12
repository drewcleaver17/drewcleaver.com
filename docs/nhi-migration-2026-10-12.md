# NHI — New History Initiative: migration release

Revision: `2026-10-12-nhi-migration` · October 12, 2026, US/Central.

## Integrated baseline

People PR [#71](https://github.com/drewcleaver17/drewcleaver.com/pull/71) merged as `ee82cce0533d89d35886efa09bf77c640d9706d0`. Its [Pages deployment](https://github.com/drewcleaver17/drewcleaver.com/actions/runs/38232727708) succeeded. Before editing, a fresh live timeline matched the edition and projected data, the complete live `/ufos/data/` export matched the integrated dataset exactly, and Einstein's live profile contained its expected identity. No overlapping UFO/People PR was open. Work used an isolated checkout and feature branch; other working trees were not modified.

| Preserved collection | Baseline and migration |
|---|---:|
| Events | 399 |
| Main / supporting records | 154 / 245 |
| Canonical entities | 521 |
| Sources / source-review records | 521 / 521 |
| People / complete profiles | 251 / 251 |
| Featured people | 100 |
| Shared selected works | 159 |
| Local portraits | 139 |
| Institutional dossiers | 191 |
| Relationships | 123 |

Exact object comparisons preserve events, entities (including every profile and dossier), sources, source reviews, works and relationships. The old change log is an unchanged prefix with one appended migration entry. All existing image/attribution files retain their bytes. No broad research expansion or factual reclassification occurred. The research cutoff, source-check time, substantive dataset update time, reporter settings and previous publication history are retained. The title/edition and stale People-review publication status are updated; prior review records remain truthful historical records.

## Identity, routes and discovery

The active resource is **NHI — New History Initiative**, described as an evolving, sourced index of discovery, intelligence and the unexplained. Its short opening names Drew as the independent author. About/methodology explains the purpose, the intentional non-human-intelligence echo, historical context, evidence distinctions and the existing source/correction email route. It claims no institute, research credential, definitive replacement history, new license or contributor organization.

The existing Astro pages move to `/nhi/`, `/nhi/people/`, `/nhi/people/<id>/` and `/nhi/data/`; no separate editorial database is created. All 254 canonical routes have self-referencing production canonicals, NHI titles/sharing metadata, no noindex restriction and sitemap entries. Shared navigation, home, footer, galleries, other projects and on-site discovery remain unchanged. Robots.txt already allows crawling and is unchanged. Search indexing eligibility is not proof of indexing.

GitHub Pages publishes static artifacts through the existing workflow. [GitHub's hosting documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and [Astro's routing documentation](https://docs.astro.build/en/guides/routing/#redirects) describe this boundary; a configured static redirect is not an HTTP 301. This release therefore generates compatible HTML at every old route. Each has a canonical destination, `noindex, follow`, an accessible working link and a query/fragment-preserving `location.replace` enhancement. No competing refresh can drop URL state, no redirect is added to the browser history, and destination pages do not redirect back. JavaScript-disabled readers can follow the link; the fallback explains how to replace only the route prefix to retain filters/anchors manually. The old data wrapper also serves the exact shared export to already-open old tabs.

Saved-state keys, source filenames, event/entity/relationship IDs, export element IDs, schema, portraits and asset paths retain their internal UFO names. Active URL generation and return links use `/nhi/`, with safe conversion of same-origin saved `/ufos/` state. The download filename uses `nhi-index-<edition>.json`.

[Google's noindex documentation](https://developers.google.com/search/docs/crawling-indexing/block-indexing) informed the visibility checks: HTML metadata and response headers must be checked separately; robots.txt blocking is not an equivalent indexing control. No visibility rule for unrelated routes is relaxed.

## Validation

- `npm test`: 44 model tests passed.
- `npm run build`: passed, 541 generated pages; 140 build-invoked tests passed, including 22 timeline/People/migration tests. Total: 184 tests, zero failures.
- Dataset/schema/editorial validation passed for all 399 events; original source and profile validators remain in force.
- Migration tests cover all 254 old/new route pairs, metadata/canonicals, sitemap inclusion, no-JS links, query/fragment retention, redirect-target safety, saved state, all event/entity/relationship anchors and legacy export compatibility.
- Existing built-client tests cover combined timeline/institution/People filters, searches, empty/reset states, URL/popstate restoration, inline profile fetch/failure/cache, focus calls, portrait fallbacks, related links and complete export. Added checks cover old saved return paths and canonical copied event links.
- All 58 unrelated HTML outputs match a clean baseline build after generated bundle-filename normalization. Robots bytes, main-site discovery exclusions, and every other route's visibility gates are preserved.
- All portraits and provenance files are unchanged; the profile suite verifies every local profile/portrait destination and source links.
- Changed hero copy was visually reviewed in static renders at 320, 390, 768 and 1440 px; About copy at 390 px. The renderer resolves width rules and unsupported typography values explicitly. These are static HTML renders, not browser screenshots.
- `git diff --check` passed. The final diff contains only the migration, associated tests and maintenance/release documentation; no credentials or private research corpus are included.

**Verification limit:** the managed environment does not expose the supported browser-control skill. No alternative browser/server was installed. Actual mobile geometry, screen-reader behavior, native keyboard/touch operation, browser console and image-network timing are not certified by the DOM/static checks. Source and static review preserve the existing responsive/accessibility design; this limitation is not relabeled as a browser pass.

## Maintenance boundary

The existing external **UAP Disclosure Milestones** task was inspected read-only. Its prompt still names `/ufos/` for publication checks, while instructing every run to read `docs/ufos-updates.md`. That document now directs verification to the canonical `/nhi/` destination and records this external dependency. Task configuration, cadence, activation/status, permissions and substantive-alert threshold were not changed. The CI workflow name **Validate UFO timeline** and dataset-only automation branch boundary remain stable. A future external-prompt cleanup is outside this repository-scoped release. No successful post-migration scheduled run is claimed.

## Publication

PR [#72](https://github.com/drewcleaver17/drewcleaver.com/pull/72) passed both existing CI workflows. Main was refreshed immediately before merge and remained the integrated People baseline. The remote source tree exactly matched the locally validated tree (`09ff76913d50c1ba8ca0e4b8c9c7ea42047f5834`). The PR merged as `53566cd99c5a00b7b39193d3ad8ad57b4ed777ed`; [Pages run 38235422625](https://github.com/drewcleaver17/drewcleaver.com/actions/runs/38235422625) completed successfully.

Observed production verification: `2026-10-12T10:21:42.032323Z`. Fresh checks of 22 routes and 10 served bundles/imports/representative portraits matched the validated build. The full live dataset matched source exactly; all 399 event and 521 entity anchors were present. All 254 canonical NHI routes were in the production sitemap, with old routes excluded. Canonical/title/sharing metadata, robots.txt, absence of NHI noindex headers, legacy noindex/fallback destinations and main-site discovery exclusions passed. Production-delivered redirect scripts were executed in isolated DOM/VM checks for query-bearing event, institution, directory and person links. This is HTTP/source and DOM verification, not a native-browser check.

Content digest: `891591de1aeaa6498ae02ff07a36516ee74bda9715d69947046728c7ec97ddf0`.

The receipt-only follow-up records this observed publication in dataset metadata and this ledger through the normal PR/check/deployment process. It does not change the edition, content digest, historical records, source-check or substantive-content dates, research cutoff, previous publication history, or any automation setting. The receipt references the verified content release rather than predicting its own follow-up commit.

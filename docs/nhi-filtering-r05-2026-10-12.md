# NHI R05 filtering refinement

Scope: filtering only, based on main `eb93b79` (R04 / PR #77). No conflicting NHI PR was open; the unrelated DPC PR #49 was left alone. Dataset, sources, stable IDs, profiles, portraits, routes, discoverability, appearance preferences and scheduled work are retained. The data publication receipt remains a historical-content receipt; R05 identifies the interface revision.

## Audit → correction

| Observed issue | Correction |
| --- | --- |
| `yearsCovered()` expands spans into 1,357 padded CE years | Remove generator and selector. `NhiFilters.astro` supplies year + BCE/CE bounds and one set of range shortcuts. |
| `nhi-controls.mjs` turns every select into exclusive radios | Timeline has native checkboxes. Existing People and institution categorical adapters now use checkboxes and arrays; view/order stay exclusive native selects. |
| 528 registered entities + 50 exact legacy field labels form one overwhelming catalog | Search 578 people and subjects by label/verified alias. Show 10 initially, then 20 more per request. Keep selected subjects visible. Registered person/organization/program/place types are shown; broad `work / collection` is honestly displayed as Subject, including ALH84001. No taxonomy edits. |
| Topics and categories overlap in language | Explain topic = subject matter; category = kind of event/record. Preserve all existing tags. Regions are labeled as four curated collections, not complete geography. |
| Search/reading refinement buried among catalogs | Search first, then dates, topics/categories and other groups; direct group links, visible labels, per-group clear. Desktop has one scrolling sidebar; mobile keeps the inline editor and a compact sticky count/refinement bar. |
| Chips, counts and URLs assume scalar facets | Shared matching predicate, array state, repeated URL parameters, labeled removable chips, six-chip preview with explicit expansion. |
| Date inputs exclude BCE and validate by string ordering | Signed ordering uses existing calendar coordinates; UI has no negative entry or year zero. Interval overlap is inclusive. Drafts require explicit Apply, and invalid/pending edits retain committed results. |

Inspected the supplied IMG_4525/4526 screenshots, current source and data, and the live R04 interface in the cloud browser. Guidance inputs: [GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes/), [Baymard multi-value facets](https://baymard.com/research-articles/allow-applying-of-multiple-filter-values), [applied-filter overview](https://baymard.com/research-articles/how-to-design-applied-filters), and [WCAG focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

## State and matching contract

- `topic`, `category`, `evidence`, `region`, `layer`, `entity` are arrays, OR within each and AND across groups. No selections = unrestricted. Results are deduplicated by the event collection, not by concatenating matches.
- `filterEvents` and `facetCounts` use `eventMatcher` and a cached full-dataset index. Counts omit their own facet selections and include every other constraint, plus view/context/search/date. Zero-count choices remain available and removable; choices do not reorder as counts change.
- Subjects use canonical `entityIds` / `eventIds`. Existing exact people/institutions fields remain accessible via deterministic `entry-name:<exact label>` IDs where no registered subject exists. Exact legacy names/aliases migrate to these relationships. No fuzzy matching of prose, new aliases, inferred types, or new editorial entities.
- `from` / `to` use signed padded years internally (e.g. `-0500`); UI shows `500` + BCE. BCE values follow the repository convention, with no zero. Old day-specific links retain exact bounds and explain that Apply changes them to whole years. Old `era` links translate to the same date range when there are no explicit bounds. Invalid/removed URL restrictions are ignored with a visible explanation.
- Filters use the existing `event.date` chronology; separate occurrence/discovery/publication records retain their meanings. Age estimates retain their existing navigation coordinates. Undated fixtures remain visible when dates are unrestricted and are excluded with an active range; the current validated dataset has no undated timeline entries.
- Presets fill the same bounds. Present uses the browser's current UTC year. Editing a bound selects Custom; pressing Apply or Enter in the range validates both endpoints. Other controls update immediately, with 150ms text debounce and a settled polite result announcement.
- Checkbox changes push navigable history. Typing replaces the current history entry. Refresh/popstate reconstruct selections and exact result IDs. Institution parameters are retained alongside timeline parameters; People has its own state. Clear all resets restrictions/query/date while retaining view, order and appearance.
- Server-rendered records, sources, profile routes and no-JS fallback remain. No new runtime dependency or backend.

## Verification

- Model tests cover union/intersection/deduplication; per-facet clearing; contextual counts; BCE/CE transition and reversed/zero/partial inputs; inclusive span boundaries; same-year/open bounds; approximate/undated fixtures; exact dates vs discovery dates; URL round trips/legacy links; full-catalog lookup, aliases, accents and ordering; independent People/institution unions.
- Built-DOM tests exercise actual checkbox changes, date drafts/Apply/presets, late-catalog selections, local search clearing, chips/counts, zero recovery, refresh/popstate, focus, reading return, source/profile navigation, theme persistence, print restoration and legacy redirects. Geometry assertions in DOM tests are explicitly simulated.
- Required `npm test`, `npm run build`, content validation and release/discovery guards pass. This repository defines no separate lint or type-check commands. Astro compilation is included in the build.
- Full dataset is 423 events / 578 available subjects. A measured model run completed 20 filtering-plus-all-facet-count cycles in about 42ms after indexing (Node runtime; not mobile/browser latency).
- Source dataset is byte-identical. All 58 unrelated HTML routes match baseline after generated asset-name normalization. Initial NHI HTML shrank by approximately 67KB. All canonical/legacy route, source, export and profile preservation tests pass.
- Static initialized-markup layout samples reviewed at 320/390/768/1440px, plus 640×360, in light/dark themes. These are print-engine visual approximations, not native browser viewport, touch, zoom, keyboard-overlay or screen-reader certification. Browser API exposes no viewport-resize capability; exact mobile geometry/200% native zoom remain unverified. Supported live-browser interactions will be checked after deployment.

Release: use the existing two PR workflows, merge only after success, observe the exact Pages deployment, then verify served content/assets and actual browser interaction. Do not infer production success from the build or branch push.

Production follow-up: PR #78 deployed as `8c8396f`. All 10 checked canonical/legacy/data/profile/discovery responses and 9 referenced assets exactly matched the tested build; exported data retained all 423 records. Native browser checks confirmed the 265-entry category union and a one-entry evidence/region/date intersection. Chip removal exposed an offscreen-focus issue: the follow-up keeps focus on a neighboring chip (or the results summary), suppresses automatic result reanchoring while editing controls, and lets intentional Show more reveal its new focused choice. Option-count accessible labels include the numeric count. A targeted regression covers the focus/scroll behavior.

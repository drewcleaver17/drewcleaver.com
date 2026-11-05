# Dragon Cable finder

Open `/moon/match/` for equipment matching or `/moon/match/directory/` to browse catalog and extended equipment. The homepage search uses the same directory. All shopper interactions run against a local static snapshot. Product references open the corresponding retailer or manufacturer page only when clicked.

## Data and updates

* `inventory.mjs` enumerates the public U.S. retail listings classified as electronics. A listing can contain multiple revisions or an entire system. Catalog membership establishes discovery, not fit, availability or price.
* `listener-data/` maps exact models and revisions to current Dragon product handles and exact ear-side selectors. `player-data/` records named headphone-level output sockets. Each record carries a source. Fixed cables, electrostatics, ribbon interfaces, alternate revisions and ambiguous wiring need their own disposition. See [listener maintenance](./listener-data/README.md).
* `systems.mjs` joins source **outputs** to compatible receiver **inputs** using explicit signal types, wiring and model restrictions. Each route has evidence and an exact Dragon variant. Generic port matching is a separate mode. Power ranges, channels, host roles, supplied cables and special clock or dual-data connections are handled where documented.
* `offer-data/` joins actual U.S. variants, availability at the snapshot, native choices and mandatory retail-form surcharges. Paid rush is opt-in and checked per retail form. See [price verification](./offer-data/README.md). The dated original workshop scenarios remain separately identified.
* `engine.mjs` checks the whole combination on every portable link and bag review. A changed price, variant or option signature invalidates a saved priced build. Unknown terms entered by a visitor stay on that device. The visible scheme uses public model IDs and enumerated options.
* `maintenance/coverage.mjs` reports catalog listing coverage, headphone models with prices, actual retail variant IDs, and named component pairs separately. Count priced configurations as model-specific choices, not distinct SKUs, physical tests, or stocked units.

Prepare a fresh candidate snapshot in a **new directory outside the checkout** using Python 3.9+, curl and Node. The command reads public pages. It checks the product sitemap, cross-checks retailer selectors and serves no live data to visitors. A renamed equipment model or product needs manual review, including where the retailer reuses its URL.

```sh
python3 src/moon/matcher/maintenance/prepare_snapshot.py /tmp/moon-review-new
node src/moon/matcher/maintenance/coverage.mjs
```

Inspect the candidate diffs. Confirm current versions against manuals, output purpose and all paid fields. Review additions and exclusions on both sides of a connection. Run these checks on the feature branch, then use the site's existing preview approval process.

```sh
npm ci
npm test
npm run build
node src/moon/matcher/listener-data/check.mjs
node --test src/moon/*.test.mjs src/moon/matcher/*.test.mjs src/moon/matcher/offer-data/*.test.mjs
npm run preview
```

The site has no automatic catalog sync, Shopify write, payment collection, live call or request delivery. A buyer can open a documented retail product directly, including its variant. If the retail form separately prices an earcup, plug or rush field, the fit card spells out what to select there.

## Commercial integration

At a commercial checkout boundary, resolve the catalog revision and model/port choices on Moon's server, revalidate availability, price and both ends, then map the configuration to the authoritative Shopify merchandise variant. Carry the fit/build ID, exact gear revisions, both plugs, length, finish and rush choice as line attributes. Line attributes alone cannot increase a Shopify charge. Where the shop requires a paid option, attach the corresponding priced merchandise/add-on or use its approved configurable-product pricing mechanism. Tie all associated lines to the same build ID, update them together and confirm the resulting cart total against the quoted breakdown. A variant URL alone can omit paid choices made in the retailer's product form.

An advisor can use the same validated payload to prepare a Shopify draft order, with the exact base line, approved surcharges and line properties, and send the invoice only after the shopper confirms the quote. Generate and store the production quote ID server-side. Reopening a quote or retrying a request should update the existing build rather than duplicate the charge. Keep contact details in the protected request system.

Before activation, the workshop should sign off the revision-specific connector fit and pinouts, specialty system exceptions, variant/price and optional-charge mappings, current inventory, return eligibility, and actual build/shipping expectations. Connect a staffed request destination with ownership, delivery confirmation and a tested after-hours path. Commercial staffing, orders, delivery and conversion outcomes require live evidence.

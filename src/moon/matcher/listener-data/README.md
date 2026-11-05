# Headphone and IEM fit records

The matcher joins an exact model or socket revision to a Dragon product and its retail earcup choice. The amp-side output and price are checked separately. All lookups run against the local snapshot.

## Updating a model

1. Find the model in Moon Audio’s current US hardware listing, manufacturer manual, or Moon’s named cable compatibility table. Check the earcup or earpiece connector, wiring, recess or lock and revision. Use Moon’s [connection guide](https://www.moon-audio.com/pages/audio-cable-connection-guide) and its [older fit selector](https://widget-pdp.moon-audio.com/) for legacy model names. Current product forms determine the available cable choices.
2. In `models.mjs`, give the exact model one row. The `listing` handle is optional. Only attach one when the current US product title is the same device. Aliases help shoppers search with alternate spelling. An alias must point to the same hardware revision.
3. In `fit-rules.mjs`, reference the cable keys from `cables.mjs`. Each key maps to the *exact* native or custom earcup selector on that specific retail order form. Use `null` for a cable made with one fixed fitting. Add a group when two cables name different sets of supported models.
4. Supply a primary `source` on the rule and any additional evidence on the model row. A model-specific source and a different rule-level source are both exposed to the matcher. Add `included` messages only for the outputs that the current retail package provides, including documented adapters. A buyer-selected stock plug or an open-box package needs its own qualification.
5. For ambiguous shells, provide separate revision records and link to them from the base model with `revisions`. Use `mode: 'advisor'` for unresolved barrel clearance, wiring, or selector options. Use `mode: 'specialist'` for electrostatic or ribbon systems, permanently attached leads, and wireless-only devices. Both modes have an empty cable list.

## Rechecking the snapshot

Run these commands from the repository root after `npm ci`.

```sh
node src/moon/matcher/listener-data/check.mjs
node src/moon/matcher/listener-data/check.mjs --live
```

The first command compares current headphone listings to model records and checks IDs, device roles, output tokens and revision links. The second reads the public US cable pages sequentially and compares every stored earcup option and amp-side connector family to its order form. An archived set of public product HTML files named `<handle>.html` can be checked with `--snapshot DIRECTORY`. Review a failure against the source before changing a rule. Reading the order form confirms that an option exists. Manufacturer wiring and physical clearance require a separate evidence check.

## Cases requiring particular care

- **64 Audio Solo** uses a 0.78 mm two-pin socket. The cable manufacturer identifies the exact model on its [Solo cable page](https://www.64audio.com/products/copper-eight-braid-cable). The A12t custom can use IPX or two-pin depending on the order.
- **Sennheiser HD 620S** uses the single locking four-contact earcup plug in Sennheiser’s [HD 500-series technical data](https://us.sennheiser-hearing.com/collections/all-audiophile/products/hd-620s-and-4-4mm-balanced-audio-cable-set). HD 600-family dual-earcup leads would be a wrong fit.
- **HiFiMAN SUSVARA and HE1000 V2** have socket-specific records. Ask the owner to identify 2.5 mm versus 3.5 mm when the bare model name leaves it open. **JH Audio** records identify the exact two-pin or four-pin shell. A seven-pin or T2 build needs separate evidence.
- **Audeze MM-100 and LCD-S20** route both stereo channels through one earcup. Use Audeze’s [wiring diagram](https://support.audeze.com/hc/en-us/articles/19047957412749-MM-100-and-LCD-S20-pinout-Custom-cables-single-ended-or-balanced) before offering a custom connection.
- **Meze 99 Classics 2nd Gen, STRADA, HEDDphone TWO GT and Audeze Maxwell 2 ANC** have documented supplied cables. A retailer bundle recommendation alone leaves the earcup choice on a standalone Dragon order unresolved.

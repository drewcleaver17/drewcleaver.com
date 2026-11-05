# US Dragon cable merchandise prices

The finder joins a documented headphone fit to a retail variant and the selected output plug. Each result links to the Moon Audio product with its actual Shopify variant ID. Prices in this snapshot include the specified cable, length, earcup fitting and amp plug, with standard processing.

## What travels to Moon

* A native variant encodes every selection. Its exact price comes from both the public US product feed and the matching option on the product form.
* A configured result also needs line-item properties. The retailer link sets the native variant, and the finder lists each extra selection the buyer must make on Moon. The total includes the price on each selected form option. These options can have a price and an empty add-on variant ID. Production integration requires Moon to confirm its surcharge mechanism.
* Availability is checked when the snapshot is built. Moon's retail page supplies the current sale price and availability. Tax, shipping and optional rush are outside these standard merchandise totals. A product exposes `rushUsd` only when its unchecked U.S. retail rush control has matching surcharge amounts in the label, property value and pricing attribute. If a buyer opts in, carry that flag and its dated amount separately. The retailer link always requires selecting the rush checkbox again.

## Prepare a new snapshot

1. Fetch the US public feed at `https://www.moon-audio.com/products.json?limit=250&page=1`, increasing the page number until empty. Save each page as `1.json`, `2.json` and so on in a temporary directory.
2. Fetch the reviewed Dragon product forms at `https://www.moon-audio.com/products/HANDLE` as `HANDLE.html` into another temporary directory. The published pricebook identifies the existing handles. Review the listener records and add any newly supported cable handles before refreshing.
3. Run the extractor with the actual retrieval date and a separate output file.

```sh
python3 src/moon/matcher/offer-data/refresh.py \
  --feed-dir /tmp/moon-us-feed --html-dir /tmp/moon-cable-forms \
  --checked YYYY-MM-DD --output /tmp/candidate-pricebook.json
```

4. Inspect the exclusions and diff against `pricebook.json`. Confirm changed fitting names, prices and outputs against the product and hardware records. Verify changed forms still calculate a native merchandise price plus the selected modifiers. Open representative non-default retail variant URLs and check which options survive. Replace the snapshot after review and run `node --test src/moon/matcher/offer-data/offers.test.mjs` along with the match tests and site release checks.

The extractor rejects unmodeled required properties, conflicting titles or prices, unsupported output wiring, and unavailable rows. For example, a 3.5 mm balanced plug and ordinary stereo 3.5 mm plug need different wiring. A mini-XLR adapter-system connector is also distinct from a full-size four-pin balanced headphone plug. A discounted variant enters the pricebook only when its price is lower than its retail compare-at price, the entire configuration is native, and the form explicitly marks sale items as final sale. That policy travels with the priced build.

A price alone cannot establish compatibility. Model and revision associations, exact ear-side option names and specialist restrictions live in the listener records. If a required option changes, the join with the pricebook must be reviewed before that build is offered again.

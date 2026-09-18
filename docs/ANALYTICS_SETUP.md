# Free measurement and search setup

## Current activation state

The site integration is implemented. Google account setup is still pending: the secure browser sign-in attempt did not complete. No Google Analytics measurement ID or Search Console ownership token has been supplied. Empty settings intentionally keep analytics and its consent prompt inactive. Do not describe the property as connected or collecting data until the steps below are complete.

The public sitemap and robots.txt work independently of Google account access. The privacy page describes the actual activation state.

## Chosen services

- Google Analytics 4 standard: traffic sources, page visits, and useful actions for consenting visitors.
- Google Search Console: search queries, search clicks, indexing status, and sitemap submission. No extra visitor-tracking script.
- No paid product, ad pixel, tag-manager container, session replay, or additional analytics vendor is installed. Cloudflare is not required for either integration; keep GitHub Pages and existing DNS.

## Connect Drew's Google account

1. Use an existing GA4 property for drewcleaver.com if one exists. Otherwise create one in Drew's account, with America/Chicago reporting time and USD currency. Standard GA4 is free. Account terms, if prompted, must be handled by Drew; do not accept them implicitly.
2. Create or select its Web data stream for `https://drewcleaver.com`. **Turn enhanced measurement off** before activating this code. The site explicitly sends its own page views and action events; automatic form, outbound-link, and download tracking would add unnecessary data and duplicates.
3. Keep Google signals, advertising personalization, user-provided data collection, and advertising account links off. Use the shortest suitable event-data retention (two months to start). No user ID or form-value collection is configured.
4. Copy the Web stream Measurement ID, beginning `G-`. Put that public ID in the fallback value for `googleAnalyticsId` in `src/config/integrations.ts`, or supply `PUBLIC_GA_MEASUREMENT_ID` at build time. It is not a password or an API secret. Do not add credentials to this public repository.
5. Add a Search Console URL-prefix property for `https://drewcleaver.com/` in the same owner's account. Choose HTML tag verification; put only the tag's `content` value in `googleSiteVerification` (or `PUBLIC_GOOGLE_SITE_VERIFICATION`). This verifies this URL prefix without DNS changes. Existing ownership can be reused; never overwrite someone else's token blindly.
6. Build and publish. In Search Console, verify ownership and submit `https://drewcleaver.com/sitemap.xml`. The sitemap contains the six intended public pages. The unlisted pilot, shared previews, and disabled writing are omitted; their noindex behavior stays intact. robots.txt permits crawlers to read noindex tags.
7. With permission for one diagnostic visit, allow analytics and verify a page_view in GA4 Realtime/DebugView. Confirm the G-ID and destination account. Then verify a scheduling click and a contact-card download. These are clicks, not completed appointments or confirmed native contact saves. Do not send a real test inquiry without owner authorization.
8. Mark `generate_lead` as a GA4 key event if desired. It means Formspree accepted the request, not verified inbox delivery. Do not classify `schedule_click` as a completed booking.

No Google account property, ownership verification, Realtime receipt, or key-event configuration is claimed by a passing local test.

## Visitor choice and data boundaries

Basic consent mode: no Google script, preconnect, or event request until an explicit opt-in (or a saved, unexpired opt-in). Both buttons have equal emphasis. The footer reopens preferences. Withdrawing disables collection immediately and removes accessible GA cookies; changing a choice in another tab stops collection in this tab. The local preference expires after 180 days. If storage is blocked, the choice applies to the current page only.

Do Not Track and Global Privacy Control keep analytics off. Google advertising consent remains denied, and Google signals/personalization are disabled in the tag configuration. Consent-based counts necessarily omit some visitors and are not a complete server traffic log.

Only the allowlisted public pages load Google Analytics. The builder and shared-preview page never initialize it, even with a previously saved opt-in. No uploaded résumé, draft URL fragment, form value, contact email, message, budget, or private answer enters an analytics event. Search Console ownership tokens are rendered only on the homepage.

The script sends sanitized page locations and origin-only referrers. Only known UTM values are retained: sources reddit/linkedin/instagram/business_card/email, media social/organic_social/qr/email/referral, and campaigns profile/business_card/introduction. Extend these allowlists deliberately when adding campaigns; never put personal details in tags. Arbitrary query parameters and fragments are excluded from the configured page location.

| Event | Meaning |
| --- | --- |
| page_view | One view of an eligible page after consent |
| schedule_click | A click through to Drew's Calendly |
| contact_card_download | A click on the contact-card file |
| resume_download | A click on the résumé PDF |
| email_click | An email-link click; no address or message payload |
| inquiry_click | A click into the inquiry page |
| social_click | A LinkedIn or Instagram click, using only the fixed network name |
| generate_lead | Formspree accepted an inquiry request |

## Social links

- Reddit: `https://drewcleaver.com/?utm_source=reddit&utm_medium=social&utm_campaign=profile`
- LinkedIn: `https://drewcleaver.com/?utm_source=linkedin&utm_medium=social&utm_campaign=profile`
- Instagram: `https://drewcleaver.com/hello/?utm_source=instagram&utm_medium=social&utm_campaign=profile`
- Printed QR: retain `https://drewcleaver.com/hello` as already agreed. Untagged visits to this page cannot all be identified as card scans.

## Sources

- https://support.google.com/analytics/answer/9304153
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://developers.google.com/tag-platform/security/guides/consent
- https://developers.google.com/tag-platform/security/guides/privacy
- https://support.google.com/webmasters/answer/9008080
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

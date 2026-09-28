# Bounded public-site release — September 28, 2026

Ready for owner review; not approved for publishing. The current task supersedes older blanket deployment approvals. Merge to main only after Drew's final review; main automatically publishes via the existing GitHub Pages workflow.

Scope: /, /about/, /services/, /contact/, /hello/, and shared navigation/contact data. Existing homepage, biography, advisory invitation, optional proposals, green/ivory design, public destinations and other routes remain intact. No new writing routes or unlisted-page work.

Changes:
- Protect newer inquiry edits from being erased by an earlier request's successful response.
- Reject whitespace-only names/messages while keeping category and budget optional.
- Expose pending state and focus the completion message for keyboard/screen-reader users.
- Distinguish provider acceptance from inbox delivery; preserve text on HTTP, network, and timeout failures and explain possible duplicate submissions after an uncertain timeout.
- Name the /hello navigation destination “Contact card”; retain the permanent URL and button order.
- Give the longer navigation label room before switching to desktop navigation, allow the header to wrap, and protect contact-card layout against long text.

Verification:
- npm run build: passed, including existing repository regression/privacy gates. These gates do not authorize or implement changes to other routes.
- node --test scripts/public-contact.test.mjs: seven tests passed covering validation/prefill, optional fields, duplicate suppression, unchanged-input reset, in-flight edits, HTTP/network/abort failure retention and retry, route/link/download consistency, vCard CRLF/line limits/yearless birthday/location/email/social/booking links, and PDF signature.
- Live résumé and vCard return HTTP 200 and match the built files byte for byte.
- Existing public résumé text inspected: correct public email/location and no phone field. vCard retains July 17 without a year and excludes phone and résumé.
- Live homepage/contact-card inspected. Current About, Services and Contact content compared against source.
- Live Calendly destination verified: Drew Cleaver → Phone Chat (no video needed), 30 minutes, date picker with available September 28–30 dates. No booking created.
- Responsive CSS reviewed for 320/390/768/1440 px breakpoints. Browser rendering of changed pages is NOT verified: supervised preview starts, but browser navigation is blocked with ERR_BLOCKED_BY_CLIENT. No unsupported substitute browser or external preview deployment used.
- Review preview uses the actual built public pages/CSS and embedded assets. Its form is deliberately simulated; it does not transmit inquiries. This is not evidence of actual provider acceptance or inbox delivery.

Remaining owner checks: review narrow/desktop appearance in the supplied preview; import the vCard on a phone (including yearless birthday and links), open the résumé/email action, and submit one clearly labeled live test after publishing to verify receipt in the intended inbox. Successful HTTP responses alone are not delivery confirmation.

Rollback: revert the release merge on main and allow the same Pages workflow to rebuild. No DNS, provider, billing, or audience changes.

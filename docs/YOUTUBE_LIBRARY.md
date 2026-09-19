# YouTube library

`/youtube/` is a static, responsive collection using the existing site design. It is initially unlisted, noindex, and empty because Drew has not yet supplied his saved videos. Do not infer favorites from his interests or prior assistant recommendations. It has no YouTube account connection or automatic synchronization.

## Populate the collection

1. Obtain the public/unlisted playlist, selected video links, or user-provided export intended for publication. Deduplicate by YouTube video ID. An export may contain private history: only use the requested collection.
2. Verify title, creator, duration if available, and embedding availability. Use `unknown` when availability has not been confirmed; `unavailable` shows only the native link. Playback can change or vary by visitor, so the player always offers a direct YouTube link.
3. Add entries to `src/data/youtube.ts`. Their array order is the curated order. `addedOn` is the library date. Topics generate their own filters; an unknown duration is omitted from watch-time filters and sorts last by length.
4. Write concise original summaries from the actual video, transcript, or Drew's substantive notes. Include the basis and source URL. Do not summarize a title or thumbnail as though the video was watched. Leave `summary` absent when the content is unavailable.
5. `context` is Drew's own supplied or approved reason for saving the video. Omit it if unknown. Keep the video's claims separate from established facts, and distinguish interest from endorsement.
6. Build, inspect the populated page, and publish through the existing GitHub Pages flow. Review navigation/indexing once there is a collection to browse.

## Behavior

- Search covers titles, creators, topics, summaries, takeaways, and context, ignoring case and common accents. Topic and watch-time filters combine with search.
- Native YouTube links, summaries, and expandable notes work without JavaScript. Interactive controls appear only when their script initializes.
- The privacy-enhanced YouTube player loads only when “Watch here” is selected. No autoplay is requested. Closing the accessible native dialog removes the iframe and stops playback; focus returns to the opening button.
- Thumbnails load from YouTube when entries exist. Privacy-enhanced playback is not a promise of no data collection. Do not claim that nothing contacts YouTube before a click.
- No API key, OAuth flow, paid service, account data, or third-party player package is required.

References: [YouTube embedding help](https://support.google.com/youtube/answer/171780), [YouTube iframe reference](https://developers.google.com/youtube/iframe_api_reference).

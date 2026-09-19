# YouTube library

`/youtube/` is a static, responsive collection using the existing site design. It is unlisted and noindex. Drew supplied seven Watch Later screenshots on September 19, 2026, containing 48 distinct selections. The page preserves their order. Do not infer additional favorites from his interests or prior assistant recommendations. It has no YouTube account connection or automatic synchronization.

## Populate the collection

1. Obtain the public/unlisted playlist, selected video links, or user-provided export or screenshots intended for publication. Deduplicate by YouTube video ID. An export may contain private history: only use the requested collection.
2. Verify title, creator, duration if available, and embedding availability. Use `unknown` when availability has not been confirmed; `unavailable` shows only the native link. Playback can change or vary by visitor, so the player always offers a direct YouTube link.
3. Add entries to `src/data/youtube.ts`. Their array order is the curated order. `addedOn` is the library date. Topics generate their own filters; an unknown duration is omitted from watch-time filters and sorts last by length.
4. Write concise original summaries from the actual video, transcript, or Drew's substantive notes. Include the basis and source URL. Do not summarize a title or thumbnail as though the video was watched. When only the description, chapters, or listing is accessible, write an overview limited to that source and use the matching basis. The page labels these as Overview, reserving TL;DW for content-grounded summaries. Leave `summary` absent if even that evidence is unavailable.
5. `context` is Drew's own supplied or approved reason for saving the video. Omit it if unknown. Keep the video's claims separate from established facts, and distinguish interest from endorsement.
6. Build, inspect the populated page, and publish through the existing GitHub Pages flow. Review navigation/indexing once there is a collection to browse.

## Behavior

- Search covers titles, creators, topics, summaries, takeaways, and context, ignoring case and common accents. Topic and watch-time filters combine with search.
- Native YouTube links, summaries, and expandable notes work without JavaScript. Interactive controls appear only when their script initializes.
- The privacy-enhanced YouTube player loads only when “Watch here” is selected. No autoplay is requested. Closing the accessible native dialog removes the iframe and stops playback; focus returns to the opening button.
- Thumbnails load from YouTube when entries exist. Privacy-enhanced playback is not a promise of no data collection. Do not claim that nothing contacts YouTube before a click.
- No API key, OAuth flow, paid service, account data, or third-party player package is required.

References: [YouTube embedding help](https://support.google.com/youtube/answer/171780), [YouTube iframe reference](https://developers.google.com/youtube/iframe_api_reference).

## September 19 collection import

- 48 selections captured; repeated and partially overlapping screenshot rows were deduplicated.
- 47 original uploads verified against title, channel, and screenshot duration. The Dan Burisch channel has two identical-title uploads; the chosen one also matches the visible 48K view count.
- Four films link to their original YouTube Movies editions. Do not promise that they remain free or available in every region.
- Karlous Miller’s “That's Funny” (LOL Network Stand-Up!, 31:19) remains explicitly pending. Other uploads and a different edit from the same channel were not substituted. `pendingSearch` requires a `pending-` ID, disables embedding, and cannot contain a summary. Supply the exact saved URL to resolve it.
- 43 uploads reported `playableInEmbed: true`. The Matrix essay reported false. Tiananmen / Tank Man, The Program, and Bob Lazar returned a sign-in requirement, so they use native links. These metadata observations do not guarantee successful playback for every visitor.
- Two Simon Sinek TL;DW summaries and takeaways use the complete English transcripts on TED. The other 45 notes are concise original overviews of creator descriptions/chapters or the listing, with source links on each card. YouTube's public caption request returned no transcript, so no other transcript access or video watching is claimed.
- No per-video personal reason was supplied. `context` stays absent for all entries; the introductory collection purpose is a restrained paraphrase of Drew’s request.
- Titles and durations reflect the matched uploads and screenshots. `addedOn` is the import date, not when Drew originally saved each video.

See [the source audit](YOUTUBE_SOURCES.md) for exact links and verification status.

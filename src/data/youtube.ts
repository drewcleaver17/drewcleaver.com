export interface SavedVideo {
  id: string;
  title: string;
  channel: string;
  topics: string[];
  addedOn: string; // YYYY-MM-DD; date added to this library, not the upload date.
  durationSeconds?: number;
  embed: 'allowed' | 'unknown' | 'unavailable';
  summary?: {
    text: string;
    takeaways?: string[];
    basis: 'Watched video' | 'Transcript' | 'Drew’s notes';
    sourceUrl: string;
  };
  context?: string; // Drew's supplied or approved reason for saving this video.
}

// Only include videos Drew has selected for this public collection.
// No playlist or video list has been supplied yet. Do not seed inferred favorites.
export const videos: SavedVideo[] = [];

export function validateVideos(entries: SavedVideo[]) {
  const seen = new Set<string>();
  for (const video of entries) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video.id) || seen.has(video.id)) throw new Error('Invalid or duplicate YouTube ID: ' + video.id);
    seen.add(video.id);
    if (!video.title.trim() || !video.channel.trim() || !video.topics.length || video.topics.some(topic => !topic.trim())) throw new Error('Missing video metadata: ' + video.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(video.addedOn) || !Number.isFinite(Date.parse(video.addedOn)) || new Date(video.addedOn).toISOString().slice(0, 10) !== video.addedOn) throw new Error('Invalid date: ' + video.id);
    if (video.durationSeconds !== undefined && (!Number.isInteger(video.durationSeconds) || video.durationSeconds <= 0)) throw new Error('Invalid duration: ' + video.id);
    if (!['allowed', 'unknown', 'unavailable'].includes(video.embed)) throw new Error('Invalid embed status: ' + video.id);
    if (video.summary) {
      if (!video.summary.text.trim() || !['Watched video', 'Transcript', 'Drew’s notes'].includes(video.summary.basis)) throw new Error('Missing summary basis: ' + video.id);
      const source = new URL(video.summary.sourceUrl);
      if (source.protocol !== 'https:' || source.username || source.password) throw new Error('Invalid summary source: ' + video.id);
    }
  }
  return entries;
}

validateVideos(videos);

export function durationLabel(seconds?: number) {
  if (seconds === undefined) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}

// Best-effort extractor for a YouTube videoId from a URL. Handles:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/shorts/ID
//   https://www.youtube.com/embed/ID
// Returns null for anything that doesn't look like one of the above.

export function parseYoutubeVideoId(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null
  let u: URL
  try {
    u = new URL(rawUrl)
  } catch {
    return null
  }

  const host = u.hostname.replace(/^www\./, '')
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0]
    return id || null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = u.searchParams.get('v')
    if (v) return v
    const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/)
    if (m) return m[1]
  }

  return null
}

// `hqdefault.jpg` exists for ~every video; `maxresdefault.jpg` is missing for
// many. Stick with hq for reliability.
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

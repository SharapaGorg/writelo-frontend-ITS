# Landing Page Videos Design

## Overview

Add video content to the landing page with optimized playback, custom player for promo video, and autoplay on scroll for feature videos.

## Current State

- `LandingPromoVideo` — placeholder with mockup UI
- 4 `LandingFeature` sections (Clients, Content, Trends, Images)
- Only `clients.mp4` is connected
- Videos encoded in HEVC (compatibility issues with Firefox)

## Target State

### Video Files Structure

**Original files** (preserved):
```
public/landing/original/
  ├── promo.mp4
  ├── clients.mp4
  ├── content-plan.mp4
  └── image-generator.mp4
```

**Optimized files** (H.264, used in production):
```
public/landing/
  ├── promo.mp4           # H.264, with audio
  ├── poster.png          # Promo video poster (39 KB)
  ├── clients.mp4         # H.264, no audio
  ├── content-plan.mp4    # H.264, no audio
  └── image-generator.mp4 # H.264, no audio
```

### Feature Sections Order

1. Clients — `/landing/clients.mp4`
2. Content — `/landing/content-plan.mp4`
3. **Prompt (new)** — placeholder (video TBD)
4. Trends — placeholder (video TBD)
5. Images — `/landing/image-generator.mp4`

## Components

### New: `useVideoViewport` composable

Purpose: Autoplay videos when they enter viewport, pause when they leave.

```typescript
function useVideoViewport(videoRef: Ref<HTMLVideoElement | null>, options?: {
  threshold?: number      // default: 0.5
  rootMargin?: string     // default: '0px'
})
```

Behavior:
- Uses IntersectionObserver with continuous tracking (not one-shot)
- `threshold: 0.5` — triggers when 50% of video is visible
- Calls `play()` on enter, `pause()` on leave
- Handles cleanup on unmount

### New: `VideoPlayer.vue` component

Purpose: Custom video player for promo video with full controls.

Props:
- `src: string` — video URL
- `poster?: string` — poster image URL

Controls:
- Play/Pause button (center overlay + control bar)
- Progress bar with seek (click/drag)
- Current time / duration display
- Volume button + slider
- Fullscreen toggle

UI:
- Dark theme matching landing (zinc/purple)
- Controls auto-hide after 3s inactivity
- Show on hover/touch
- Smooth transitions

### Modified: `LandingPromoVideo.vue`

Changes:
- Replace native `<video controls>` with `<VideoPlayer>`
- Add `poster="/landing/poster.png"`
- Keep current mockup UI as pre-click state
- Show player on first click

### Modified: `LandingFeature.vue`

Changes:
- Remove manual play/pause on click
- Remove play button overlay when video exists
- Add `useVideoViewport` integration
- Attributes: `muted loop playsinline preload="none"`

### Modified: `LandingPage.vue`

Changes:
- Add new Prompt feature section after Content
- Update video URLs for existing features

## Localization

New keys:
- `landing.features.prompt.title` — "Улучшение промптов" / "Prompt Enhancement"
- `landing.features.prompt.description` — "Думай о идее, мы сформулируем запрос" / "Focus on your idea, we'll craft the perfect prompt"

## Video Optimization

FFmpeg conversion for all videos:
- Codec: H.264 (libx264) — 100% browser compatibility
- Small videos: strip audio track
- Promo: keep audio track
- Preserve original files in `original/` directory

## Loading Strategy

1. `poster.png` loads immediately (39 KB)
2. Promo video: `preload="none"`, loads on user click
3. Feature videos: `preload="none"`, load when approaching viewport (`rootMargin: "200px"`)

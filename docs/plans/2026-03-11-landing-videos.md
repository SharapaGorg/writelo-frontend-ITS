# Landing Videos Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optimized video content to landing page with custom player for promo and autoplay on scroll for feature videos.

**Architecture:** Feature videos autoplay when entering viewport (muted, looped). Promo video uses custom player with full controls. All videos converted to H.264 for browser compatibility.

**Tech Stack:** Vue 3, Composables (IntersectionObserver), ffmpeg for video conversion, Tailwind CSS, lucide-vue-next icons.

---

### Task 1: Backup Original Videos

**Files:**
- Create: `public/landing/original/` directory

**Step 1: Create backup directory**

```bash
mkdir -p public/landing/original
```

**Step 2: Copy original videos**

```bash
cp public/landing/promo.mp4 public/landing/original/
cp public/landing/clients.mp4 public/landing/original/
cp public/landing/content-plan.mp4 public/landing/original/
cp public/landing/image-generator.mp4 public/landing/original/
```

**Step 3: Verify backup**

```bash
ls -lh public/landing/original/
```

Expected: 4 files totaling ~32MB

**Step 4: Commit**

```bash
git add public/landing/original/
git commit -m "chore: backup original HEVC videos before conversion"
```

---

### Task 2: Convert Videos to H.264

**Files:**
- Modify: `public/landing/promo.mp4` (H.264 with audio)
- Modify: `public/landing/clients.mp4` (H.264 no audio)
- Modify: `public/landing/content-plan.mp4` (H.264 no audio)
- Modify: `public/landing/image-generator.mp4` (H.264 no audio)

**Step 1: Convert promo video (keep audio)**

```bash
ffmpeg -i public/landing/original/promo.mp4 \
  -c:v libx264 -preset slow -crf 22 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  -y public/landing/promo.mp4
```

**Step 2: Convert clients video (no audio)**

```bash
ffmpeg -i public/landing/original/clients.mp4 \
  -c:v libx264 -preset slow -crf 23 \
  -an \
  -movflags +faststart \
  -y public/landing/clients.mp4
```

**Step 3: Convert content-plan video (no audio)**

```bash
ffmpeg -i public/landing/original/content-plan.mp4 \
  -c:v libx264 -preset slow -crf 23 \
  -an \
  -movflags +faststart \
  -y public/landing/content-plan.mp4
```

**Step 4: Convert image-generator video (no audio)**

```bash
ffmpeg -i public/landing/original/image-generator.mp4 \
  -c:v libx264 -preset slow -crf 23 \
  -an \
  -movflags +faststart \
  -y public/landing/image-generator.mp4
```

**Step 5: Verify conversions**

```bash
for f in public/landing/*.mp4; do
  echo "=== $f ==="
  ffprobe -v quiet -show_streams "$f" 2>/dev/null | grep codec_name | head -2
done
```

Expected: All show `codec_name=h264` for video stream

**Step 6: Check file sizes**

```bash
ls -lh public/landing/*.mp4
```

**Step 7: Commit**

```bash
git add public/landing/*.mp4
git commit -m "chore: convert videos to H.264 for browser compatibility"
```

---

### Task 3: Create useVideoViewport Composable

**Files:**
- Create: `composables/useVideoViewport.ts`

**Step 1: Create the composable**

```typescript
// composables/useVideoViewport.ts
import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

interface UseVideoViewportOptions {
  threshold?: number
  rootMargin?: string
}

export function useVideoViewport(
  videoRef: Ref<HTMLVideoElement | null>,
  options: UseVideoViewportOptions = {}
) {
  const { threshold = 0.5, rootMargin = '0px' } = options
  const isInViewport = ref(false)

  let observer: IntersectionObserver | null = null

  function setupObserver() {
    if (!videoRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewport.value = entry.isIntersecting

          if (entry.isIntersecting) {
            videoRef.value?.play().catch(() => {
              // Autoplay blocked - ignore silently
            })
          } else {
            videoRef.value?.pause()
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(videoRef.value)
  }

  onMounted(() => {
    if (videoRef.value) {
      setupObserver()
    }
  })

  watch(videoRef, (newRef) => {
    if (observer) {
      observer.disconnect()
    }
    if (newRef) {
      setupObserver()
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    isInViewport
  }
}
```

**Step 2: Verify file created**

```bash
cat composables/useVideoViewport.ts
```

**Step 3: Commit**

```bash
git add composables/useVideoViewport.ts
git commit -m "feat: add useVideoViewport composable for autoplay on scroll"
```

---

### Task 4: Create VideoPlayer Component

**Files:**
- Create: `components/landing/VideoPlayer.vue`

**Step 1: Create VideoPlayer component**

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-vue-next'

interface Props {
  src: string
  poster?: string
}

const props = defineProps<Props>()

const videoRef = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const isPlaying = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const showControls = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)

let hideControlsTimeout: ReturnType<typeof setTimeout> | null = null

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (!videoRef.value) return

  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

function toggleMute() {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

function setVolume(e: Event) {
  if (!videoRef.value) return
  const target = e.target as HTMLInputElement
  const newVolume = parseFloat(target.value)
  videoRef.value.volume = newVolume
  volume.value = newVolume
  isMuted.value = newVolume === 0
}

function seek(e: MouseEvent) {
  if (!videoRef.value || !duration.value) return

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

async function toggleFullscreen() {
  if (!containerRef.value) return

  if (!document.fullscreenElement) {
    await containerRef.value.requestFullscreen()
    isFullscreen.value = true
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

function onTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
}

function onLoadedMetadata() {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

function onPlay() {
  isPlaying.value = true
}

function onPause() {
  isPlaying.value = false
}

function onMouseMove() {
  showControls.value = true
  resetHideControlsTimeout()
}

function resetHideControlsTimeout() {
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
  hideControlsTimeout = setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false
    }
  }, 3000)
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative bg-black rounded-2xl overflow-hidden group"
    @mousemove="onMouseMove"
    @mouseleave="showControls = false"
  >
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      class="w-full aspect-video"
      playsinline
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="onPlay"
      @pause="onPause"
      @click="togglePlay"
    />

    <!-- Center play button (shown when paused) -->
    <div
      v-if="!isPlaying"
      class="absolute inset-0 flex items-center justify-center cursor-pointer"
      @click="togglePlay"
    >
      <div class="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 hover:scale-110 transition-all">
        <Play class="w-8 h-8 text-white ml-1" />
      </div>
    </div>

    <!-- Controls bar -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300"
      :class="showControls || !isPlaying ? 'opacity-100' : 'opacity-0'"
    >
      <!-- Progress bar -->
      <div
        class="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer group/progress"
        @click="seek"
      >
        <div
          class="h-full bg-purple-500 rounded-full relative"
          :style="{ width: `${progress}%` }"
        >
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
        </div>
      </div>

      <!-- Controls row -->
      <div class="flex items-center gap-4">
        <!-- Play/Pause -->
        <button
          class="text-white hover:text-purple-400 transition-colors"
          @click="togglePlay"
        >
          <Pause v-if="isPlaying" class="w-5 h-5" />
          <Play v-else class="w-5 h-5" />
        </button>

        <!-- Time -->
        <span class="text-white/80 text-sm font-mono">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>

        <div class="flex-1" />

        <!-- Volume -->
        <div class="flex items-center gap-2">
          <button
            class="text-white hover:text-purple-400 transition-colors"
            @click="toggleMute"
          >
            <VolumeX v-if="isMuted || volume === 0" class="w-5 h-5" />
            <Volume2 v-else class="w-5 h-5" />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="volume"
            class="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            @input="setVolume"
          />
        </div>

        <!-- Fullscreen -->
        <button
          class="text-white hover:text-purple-400 transition-colors"
          @click="toggleFullscreen"
        >
          <Minimize v-if="isFullscreen" class="w-5 h-5" />
          <Maximize v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
```

**Step 2: Verify file created**

```bash
head -20 components/landing/VideoPlayer.vue
```

**Step 3: Commit**

```bash
git add components/landing/VideoPlayer.vue
git commit -m "feat: add VideoPlayer component with custom controls"
```

---

### Task 5: Update LandingFeature Component

**Files:**
- Modify: `components/landing/LandingFeature.vue`

**Step 1: Import useVideoViewport**

At line 5, add import:

```typescript
import { useVideoViewport } from '~/composables/useVideoViewport'
```

**Step 2: Setup video autoplay**

After line 34 (`const videoRef = ref<HTMLVideoElement | null>(null)`), add:

```typescript
// Setup autoplay when in viewport
useVideoViewport(videoRef, { threshold: 0.5 })
```

**Step 3: Remove manual play/pause logic**

Delete the `toggleVideo` function (lines 36-46).

**Step 4: Update video element attributes**

Replace the video element (lines 64-74) with:

```vue
<video
  v-if="videoUrl"
  ref="videoRef"
  :src="videoUrl"
  :poster="poster"
  class="w-full h-full object-cover"
  loop
  muted
  playsinline
  preload="none"
/>
```

**Step 5: Remove play overlay for videos**

Replace the `<template v-if="!isPlaying">` block (lines 77-95) with:

```vue
<!-- Poster/Placeholder (only when no video) -->
<template v-if="!videoUrl">
  <img
    v-if="poster"
    :src="poster"
    alt=""
    class="w-full h-full object-cover"
  />
  <div
    v-else
    class="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900"
  />

  <!-- Play overlay (placeholder only) -->
  <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
    <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
      <Play class="w-6 h-6 text-white ml-0.5" />
    </div>
  </div>
</template>
```

**Step 6: Remove unused refs and imports**

Remove `isPlaying` ref (no longer needed) and remove click handler from video container.

**Step 7: Verify changes**

```bash
yarn dev
```

Open http://localhost:3000, scroll to features section, verify videos autoplay.

**Step 8: Commit**

```bash
git add components/landing/LandingFeature.vue
git commit -m "feat: add autoplay on scroll to LandingFeature videos"
```

---

### Task 6: Update LandingPromoVideo Component

**Files:**
- Modify: `components/landing/LandingPromoVideo.vue`

**Step 1: Import VideoPlayer**

At line 2, add:

```typescript
import VideoPlayer from '~/components/landing/VideoPlayer.vue'
```

**Step 2: Add hasStarted state**

After line 17 (`const isPlaying = ref(false)`), add:

```typescript
const hasStarted = ref(false)

function startVideo() {
  hasStarted.value = true
}
```

**Step 3: Replace video element with VideoPlayer**

Replace lines 39-49 (the video element) with:

```vue
<VideoPlayer
  v-if="hasStarted"
  :src="videoUrl"
  :poster="poster"
  class="w-full"
/>
```

**Step 4: Update preview click handler**

Change line 55 `@click="playVideo"` to `@click="startVideo"`.

**Step 5: Update condition for preview**

Change line 53 `v-if="!isPlaying"` to `v-if="!hasStarted"`.

**Step 6: Remove unused playVideo function and videoRef**

Delete lines 17-25 (isPlaying, videoRef, playVideo function).

**Step 7: Verify changes**

```bash
yarn dev
```

Open http://localhost:3000, click on promo video, verify custom player appears.

**Step 8: Commit**

```bash
git add components/landing/LandingPromoVideo.vue
git commit -m "feat: integrate VideoPlayer into LandingPromoVideo"
```

---

### Task 7: Add Prompt Feature Section

**Files:**
- Modify: `components/landing/LandingPage.vue`
- Modify: `i18n/locales/ru.json`
- Modify: `i18n/locales/en.json`

**Step 1: Add localization keys (ru.json)**

In `i18n/locales/ru.json`, inside `landing.features` object (after line 79), add:

```json
"prompt": {
  "title": "Думай об идее — мы напишем запрос",
  "description": "AI сам улучшит твой промпт. Просто опиши что нужно, остальное сделаем мы."
},
```

**Step 2: Add localization keys (en.json)**

In `i18n/locales/en.json`, inside `landing.features` object (after line 79), add:

```json
"prompt": {
  "title": "Focus on the idea — we'll write the prompt",
  "description": "AI enhances your prompt automatically. Just describe what you need."
},
```

**Step 3: Add Prompt section to LandingPage.vue**

After line 48 (Content feature), add:

```vue
<!-- Feature: Prompt -->
<LandingFeature
  :title="t('landing.features.prompt.title')"
  :description="t('landing.features.prompt.description')"
  direction="left"
/>
```

**Step 4: Update video URLs for existing features**

Update Content feature (line 44-48):

```vue
<LandingFeature
  :title="t('landing.features.content.title')"
  :description="t('landing.features.content.description')"
  video-url="/landing/content-plan.mp4"
  direction="right"
/>
```

Update Images feature (line 57-61):

```vue
<LandingFeature
  :title="t('landing.features.images.title')"
  :description="t('landing.features.images.description')"
  video-url="/landing/image-generator.mp4"
  direction="right"
/>
```

**Step 5: Verify all features render**

```bash
yarn dev
```

Open http://localhost:3000, verify:
- 5 feature sections visible
- Clients, Content, Images have videos
- Prompt, Trends show placeholders

**Step 6: Commit**

```bash
git add components/landing/LandingPage.vue i18n/locales/ru.json i18n/locales/en.json
git commit -m "feat: add Prompt feature section and connect remaining videos"
```

---

### Task 8: Update LandingPromoVideo to Use Poster

**Files:**
- Modify: `components/landing/LandingPromoVideo.vue`

**Step 1: Set default poster and videoUrl**

Update props defaults (lines 10-13):

```typescript
const props = withDefaults(defineProps<Props>(), {
  videoUrl: '/landing/promo.mp4',
  poster: '/landing/poster.png'
})
```

**Step 2: Verify poster displays**

```bash
yarn dev
```

Open http://localhost:3000, verify poster.png shows before clicking play.

**Step 3: Commit**

```bash
git add components/landing/LandingPromoVideo.vue
git commit -m "feat: set default poster and video URL for promo section"
```

---

### Task 9: Final Verification

**Step 1: Full page test**

```bash
yarn dev
```

Checklist:
- [ ] Promo video shows poster.png
- [ ] Clicking promo starts custom player with controls
- [ ] Promo player has: play/pause, progress bar, volume, fullscreen
- [ ] Feature videos autoplay when scrolled into view
- [ ] Feature videos pause when scrolled out of view
- [ ] Feature videos are muted and looped
- [ ] Prompt and Trends show placeholder (no video)
- [ ] All 5 feature sections display in correct order
- [ ] Works in Chrome, Firefox, Safari

**Step 2: Check video codec**

```bash
ffprobe -v quiet -show_streams public/landing/promo.mp4 | grep codec_name
```

Expected: `codec_name=h264` and `codec_name=aac`

**Step 3: Build test**

```bash
yarn build
```

Expected: Build completes without errors.

**Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: landing video adjustments"
```

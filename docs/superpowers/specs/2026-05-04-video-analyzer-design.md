# Video analyzer module — design

**Date:** 2026-05-04
**Author:** brainstorming session (radolyn-dev)
**Status:** approved (spec); plan pending

## Summary

New workspace-scoped module `lib-modules/video-analyzer` powered by the new
`/workspaces/{id}/short-video-analyses/*` API (see `docs/v1-4.05.json` and
`docs/backend-requests/changes.md`). Purpose: paste a YouTube Shorts / TikTok /
Instagram Reels URL → get a structured AI analysis (transcription, summary,
tags, structure, hooks, funnel, improvements, diagnostics).

The legacy `lib-modules/reels-research` module and the `/app/trends` page
stay untouched (different feature, backend not ready).

## Out of scope

Explicitly **not** part of this delivery:

- Global migration of `user.limits` (removed from `GET /user`) to the new
  `/workspaces/{id}/limits` endpoint for other modules. This module fetches
  limits locally for its own gating.
- Drag-and-drop of an analysis result onto the calendar / "create post draft
  from analysis" flow.
- Server-side search / filter / pagination of history beyond a single
  `limit=50` page.
- Export of an analysis (PDF / Markdown).
- Strict frontend URL validation — only a light regex check for known
  hosts; the backend remains the source of truth.

## Routing & sidebar

**Routes (Nuxt file-based):**

- `pages/app/video-analyzer/index.vue` → main screen (history grid + input bar).
- `pages/app/video-analyzer/[id].vue` → detail view of a single analysis.

Both pages are thin wrappers around module components, matching the
convention used by `pages/app/assistant.vue` etc.

**Sidebar entry:** added to `lib-modules/app-layout/composables/useAppLayout.ts`
after the `trends` item:

```ts
{
  id: 'video-analyzer',
  icon: 'scan-search',
  label: 'Анализ видео',
  route: '/app/video-analyzer',
  requiresPermission: 'canAnalyzeShortVideos',
}
```

Icon `ScanSearch` (Lucide) is the default; alternatives if it doesn't fit
visually: `Wand2`, `Microscope`, `Film`. The icon is registered in
`AppSidebar.vue`'s `iconComponents` map.

## UX flow

### Main screen states

1. **Idle / grid** — top bar holds the input, "Analyze" button, and a limits
   chip (`Осталось N анализов`). Below: a grid of history cards (platform,
   URL, status, date). Empty state: a hero block prompting the first run.

2. **Submitting** — clicking "Analyze" disables the button (spinner) and
   immediately triggers a history refetch so the new run shows up as a
   `processing` card. The user can keep browsing the grid or click into the
   processing card.

3. **SSE end success** → `GET ?url=...` to fetch the freshly created
   analysis → auto-navigate to `/app/video-analyzer/<analysisId>`. History
   refetches in the background. Limits refetch.

4. **SSE end fail** → toast with a humanized message (table below) + the
   history card flips to `failed`. No auto-navigation; the user stays on the
   grid.

### Detail page states

The detail route receives an `id`, but the backend's detail endpoint is
`GET ?url=...` (URL-keyed, not id-keyed). The store maintains an
`urlIndex: Record<analysisId, originalUrl>` so a deep-link / page refresh
flow is:

1. If id is in `urlIndex` → `GET ?url=cachedUrl`.
2. Otherwise → `GET /history` first, find the entry by id, then
   `GET ?url=...`.
3. If still not found → 404 empty state with a back button.

By status:

- `completed` → render the 8 sections (table below).
- `processing` → spinner + "Анализ в процессе…", poll `/history` every 5s
  until the matching id flips to `completed` or `failed`, then navigate /
  re-render.
- `failed` → error block with humanized `errorCode` + "Попробовать снова"
  button (re-runs the SSE for the same URL).

## File layout

```
lib-modules/video-analyzer/
├── components/
│   ├── VideoAnalyzerPage.vue           # main screen (grid + top bar)
│   ├── VideoAnalysisDetail.vue         # detail
│   ├── AnalysisInputBar.vue            # URL input + button + limits chip
│   ├── AnalysisHistoryGrid.vue         # grid of cards
│   ├── AnalysisHistoryCard.vue         # one card
│   ├── AnalysisStatusBadge.vue         # processing / completed / failed pill
│   ├── PlatformIcon.vue                # yt / tt / ig glyph
│   ├── RawJsonViewer.vue               # collapsed pretty-printed JSON fallback
│   └── sections/
│       ├── TranscriptionSection.vue
│       ├── SummarySection.vue
│       ├── TagsSection.vue
│       ├── StructureSection.vue
│       ├── HooksSection.vue
│       ├── FunnelSection.vue
│       ├── ImprovementsSection.vue
│       └── DiagnosticsSection.vue
├── composables/
│   ├── useVideoAnalyzer.ts             # SSE submit, history, current detail, polling
│   └── useAnalysisLimits.ts            # local hook on /workspaces/{id}/limits
├── helpers/
│   ├── api.ts                          # VideoAnalyzerApiController
│   ├── sectionShape.ts                 # tiny shape-detection utils
│   ├── humanizeError.ts                # errorCode → user-facing string
│   └── youtubeThumbnail.ts             # videoId parser → img URL
├── stores/
│   └── videoAnalyzerStore.ts           # Pinia
├── types/
│   └── index.ts                        # mirror DTOs + section shape unions
└── index.ts                             # public exports: VideoAnalyzerPage, VideoAnalysisDetail
```

## API surface

### `ApiAliases` additions (`scripts/shared/types/index.ts`)

```ts
workspaceShortVideoAnalyses        = 'workspaces/{workspaceId}/short-video-analyses'
workspaceShortVideoAnalysesRun     = 'workspaces/{workspaceId}/short-video-analyses/run'
workspaceShortVideoAnalysesHistory = 'workspaces/{workspaceId}/short-video-analyses/history'
workspaceLimits                    = 'workspaces/{workspaceId}/limits'
```

### `VideoAnalyzerApiController` (extends `ApiController`)

```ts
runAnalysis(workspaceId, url): Promise<ReadableStream<Uint8Array>>          // SSE
getAnalysisByUrl(workspaceId, url): Promise<ShortVideoAnalysisDto | null>   // 404 → null
getHistory(workspaceId, offset, limit): Promise<ShortVideoAnalysisHistoryItemDto[]>
getLimits(workspaceId): Promise<WorkspaceLimitsDto>
```

The SSE handler reuses the parsing pattern from
`lib-modules/assistant/composables/useAssistantChat.ts`
(`getReader` + `TextDecoder` + `data: <json>` line parser). Only the
`response_end` action is consumed; any other actions are silently ignored
for forward-compat.

### Store (`videoAnalyzerStore.ts`, Pinia)

```ts
state:
  history: ShortVideoAnalysisHistoryItemDto[]
  detailCache: Record<analysisId, ShortVideoAnalysisDto>
  urlIndex: Record<analysisId, string /* originalUrl */>
  inFlightUrls: Set<string>            // optimistic processing cards
  historyLoadedAt: number | null
  isHistoryLoading: boolean

actions:
  loadHistory(wid, force = false)      // 30 s cache
  refetchHistory(wid)                  // bypass cache + ?_t= cache-bust per CLAUDE.md
  loadDetail(wid, analysisId)          // resolves URL via urlIndex (or refetches history first)
  startRun(wid, url)                   // SSE → on success: refetchHistory + loadDetail; on fail: refetchHistory + toast
  cancelRun(url)                       // cancels the active SSE reader
```

### Polling

`useVideoAnalyzer.pollIfProcessing(analysisId)` lives in the composable: a
`watch` on the cached history entry's status starts a
`setInterval(refetchHistory, 5000)` when status is `processing`. When the
status flips to `completed`, the composable additionally calls
`loadDetail(wid, analysisId)` so the page can re-render with content.
The interval tears down on any status change away from `processing` or on
component unmount.

### Limits hook

`useAnalysisLimits()` keeps a local cached `WorkspaceLimitsDto` and exposes
`shortVideoAnalysisRequests`. Refetched on mount and after each successful
run (single in-flight protection).

## Detail rendering — defensive

`ShortVideoAnalysisDto` exposes 7 sections typed as `JsonElement | null` —
the spec does not pin the shape. Each `*Section.vue` runs a small shape
detector and renders a curated layout when matched, falling back to a
`RawJsonViewer` (collapsed pretty-printed JSON) when the shape is unknown.

| Section | Best-guess shape | Curated render | Fallback |
|---|---|---|---|
| Transcription | `string` \| `{language?, text?, segments?:[{start,end,text}]}` | timeline with `mm:ss` chips when `segments` is present; paragraph for `text` / string | RawJson |
| Summary | `string` \| `{text}` | markdown paragraph | RawJson |
| Tags | `string[]` \| `[{name, score?}]` | `Badge` chips, sorted by score desc when present | RawJson |
| Structure | `[{title, description, timestamp?}]` | numbered vertical list | RawJson |
| Hooks | `[{type?, text}]` \| `string[]` | 1–2 column cards, `type` as a small label | RawJson |
| Funnel | `{awareness?, interest?, decision?, action?}` \| `[{stage, text}]` | 4-step vertical funnel viz | RawJson |
| Improvements | `[{suggestion, severity?}]` \| `string[]` | bullet list, severity → coloured chip | RawJson |
| Diagnostics | `string` (top-level field on the DTO, not `JsonElement`) | monospaced block, collapsed by default | — |

Detection lives in `helpers/sectionShape.ts` — plain `typeof` /
`Array.isArray` / key checks. No external validator (no zod) for a
single-module concern.

The detail header carries a meta bar: `PlatformIcon` + `originalUrl` (with
"open in new tab"), humanized `analyzedAt`, and small `model` /
`analyzerVersion` chips.

## History card thumbnails

- **YouTube** → parse `videoId` from `normalizedUrl` (and fallback to
  `originalUrl`), render `https://img.youtube.com/vi/{id}/hqdefault.jpg`.
  No auth needed.
- **TikTok / Instagram** → no public thumbnail without API. Render a large
  `PlatformIcon` on a platform-tinted background as the cover.
- **Failed** runs → grey cover with `AlertTriangle` icon overlay regardless
  of platform.

## Limits gating

- Mount `VideoAnalyzerPage` → `useAnalysisLimits().load(wid)`.
- Chip in `AnalysisInputBar`: `Осталось N анализов`. Colour: amber when
  `left ≤ 3`, red when `left === 0`.
- `left === 0` → input + button disabled, message "Лимит исчерпан,
  обновится <resetAt humanized>" with a "Перейти к тарифам" link to
  `/app/plans`.
- Refetch limits after a successful SSE run.

## Permissions

Uses `useWorkspacePermissions()` from `lib-modules/workspaces`. Two new
flags must be added there:

- `canAnalyzeShortVideos` — read level. Drives sidebar visibility and view
  access (history grid + detail page).
- `canRunShortVideoAnalysis` — mutate level. Drives input + button enabled
  state. When false (e.g., Viewer): controls disabled with tooltip
  "Только владелец, админ или редактор могут запускать анализ".

Sidebar item carries `requiresPermission: 'canAnalyzeShortVideos'`. The
`PermissionFlag` type in `lib-modules/app-layout/types` is extended to
include both new flags.

## Error handling

| `errorCode` / message | UI text |
|---|---|
| `social_video_unsupported_url` | «Ссылка не поддерживается. Доступны YouTube Shorts, TikTok, Instagram Reels.» |
| `error-short-video-analysis-not-allowed` | «У вашей роли нет прав запускать анализ.» |
| `error-short-video-analysis-limit-reached` | «Лимит анализов исчерпан.» (+ link to plans) |
| `short_video_analysis_failed` | «Анализатор не справился с этим видео. Попробуйте другую ссылку.» |
| any other | backend `message` if present, else «Не удалось выполнить анализ.» |

Toasts via the existing `scripts/features/utils/toater.ts`
(`toastError` / `toastForbidden` / `toastRateLimit`).

## Open questions

None blocking. Two minor items can be settled during implementation
without spec impact:

1. Final sidebar icon (`ScanSearch` is the default; alternatives listed
   above).
2. Exact section ordering on the detail page (proposed top-to-bottom:
   Summary → Hooks → Structure → Funnel → Tags → Improvements →
   Transcription → Diagnostics — heaviest reading material at the bottom).

## References

- `docs/v1-4.05.json` — OpenAPI for new endpoints (`ShortVideoAnalysisDto`,
  `ShortVideoAnalysisHistoryItemDto`, `WorkspaceLimitsDto`).
- `docs/backend-requests/changes.md` — change summary.
- `lib-modules/assistant/composables/useAssistantChat.ts` — SSE parsing
  reference.
- `lib-modules/app-layout/composables/useAppLayout.ts` — sidebar registry.
- `scripts/shared/api/controller.ts` — `ApiController` base class.

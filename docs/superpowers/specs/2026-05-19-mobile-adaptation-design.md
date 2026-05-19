# Mobile adaptation of the app (spec)

**Status:** draft — design approved, plan TBD
**Date:** 2026-05-19
**Scope:** authenticated app under `/app/*`. Landing (`/`, `/ru`, `/en`, etc.) is out of scope.

## Goal

Every authenticated page is usable on a phone (`< 768px`). No "open on desktop" walls.

## Non-goals

- Tablet-specific layout. From 768px and up the existing desktop layout is unchanged.
- Native-app gestures (swipe-to-back, edge swipes, haptics).
- Rewriting the resizable splitter logic in editor/calendar. We disable it on mobile, not adapt it.
- Touch-optimising every desktop control (drag handles, hover-only affordances). We accept that some power-user interactions are desktop-only.

## Breakpoint

- Mobile mode kicks in at `viewport < 768px` (Tailwind `md:` boundary).
- One source of truth: `composables/useViewport.ts` exposing reactive `isMobile` via `window.matchMedia('(max-width: 767px)')`.
- Use `useViewport().isMobile` in `<script>` only where we need to *not render* a tree (heavy panels with API calls, expensive subscriptions). For pure visual show/hide, use Tailwind `md:hidden` / `hidden md:flex` directly.

## Global shell

### `AppLayout.vue`

```
desktop (≥md):   [ AppSidebar | <slot /> ]
mobile  (<md):   [ <slot /> ]
                 [ MobileBottomTabBar (fixed bottom) ]
```

- `AppSidebar` is `hidden md:flex` on mobile (kept in DOM only when desktop).
- `<main>` gets `pb-14` on mobile (room for the bar) via `pb-14 md:pb-0`.

### `MobileBottomTabBar.vue` (new — `lib-modules/app-layout/components/`)

- `fixed inset-x-0 bottom-0 z-40`, height ~56px, `bg-background border-t border-border`, plus `pb-[env(safe-area-inset-bottom)]`.
- 4 slots: **Calendar / Video Analyzer / Trends / ⋯** (the 4th opens `MoreSheet`).
- Active tab: `text-brand` + 2px top accent bar. Inactive: `text-muted-foreground`.
- Hidden on `/auth/*` and any page without `layout: app`.
- Visible at `< md` only (`md:hidden`).

> Note: Assistant and Editor are intentionally *not* in the bottom bar — they live in `MoreSheet`. This is the user's product call (browse-y entries Calendar/Trends/Video Analyzer beat creation/chat entries for mobile real estate). Worth revisiting after usage data.

### `MoreSheet.vue` (new — `lib-modules/app-layout/components/`)

- Triggered by the `⋯` tab. `Sheet side="bottom"`, full viewport height, slide-up.
- Contents top-to-bottom:
  1. **Subscription block** — full Subscription chip (Free/Pro/etc.), tappable → `/app/plans`.
  2. **LimitsPanel** — current usage block.
  3. **PublicationsPanel** — recent posts list.
  4. **Nav list** — all sidebar items NOT in the bottom bar, in order: Assistant, Editor, Workspaces, Team (if business plan), Activity (if business + permission), Profile, Settings, Plans.
  5. **Login button** (if `!isAuthenticated`).
  6. **"Связаться" telegram link** (current bottom of `AppSidebar`).
- Closes on item tap (router push).

### `AppNavbar.vue` on mobile

- Breadcrumbs hidden (`hidden md:flex`).
- Left: page title (last breadcrumb segment) — passed via existing `breadcrumbs` prop, just render last item as title on mobile.
- Center/Right: existing `WorkspaceSelector`, compact form (avatar + chevron, no name text). Dropdown becomes a full-width `Sheet` with search.
- Right edge: page-specific action buttons (see per-page table — e.g. Calendar's `Accounts` / `Filters`, Assistant's `History`).

## Per-page strategy

### Single-column pages — no layout work

Padding/font tweaks only. Walk through to verify in browser, but no structural change:

- `/app/video-analyzer`, `/app/trends`, `/app/activity`, `/app/profile`, `/app/plans`, `/app/settings`, `/app/workspaces`, `/app/team`

### Multi-panel pages — hybrid by panel role

**Peer panels** (equally important, mutually exclusive on mobile) → tab strip at top of content area.
**Config/nav panels** (accounts pickers, filters) → `Sheet` from navbar button.

| Page | Desktop layout | Mobile layout |
|---|---|---|
| **Assistant** | Chat (flex-1) + History (right) | Peer-tabs: **Chat / History** at top of content area. History panel renders inline when its tab is active. |
| **Calendar** | Navbar + Accounts (left) + Calendar grid + Right resizable panel (filters/preview) | Calendar grid full-width. Navbar buttons: **Accounts** → `Sheet side="left"`; **Filters** → `Sheet side="right"`. Right resizable panel: `v-if="!isMobile"` (not rendered). |
| **Editor** (`/app/editor`) | Accounts + Editor + Preview (drag-resize split) | Peer-tabs: **Edit / Preview**. **Accounts** → `Sheet side="left"` from navbar. interact.js drag-resize: `v-if="!isMobile"`. |
| **Reels Script** (`/app/reels-script`) | Same as Editor | Same as Editor — same `ContentEditorLayout`, both gain the mobile tab pattern automatically. |

### `TabStrip.vue` (new — `components/molecules/`)

- Segmented control for 2-3 peer tabs. One component used by Assistant, Editor, Reels-Script.
- Styled to brand tokens. Sticky top of content area on mobile (`md:hidden`).
- Props: `tabs: { id, label, icon? }[]`, `v-model: string`.

## Reusable primitives

| Item | Status |
|---|---|
| `components/ui/sheet` | ✅ exists (used for all drawer-style panels) |
| `components/ui/drawer` | ✅ exists (kept available if a use-case wants bottom-sheet with handle) |
| `lib-modules/app-layout/components/MobileBottomTabBar.vue` | 🆕 |
| `lib-modules/app-layout/components/MoreSheet.vue` | 🆕 |
| `composables/useViewport.ts` | 🆕 |
| `components/molecules/TabStrip.vue` | 🆕 |

## Edge cases / known pains

- **Subscription chip + LimitsPanel + PublicationsPanel** currently live inside `AppSidebar`. On mobile, the full versions move into `MoreSheet`. A short chip variant (icon + colour state) lives in the top navbar so users see plan state at a glance.
- **WorkspaceSelector**: many users have 10+ workspaces. On mobile it becomes a full-width `Sheet` with search, not a dropdown.
- **Editor drag-resize splitter** (interact.js): disabled entirely on mobile. No attempt to translate to touch gestures.
- **localStorage panel widths** (calendar right panel, editor split): leave the writes/reads untouched — they're guarded behind `!isMobile` rendering. Desktop behaviour unchanged.
- **Modal/dialog sizing**: existing `Dialog`/`AlertDialog` usages should be audited for `max-w-*` that breaks below 400px. Out of explicit scope, but if a page-level audit reveals problems, fix in the same phase as the page.
- **Safe area**: bottom bar adds `env(safe-area-inset-bottom)` padding so it doesn't sit under the iPhone home indicator.

## Phased rollout

Per the "phase ≥ one page per gate" rule. Each phase ends with a browser test by the user before commit.

1. **Phase 1 — infra & shell**: `useViewport`, `MobileBottomTabBar`, `MoreSheet`, `AppLayout` restructure, `AppNavbar` mobile-mode (title + compact workspace selector + breadcrumb hide). After this, ALL pages are reachable on mobile via the new shell, even if their content is still ugly.
2. **Phase 2 — single-column page sweep**: visual pass over video-analyzer, trends, activity, profile, plans, settings, workspaces, team. Padding/font/overflow fixes only.
3. **Phase 3 — Assistant**: introduce `TabStrip`, wire Chat/History tabs. First peer-tabs implementation.
4. **Phase 4 — Calendar**: Accounts + Filters sheets, hide right resizable panel.
5. **Phase 5 — Editor + Reels-Script**: shared `ContentEditorLayout`, gains Edit/Preview tabs + Accounts sheet. Single phase since both pages use the same layout component.

Polling/cache-bust, no-auto-commit, sidebar-as-source-of-truth, and "don't gate workspace modal" rules from memory still apply.

## Open questions

None blocking. Items to revisit post-launch:

- Should Assistant be promoted into the bottom bar after usage data? (Currently in MoreSheet by user call.)
- Does the editor's "Preview" really need to be a peer tab, or would a "preview" button on the toolbar be enough? Decide during Phase 5 implementation, defer-able.

# Editor-Calendar Integration Design

**Date:** 2026-03-28
**Status:** Approved

## Problem

When selecting a post in the calendar and clicking "Edit", the user is taken to the content editor, but:
1. Post data is not loaded (TODO in code)
2. Header always shows "New X" instead of "Edit X"
3. Scheduled date/time is not visible for Reel content type
4. Content types are inconsistent between calendar and editor

## Solution

Minimal changes approach focusing on editor UX improvements.

## Changes

### 1. Header (ContentEditorLayout.vue)

**Current:** `New Post` / `New Reel` / `New Story`

**New layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← │ Edit Post │ 28 марта 2026, 14:00        [📅]   │
└─────────────────────────────────────────────────────┘
```

- Left: back button
- Center: "New Post" or "Edit Post" based on postId presence
- Right: date/time + date picker button
- If no date: "Дата не выбрана [📅]"

### 2. Content Types (types/index.ts)

```typescript
// Before
export type ContentType = 'post' | 'story' | 'reel' | 'carousel'

// After
export type ContentType = 'post' | 'story' | 'reel'
```

Carousel is just a post with multiple images, not a separate type.

### 3. PostPreviewPanel.vue

- Remove "Carousel" button from type selector
- Remove Scheduled Date section (moved to header)

### 4. Store (contentEditorStore.ts)

Add:
- `isEditMode: boolean` - computed from postId presence
- `postId: string | null` - current post ID being edited
- `loadDraft(post)` - converts CalendarPost to ContentDraft (stub until API ready)

### 5. Editor Page ([[postId]].vue)

- Call `loadPost(postId)` when postId is present in route
- Function is a stub logging TODO until API is implemented

## Files to Change

| File | Changes |
|------|---------|
| `ContentEditorLayout.vue` | Header: New/Edit + date/time + date picker |
| `types/index.ts` | Remove `carousel` from ContentType |
| `PostPreviewPanel.vue` | Remove Carousel from selector, remove Scheduled Date section |
| `contentEditorStore.ts` | Add `isEditMode`, `postId`, `loadDraft()` |
| `useContentEditor.ts` | Export new methods |
| `[[postId]].vue` | Call `loadPost()` when postId exists |

## Out of Scope

- API implementation for loading/saving posts (backend not ready)
- Full type unification between calendar and editor modules
- Status synchronization (idea/draft/ready/published)

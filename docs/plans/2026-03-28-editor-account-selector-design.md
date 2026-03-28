# Editor Account Selector Design

## Problem

Account switching is implemented in the calendar (filtering), but when editing a post in `/app/editor`, there's no UI to select which account the post belongs to. The `accountId` is hardcoded as `'default-account'`.

## Requirements

1. Single account selection per post (not multi-select like calendar filter)
2. Sidebar UI similar to calendar's `AccountsSidebar`
3. Position: leftmost panel (Accounts | Chat | Preview)
4. Accounts sourced from current project context

## Architecture

### Shared State via Pinia Store

```
                     +---------------------------------------------+
                     |              Pinia Store                    |
                     |         contentProjectStore                 |
                     |  +------------------------------------+     |
                     |  | selectedProjectId                  |     |
                     |  | projects[]                         |     |
                     |  | currentProject (computed)          |     |
                     |  | selectProject()                    |     |
                     |  +------------------------------------+     |
                     +------------------+----------------------+----+
                                        |                      |
                    +-------------------+                      +-------------------+
                    v                                                              v
         useContentCalendar()                                          useContentEditor()
           (uses store)                                                  (uses store)
```

### New Store: `lib-modules/content-calendar/stores/contentProjectStore.ts`

Extracts from `useContentCalendar`:
- `selectedProjectId`
- `projects` (reactive array)
- `currentProject` (computed)
- `selectProject()`

### Changes to `useContentCalendar`

Refactor to use the new store for project state. Keep calendar-specific state local:
- `activeAccountIds` (filter state)
- `activeStatuses`
- `activeTags`
- `selectedDate`
- `selectedPostId`

### Changes to `useContentEditor`

Add account selection state:
- Import `useContentProjectStore`
- Add `selectedAccountId` to `ContentDraft`
- Expose `currentProjectAccounts` computed
- Add `selectAccount(accountId)` method

### Changes to `ContentEditorLayout.vue`

Add accounts sidebar slot/section:

```
+------------------------------------------------------------------+
|                            Header                                 |
+----------+------------------------------+-------------------------+
| Accounts |   Left Panel (Chat/Images)  |  Right Panel (Preview)  |
| Sidebar  |                             |                         |
+----------+------------------------------+-------------------------+
```

## UI Component

Reuse `AccountsSidebar` from `content-calendar` with new prop:

```typescript
interface Props {
  accounts: SocialAccount[]
  activeAccountIds: string[]      // For multi-select (calendar)
  selectedAccountId?: string      // For single-select (editor)
  singleSelect?: boolean          // true = radio-style, false = toggle
}
```

**Calendar mode** (`singleSelect: false`, default):
- Multiple accounts can be active
- Toggle behavior (click toggles on/off)
- Minimum 1 account must remain selected

**Editor mode** (`singleSelect: true`):
- Only one account selected at a time
- Radio-button behavior (click selects, others deselect)

## Data Flow

1. User opens editor from calendar
2. `useContentEditor` reads `currentProject` from shared store
3. If creating new post: first account pre-selected
4. User can change account via sidebar
5. `ContentDraft.accountId` updates
6. Post preview reflects selected account's network

## Files to Modify

1. **Create:** `lib-modules/content-calendar/stores/contentProjectStore.ts`
2. **Modify:** `lib-modules/content-calendar/composables/useContentCalendar.ts`
3. **Modify:** `lib-modules/content-calendar/components/AccountsSidebar.vue`
4. **Modify:** `lib-modules/content-editor/stores/contentEditorStore.ts`
5. **Modify:** `lib-modules/content-editor/composables/useContentEditor.ts`
6. **Modify:** `lib-modules/content-editor/components/ContentEditorLayout.vue`
7. **Modify:** `pages/app/editor/[[postId]].vue`

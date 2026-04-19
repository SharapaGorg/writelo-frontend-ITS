# API Migration Summary: Neovision → Writelo

**Date:** 2026-04-14
**Status:** Completed (core infrastructure)

## What Was Done

### Phase 1: Foundation (Types & API Infrastructure)

**Created `scripts/shared/types/workspace.ts`:**
- `WorkspaceDto`, `WorkspaceRole`, `WorkspaceFeature`
- `AuthSessionDto` (new auth response format with `{ token, user }`)
- `UserDto`, `UserLimitsDto`
- `PagedResponse<T>` wrapper for paginated endpoints
- `InitUploadRequest/Response`, `FinalizeUploadRequest/Response`
- `GeneratedImageDto`, `GenerateImageRequest`, `EditImageRequest`
- `ConversationListItemDto`, `ConversationDetailDto`, `MessageDto`
- `StorageFileDto`, `DownloadUrlResponse`

**Updated `scripts/shared/types/index.ts`:**
- Added workspace-scoped `ApiAliases` enum entries
- Added `buildUrl(template, params)` helper function

**Created `lib-modules/workspaces/composables/useWorkspaceContext.ts`:**
- Singleton composable for workspace context
- `currentWorkspaceId`, `workspaces`, `isReady`
- `initialize()`, `setCurrentWorkspace()`, `requireWorkspaceId()`, `clear()`

---

### Phase 2: Auth System Migration

**Updated `lib-modules/web-auth/types/api.ts`:**
- Changed all auth response types to use `AuthSessionDto`

**Updated `lib-modules/web-auth/helpers/api.ts`:**
- Updated endpoints to use new `ApiAliases`

**Updated `composables/user.ts`:**
- Cookie rename: `neovision-ai-bot-auth-token` → `writelo-auth-token`
- Added legacy cookie clearing
- Integrated workspace context initialization from `user.primaryWorkspaceId`

---

### Phase 3: Workspaces Module

**Created `lib-modules/workspaces/` module:**
```
lib-modules/workspaces/
├── components/           # (placeholder for future UI)
├── composables/
│   ├── useWorkspaceContext.ts
│   └── useWorkspaces.ts
├── stores/
│   └── workspacesStore.ts
├── helpers/
│   └── api.ts           # WorkspacesApiController
├── types/
│   └── index.ts
└── index.ts             # Public exports
```

**WorkspacesApiController methods:**
- `getWorkspaces()`, `getWorkspace(id)`
- `createWorkspace(data)`, `updateWorkspace(id, data)`, `deleteWorkspace(id)`

---

### Phase 4: Conversations Migration

**Updated `scripts/shared/api/controller.ts`:**
- Added workspace-scoped methods:
  - `getWorkspaceConversations(workspaceId, offset, limit)`
  - `getWorkspaceConversation(workspaceId, id)`
  - `createWorkspaceConversation(workspaceId, title?)`
  - `deleteWorkspaceConversation(workspaceId, id)`
  - `sendWorkspaceMessage(workspaceId, conversationId, text, files?)`
  - `getWorkspaceImage(workspaceId, imageId)`
  - `getStorageDownloadUrl(workspaceId, objectId)`

**Updated `stores/conversations.ts`:**
- Added `adaptConversation()` function for API format conversion
- Updated `init()` to use `getWorkspaceConversations()`
- Added workspace context integration

---

### Phase 5: File Upload Migration

**Created `lib-modules/shared/services/uploadService.ts`:**
- Two-step upload process: init → S3 → finalize
- `uploadFile(file, onProgress?)` with progress tracking
- `uploadFiles(files, onProgress?)` for batch uploads
- `getDownloadUrl(objectId)` for signed URLs

**Created `lib-modules/shared/index.ts`:**
- Exports upload service

---

### Phase 6: Image Generation Migration

**Updated `lib-modules/imageGenerator/composables/useImageGenerator.ts`:**
- Updated `generate()` to use workspace-scoped API
- Uses `uploadFile()` for img2img source images
- Added `pollForResult()` for async generation

**Updated `lib-modules/imageGenerator/composables/useImageHistory.ts`:**
- Added `adaptImage()` for new `GeneratedImageDto` format
- Updated to use `getWorkspaceImageHistory()`
- Updated `getImageUrl()` to use signed URLs from `result.url`

---

### Phase 7: Config Migration

**Updated `scripts/shared/types/common.ts`:**
- Removed: `ModelType`, `ResponseStyleType`
- Removed from `FeatureType`: `projects`, `responseStyle`, `model`
- Added to `FeatureType`: `workspaces`, `calendar`, `socialAccounts`
- Updated `ConfigType`:
  - Removed: `models`, `responseStyles`, `projectsConfig`
  - Added: `workspacePresets`, `filesConfig`
- Added types: `RolePromptDto`, `WorkspacePresetDto`, `WorkspacePresetsConfig`, `FilesConfig`, `ImagesConfig`

**Updated `composables/settings.ts`:**
- Removed model/responseStyle state and methods
- Updated `DEMO_CONFIG` to new structure
- Simplified `saveChanges` → `saveLanguage`
- Removed `getLlm()`, `getResponseStyle()`

**Updated `scripts/shared/api/controller.ts`:**
- Simplified `saveSettings(language)` - removed model/style params
- Added `updateUserRole(roleId)`

**Updated `components/templates/SettingsSection.vue`:**
- Removed model/responseStyle selection UI
- Simplified to just language selection

---

### Phase 8: Environment & Cleanup

**Updated `nuxt.config.ts`:**
- Changed dev fallback URL: `nv2.radolyn.com` → `staging.writelo.io`
- Changed production URL: `writelo.io` → `api.writelo.io`
- Updated telegram bot username for staging

**Updated `CLAUDE.md`:**
- Updated API section with workspace-scoped methods
- Added `useWorkspaceContext()` documentation
- Added file upload service documentation
- Added workspaces module to Lib-Modules Reference
- Marked projects module as DEPRECATED

---

## Files Created

1. `scripts/shared/types/workspace.ts`
2. `lib-modules/workspaces/index.ts`
3. `lib-modules/workspaces/types/index.ts`
4. `lib-modules/workspaces/composables/useWorkspaceContext.ts`
5. `lib-modules/workspaces/composables/useWorkspaces.ts`
6. `lib-modules/workspaces/stores/workspacesStore.ts`
7. `lib-modules/workspaces/helpers/api.ts`
8. `lib-modules/shared/index.ts`
9. `lib-modules/shared/services/uploadService.ts`

## Files Modified

1. `scripts/shared/types/index.ts` - Added ApiAliases, buildUrl
2. `scripts/shared/types/common.ts` - Updated ConfigType
3. `scripts/shared/api/controller.ts` - Added workspace-scoped methods
4. `composables/user.ts` - Cookie migration, workspace init
5. `composables/settings.ts` - Simplified to language only
6. `stores/conversations.ts` - Workspace-scoped fetching
7. `lib-modules/web-auth/types/api.ts` - AuthSessionDto
8. `lib-modules/web-auth/helpers/api.ts` - Updated endpoints
9. `lib-modules/imageGenerator/composables/useImageGenerator.ts`
10. `lib-modules/imageGenerator/composables/useImageHistory.ts`
11. `components/templates/SettingsSection.vue`
12. `nuxt.config.ts`
13. `CLAUDE.md`

---

## What's NOT Done (Deferred)

1. **UI Migration from Projects to Workspaces** - The `lib-modules/projects/` module is still used by:
   - `components/organisms/Navbar.vue`
   - `components/molecules/ClientSelector.vue`
   - `lib-modules/conversations/components/DialogsSection.vue`
   - `lib-modules/conversations/components/DialogsContentBlock.vue`
   - `lib-modules/conversations/components/DialogButton/ui/MenuDialogButton.vue`
   - `pages/app/conversations/[id].vue`

2. **New Features** (Calendar, Social Accounts, Posts, Tags) - Deferred per user request

3. **Streaming Messages Migration** - The `sendWorkspaceMessage` method is ready but UI components may need updates

---

## Key Architecture Changes

| Old | New |
|-----|-----|
| Global endpoints | Workspace-scoped (`/workspaces/{id}/...`) |
| Auth returns `{ token }` | Auth returns `{ token, user }` |
| `/projects` | `/workspaces` |
| `POST /files` (FormData) | Init → S3 → Finalize |
| `models`, `responseStyles` in config | Removed (server-side selection) |
| Cookie: `neovision-ai-bot-auth-token` | Cookie: `writelo-auth-token` |

---

## Next Steps

1. Test the migration with staging backend
2. Gradually migrate UI components from projects to workspaces
3. Remove projects module when fully replaced
4. Implement new features (Calendar, Social) when ready

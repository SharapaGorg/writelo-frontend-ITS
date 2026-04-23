# CLAUDE.md

This file provides guidance to Claude Code when working with the frontend codebase.

## Hard Rules

### Styling
- NEVER write plain CSS. Use only Tailwind classes
- For complex components use shadcn-vue from `components/ui/`
- Use `cn()` from `lib-modules/utils.ts` to merge classes

### API
- ALWAYS use `ApiController` from `scripts/shared/api/controller.ts`
- NEVER write raw fetch/axios calls
- For domain-specific APIs, extend ApiController (see WorkspacesApiController, AuthApiController)
- Use `ApiAliases` enum for endpoints
- Most API calls are workspace-scoped — use `useWorkspaceContext()` to get the current workspace ID

### Utilities
- BEFORE writing any utility, check "Utilities Reference" section below
- Especially: date formatting, validation, toasts, UUID generation

### Components
- Follow Atomic Design: atoms → molecules → organisms → templates
- Reuse components from `components/ui/` (shadcn-vue)
- New features go in `lib-modules/`, not scattered files

## Import Rules

### Aliases
- `~/` — project root (preferred)
- `@/` — alternative, also project root

### Correct imports

```typescript
// From global code into module
import { useWorkspaceContext } from '~/lib-modules/workspaces'
import { ApiController } from '~/scripts/shared/api/controller'
import { Button } from '~/components/ui/button'
import { useUserController } from '~/composables/useUserController'

// Inside a module — relative paths
import { useImageGeneratorStore } from '../stores'
import type { ImageHistoryItem } from '../types'
import { toastImageCopySuccess } from '../helpers/toaster'
```

### WRONG imports (never do this)
```typescript
import { something } from 'lib-modules/module'      // missing ~/
import { something } from '@lib-modules/module'     // no such alias
import { something } from 'app-modules/module'      // doesn't exist
import { something } from '~/lib-modules/workspaces/stores/workspacesStore' // don't reach into internals
```

### Import from modules — only via index.ts
```typescript
// Correct — via public API
import { useWorkspaceContext, useWorkspaces } from '~/lib-modules/workspaces'

// Wrong — direct import of internals
import { useWorkspacesStore } from '~/lib-modules/workspaces/stores/workspacesStore'
```

## Code Organization

### Where to put new code

| Type of code | Location |
|--------------|----------|
| New feature (UI + logic + state) | `lib-modules/new-feature/` |
| Component for single feature | `lib-modules/feature/components/` |
| Component shared across modules | `components/` (atoms/molecules/organisms) |
| UI primitives (shadcn) | `components/ui/` |
| Global state | `composables/` or `stores/` |
| General utility | `lib-modules/shared/` |

### Rules
- **All new code** → goes in `lib-modules/`
- **`components/`** — only for reusable cross-module components
- **`scripts/`** — legacy, do NOT add new code there
- **When in doubt** → put in module, extract later if needed

### New module structure
```
lib-modules/my-feature/
├── components/          # Vue components
├── composables/         # Hooks (useMyFeature.ts)
├── stores/              # Pinia store
├── helpers/             # Utilities, API, toasts
├── types/               # TypeScript types
└── index.ts             # Public API (exports)
```

## Utilities Reference

### Formatting
| Function | Location | Purpose |
|----------|----------|---------|
| `eraseConversationTitle(title, limit?)` | `lib-modules/conversations/.../formatting.ts` | Truncate to 20 chars with ellipsis |
| `isToday(date)` | `scripts/features/conversations/formatting.ts` | Check if date is today |
| `isWithinLastDays(date, days)` | same | Check if within last N days |
| `getConversationGroup(datetime)` | same | Categorize: today/7d/30d/year |
| `getChatsGroupsFormationArray(conversations)` | same | Group conversations by time |

**Example — Grouping conversations:**
```typescript
import { getChatsGroupsFormationArray } from '~/scripts/features/conversations/formatting'

const grouped = getChatsGroupsFormationArray(conversations)
// Returns: [
//   { key: 'today', conversations: [...] },
//   { key: 'last_7_days', conversations: [...] },
//   { key: '2024', conversations: [...] }
// ]
```

### Device Detection
| Function | Location | Purpose |
|----------|----------|---------|
| `isMobile()` | `scripts/features/utils/index.ts` | Detect mobile device |
| `isIOS()` | same | Detect iOS |
| `isAndroid()` | same | Detect Android |
| `getScreenSize()` | same | Get size category (sm/md/lg/xl) |
| `isInTelegramApp` | `scripts/features/utils/telegram.ts` | Check if in Telegram Mini App |

### General
| Function | Location | Purpose |
|----------|----------|---------|
| `generateUUID()` | `scripts/features/utils/index.ts` | Generate UUID v4 |
| `generateRandomHash(length?)` | `scripts/shared/utils.ts` | Random hex string |
| `downloadFile(data, filename, mimeType)` | `scripts/features/utils/index.ts` | Trigger file download |
| `cn(...classes)` | `lib-modules/utils.ts` | Merge Tailwind classes |

### Toasts
All in `scripts/features/utils/toaster.ts`:

| Function | Purpose |
|----------|---------|
| `toastError(message)` | Show error |
| `toastCopyClipboard(t_)` | Success: copied |
| `toastGenericError()` | Generic error |
| `toastFeatureUnavailable(t_)` | Feature restricted |
| `toastChangesSavedSuccess(t_)` | Changes saved |
| `toastDeleteSuccess(t_)` | Deletion success |

Image toasts in `lib-modules/imageGenerator/helpers/toaster.ts`:
- `toastImageCopySuccess(t_)`, `toastImageDownloadSuccess(t_, format)`, etc.

## API Reference

### How to make API calls
ALWAYS use ApiController, NEVER raw fetch/axios:

```typescript
import { ApiController } from '~/scripts/shared/api/controller'
import { useWorkspaceContext } from '~/lib-modules/workspaces'

const api = new ApiController()
const user = await api.getMe()

// Most API calls require workspace ID
const { requireWorkspaceId } = useWorkspaceContext()
const workspaceId = requireWorkspaceId()
const conversations = await api.getWorkspaceConversations(workspaceId, 0, 20)
```

### Main methods (ApiController)

| Method | Purpose |
|--------|---------|
| `getMe()` | Get current user |
| `getConfig()` | Get app config (subscriptions, roles, workspacePresets) |
| `getWorkspaceConversations(workspaceId, offset, limit)` | List conversations |
| `getWorkspaceConversation(workspaceId, id)` | Get conversation with messages |
| `createWorkspaceConversation(workspaceId, title?)` | Create new conversation |
| `deleteWorkspaceConversation(workspaceId, id)` | Delete conversation |
| `sendWorkspaceMessage(workspaceId, convId, text, files?)` | Send message (streaming) |
| `generateWorkspaceImage(workspaceId, request)` | Generate image |
| `editWorkspaceImage(workspaceId, request)` | Edit image |
| `getWorkspaceImageHistory(workspaceId, offset, limit)` | Image history |
| `initUpload(workspaceId, request)` | Initialize file upload |
| `finalizeUpload(workspaceId, request)` | Finalize file upload |
| `saveSettings(language)` | Save language preference |
| `createPayment(subscriptionId, provider)` | Create payment |

### File Upload (Two-Step Process)
```typescript
import { uploadFile } from '~/lib-modules/shared'

// Simple upload
const result = await uploadFile(file)
// result: { storageObjectId, type, ... }

// Upload with progress
const result = await uploadFile(file, (progress) => {
  console.log(`${progress.phase}: ${progress.percent}%`)
})
```

### Extended controllers

**WorkspacesApiController** (`lib-modules/workspaces/helpers/api.ts`):
- `getWorkspaces()`, `createWorkspace(data)`, `deleteWorkspace(id)`
- `updateWorkspace(id, data)`, `getWorkspace(id)`

**AuthApiController** (`lib-modules/web-auth/helpers/api.ts`):
- `signupEmail()`, `signinEmail()`, `signinGoogle()`, `signinTelegram()`
- `verifyEmail()`, `forgotPassword()`, `resetPassword()`
- `linkGoogle()`, `linkTelegram()`, `unlinkProvider()`

### Extending API for new domain
```typescript
// lib-modules/my-feature/helpers/api.ts
import { ApiController, RequestMethod } from '~/scripts/shared/api/controller'
import { buildUrl, ApiAliases } from '~/scripts/shared/types'

export class MyFeatureApiController extends ApiController {
  getItems(workspaceId: string) {
    const url = buildUrl(ApiAliases.workspaceItems, { workspaceId })
    return this.request(url)
  }

  createItem(workspaceId: string, data: CreateItemInput) {
    const url = buildUrl(ApiAliases.workspaceItems, { workspaceId })
    return this.request(url, RequestMethod.POST, data)
  }
}
```

## Lib-Modules Reference

Each module is self-contained with components, composables, store, and types.
Import only via `index.ts` public API.

### conversations
**Purpose:** Chat interface, messages, dialogs

**Exports:**
- Components: `Message`, `MessagesSection`, `SendMessageSection`, `DialogButton`, `AttachMediaButton`
- Composable: `useCurrentConversation()` → `addMessage()`, `makeNewChat()`, `clearConversation()`
- Store: `useCurrentConversationStore()` → messages, title state
- Types: `MessageType`, `ConversationType`, `ShortConversationType`

### imageGenerator
**Purpose:** txt2img/img2img generation

**Exports:**
- Components: `ImageGeneratorInput`, `ImageGeneratorOutput`, `ImageHistorySlider`
- Composable: `useImageGenerator()` → `generate()`, `attachImage()`, `downloadImage()`, `copyImage()`
- Composable: `useImageHistory()` → `fetchImages()`, `addToHistory()`
- Store: `useImageGeneratorStore()` → prompt, ratio, outputFile, isGenerating
- Constants: `ACCEPTED_IMAGE_TYPES`, `MAX_FILE_SIZE` (10MB)

**Example:**
```typescript
const { prompt, generate, isGenerating, outputFile } = useImageGenerator()

prompt.value = "A cat in space"
await generate()
// outputFile.value contains the generated image
```

### workspaces
**Purpose:** Workspace context and management (replaces projects)

**Exports:**
- Composable: `useWorkspaceContext()` → `currentWorkspaceId`, `requireWorkspaceId()`, `initialize()`, `clear()`
- Composable: `useWorkspaces()` → `createWorkspace()`, `updateWorkspace()`, `deleteWorkspace()`, `selectWorkspace()`
- Store: `useWorkspacesStore()` → workspaces, currentWorkspace
- Types: `WorkspaceDto`, `CreateWorkspaceRequest`, `UpdateWorkspaceRequest`

**Example:**
```typescript
import { useWorkspaceContext } from '~/lib-modules/workspaces'

const { requireWorkspaceId } = useWorkspaceContext()
const workspaceId = requireWorkspaceId()
// Use workspaceId for workspace-scoped API calls
```

### shared
**Purpose:** Common utilities and services

**Exports:**
- Service: `uploadFile(file, onProgress?)` → Upload files with progress tracking
- Service: `uploadFiles(files, onProgress?)` → Upload multiple files
- Service: `getDownloadUrl(objectId)` → Get signed download URL

### profile
**Purpose:** User account, subscription, gifts

**Exports:**
- Components: `ProfilePage`, `ProfileBadge`
- Composable: `useProfileI18n()` → profile-scoped translations

### web-auth
**Purpose:** Email/OAuth authentication (non-Telegram)

**Exports:**
- Components: `AuthForm`, `GoogleButton`, `TelegramLoginButton`, `YandexAuthButton`
- API: `AuthApiController` (see API Reference)
- Types: `TelegramAuthData`, `OAuthProvider` enum

### onboarding
**Purpose:** Guided tour for new users

**Exports:**
- Composable: `useOnboarding()` → `start()`, `finish()`, `next()`, `previous()`

## State Management

### Global Composables
| Composable | Purpose | Key API |
|------------|---------|---------|
| `useUserController()` | Auth, user data | `user`, `isLoggedIn`, `getToken()`, `logout()` |
| `useWorkspaceContext()` | Current workspace | `currentWorkspaceId`, `requireWorkspaceId()`, `initialize()` |
| `useSettings()` | App settings | `config`, `getLanguage()`, `saveLanguage()` |
| `useEnv()` | Current environment | `currentDialog`, `attachedFiles` |
| `eventBus` | Cross-component events | `emit()`, `on()`, `off()` |

### Event Bus
```typescript
import { eventBus } from '~/composables/eventBus'

// Emit event
eventBus.emit('dialog:titleUpdated', { id, title })

// Listen
eventBus.on('dialog:titleUpdated', (data) => { ... })

// Cleanup in onUnmounted
eventBus.off('dialog:titleUpdated', handler)
```

## Common Patterns

### Streaming Messages
```typescript
const {requireWorkspaceId} = useWorkspaceContext()
const stream = await api.sendWorkspaceMessage(requireWorkspaceId(), convId, text)
const reader = stream.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  // Parse SSE: each line is "data: {...}\n"
  const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
  for (const line of lines) {
    const data: MessageStreamData = JSON.parse(line.slice(6))
    // Server assigns IDs via `request_message_id` / `response_message_id` events.
    // Handle: text_chunk, set_title, response_end, etc.
  }
}
```

### Creating New Module
```typescript
// lib-modules/my-feature/index.ts
export { default as MyComponent } from './components/MyComponent.vue'
export { useMyFeature } from './composables/useMyFeature'
export * from './types'
```

## Development Commands

```bash
# Dev server (local backend)
yarn dev

# Dev server (remote backend)
yarn devo

# Build
yarn build

# Preview
yarn preview
```

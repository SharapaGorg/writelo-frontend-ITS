# Frontend CLAUDE.md Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create comprehensive CLAUDE.md documentation so Claude Code works efficiently with the frontend codebase without re-analyzing the project each time.

**Architecture:** Single CLAUDE.md file (~300-400 lines) with hard rules, reference tables, and code examples. Organized for quick scanning: rules first, then references, then examples.

**Tech Stack:** Markdown documentation for Nuxt 3 + Vue 3 + TypeScript + Tailwind + shadcn-vue project.

---

### Task 1: Create Hard Rules Section

**Files:**
- Modify: `CLAUDE.md` (full rewrite)

**Step 1: Write the Hard Rules section**

Replace entire CLAUDE.md with:

```markdown
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
- For domain-specific APIs, extend ApiController (see ProjectsApiController, AuthApiController)
- Use `ApiAliases` enum for endpoints

### Utilities
- BEFORE writing any utility, check "Utilities Reference" section below
- Especially: date formatting, validation, toasts, UUID generation

### Components
- Follow Atomic Design: atoms → molecules → organisms → templates
- Reuse components from `components/ui/` (shadcn-vue)
- New features go in `lib-modules/`, not scattered files
```

**Step 2: Verify file saved correctly**

Run: `head -40 CLAUDE.md`
Expected: Shows Hard Rules section

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): add hard rules section"
```

---

### Task 2: Add Import Rules Section

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Append Import Rules section**

Add after Hard Rules:

```markdown
## Import Rules

### Aliases
- `~/` — project root (preferred)
- `@/` — alternative, also project root

### Correct imports

```typescript
// From global code into module
import { useProjects } from '~/lib-modules/projects'
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
import { something } from '~/lib-modules/projects/stores/projectsStore' // don't reach into internals
```

### Import from modules — only via index.ts
```typescript
// Correct — via public API
import { useProjects, ProjectTabs, type Project } from '~/lib-modules/projects'

// Wrong — direct import of internals
import { useProjectsStore } from '~/lib-modules/projects/stores/projectsStore'
```
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): add import rules section"
```

---

### Task 3: Add Code Organization Section

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Append Code Organization section**

```markdown
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
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): add code organization section"
```

---

### Task 4: Add Utilities Reference Section

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Append Utilities Reference section**

```markdown
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
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): add utilities reference section"
```

---

### Task 5: Add API Reference Section

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Append API Reference section**

```markdown
## API Reference

### How to make API calls
ALWAYS use ApiController, NEVER raw fetch/axios:

```typescript
import { ApiController } from '~/scripts/shared/api/controller'

const api = new ApiController()
const user = await api.getMe()
```

### Main methods (ApiController)

| Method | Purpose |
|--------|---------|
| `getMe()` | Get current user |
| `getConfig()` | Get app config (models, subscriptions, roles) |
| `getConversations(offset, count)` | List conversations |
| `getConversation(id)` | Get conversation with messages |
| `createConversation(projectId?)` | Create new conversation |
| `deleteConversation(id)` | Delete conversation |
| `sendMessage(convId, text, reqUuid, resUuid)` | Send message (streaming) |
| `editMessage(convId, msgId, text, resId)` | Edit message (streaming) |
| `rerollMessage(convId, resUuid)` | Regenerate response |
| `stopGeneration(convId)` | Stop AI generation |
| `uploadFile(file)` | Upload attachment |
| `shareConversation(id)` | Share conversation |
| `unshareConversation(id)` | Remove share |
| `generateImage(prompt, ratio)` | Generate image |
| `editImage(prompt, sourceImage, ratio)` | Edit image |
| `getImageHistory(offset, limit)` | Image history |
| `saveSettings(lang, style, model)` | Save preferences |
| `createPayment(subscriptionId, provider)` | Create payment |

### Extended controllers

**ProjectsApiController** (`lib-modules/projects/helpers/api.ts`):
- `getProjects()`, `createProject(title)`, `deleteProject(id)`
- `editProject(id, title, instructions)`, `getProjectConversations(id, offset, limit)`

**AuthApiController** (`lib-modules/web-auth/helpers/api.ts`):
- `signupEmail()`, `signinEmail()`, `signinGoogle()`, `signinTelegram()`
- `verifyEmail()`, `forgotPassword()`, `resetPassword()`
- `linkGoogle()`, `linkTelegram()`, `unlinkProvider()`

### Extending API for new domain
```typescript
// lib-modules/my-feature/helpers/api.ts
import { ApiController, RequestMethod } from '~/scripts/shared/api/controller'

export class MyFeatureApiController extends ApiController {
  getItems() {
    return this.request('my-feature/items')
  }

  createItem(data: CreateItemInput) {
    return this.request('my-feature/items', RequestMethod.POST, data)
  }
}
```
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): add API reference section"
```

---

### Task 6: Add Lib-Modules Reference Section

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Append Lib-Modules Reference section**

```markdown
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

### projects
**Purpose:** Organize conversations into projects

**Exports:**
- Components: `ProjectTabs`, `ProjectCreateWindow`
- Composable: `useProjects()` → `createProject()`, `updateProject()`, `deleteProject()`, `selectProject()`
- Composable: `useConversationAssignment()` → assignment mode state
- Store: `useProjectsStore()` → projects, selectedProjectId, modals
- Types: `Project`, `CreateProjectInput`, `UpdateProjectInput`

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
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): add lib-modules reference section"
```

---

### Task 7: Add State Management and Common Patterns Sections

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Append State Management section**

```markdown
## State Management

### Global Composables
| Composable | Purpose | Key API |
|------------|---------|---------|
| `useUserController()` | Auth, user data | `user`, `isLoggedIn`, `getToken()`, `logout()` |
| `useSettings()` | App settings | `settings`, `updateSettings()` |
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
const stream = await api.sendMessage(convId, text, reqUuid, resUuid)
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
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE.md): add state management and common patterns"
```

---

### Task 8: Final Review and Squash (Optional)

**Step 1: Review full CLAUDE.md**

Run: `wc -l CLAUDE.md`
Expected: ~300-400 lines

Run: `cat CLAUDE.md | head -100`
Verify structure looks correct

**Step 2: (Optional) Squash commits into one**

If preferred, squash all CLAUDE.md commits:
```bash
git rebase -i HEAD~7
# Mark all but first as "squash"
# Edit message to: "docs(CLAUDE.md): comprehensive documentation for Claude Code"
```

**Step 3: Done**

CLAUDE.md is complete and ready for use.

---

## Summary

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Hard Rules | `docs(CLAUDE.md): add hard rules section` |
| 2 | Import Rules | `docs(CLAUDE.md): add import rules section` |
| 3 | Code Organization | `docs(CLAUDE.md): add code organization section` |
| 4 | Utilities Reference | `docs(CLAUDE.md): add utilities reference section` |
| 5 | API Reference | `docs(CLAUDE.md): add API reference section` |
| 6 | Lib-Modules Reference | `docs(CLAUDE.md): add lib-modules reference section` |
| 7 | State Management + Patterns | `docs(CLAUDE.md): add state management and common patterns` |
| 8 | Final Review | Optional squash |
